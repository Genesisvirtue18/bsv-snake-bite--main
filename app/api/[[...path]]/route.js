import { v4 as uuidv4 } from 'uuid'
import { NextResponse } from 'next/server'
import { Readable } from 'node:stream'
import { DEFAULT_CONTENT } from '@/lib/defaultContent'
import { DEFAULT_SETTINGS } from '@/lib/defaultSettings'
import { getDb, ROLES, can, signToken, verifyPassword, hashPassword, getUserFromRequest, ObjectId } from '@/lib/auth'
import { exec } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'

// Auto-commit and push content changes to git
async function gitPushContent(content, user) {
  const repoDir = process.cwd()
  const contentFile = join(repoDir, 'content-export.json')
  writeFileSync(contentFile, JSON.stringify(content, null, 2))
  const commitMsg = `cms: content update by ${user?.email || 'admin'} [${new Date().toISOString()}]`
  const cmd = [
    `cd "${repoDir}"`,
    'git add content-export.json',
    `git commit -m "${commitMsg}" --allow-empty`,
    'git push origin main'
  ].join(' && ')
  return new Promise((resolve) => {
    exec(cmd, { env: { ...process.env, GIT_TERMINAL_PROMPT: '0' } }, (err, stdout, stderr) => {
      if (err) console.error('[git-push]', stderr || err.message)
      else console.log('[git-push] pushed:', stdout.trim())
      resolve(!err)
    })
  })
}

export const runtime = 'nodejs'

function cors(response) {
  response.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGINS || '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-password')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  return response
}

export async function OPTIONS() {
  return cors(new NextResponse(null, { status: 200 }))
}

async function ensureContent(db) {
  const existing = await db.collection('site_content').findOne({ id: 'main' })
  if (!existing) {
    await db.collection('site_content').insertOne({ id: 'main', data: DEFAULT_CONTENT, updatedAt: new Date() })
    return DEFAULT_CONTENT
  }
  // Merge new keys (e.g. footer, sections) onto existing content if they're missing
  const merged = { ...DEFAULT_CONTENT, ...existing.data }
  if (!existing.data.footer) merged.footer = DEFAULT_CONTENT.footer
  if (!existing.data.sections) merged.sections = DEFAULT_CONTENT.sections
  return merged
}

function requireAuth(request, permission) {
  const user = getUserFromRequest(request)
  if (!user) return { error: cors(NextResponse.json({ error: 'Unauthorized' }, { status: 401 })) }
  if (permission && !can(user, permission)) return { error: cors(NextResponse.json({ error: 'Forbidden' }, { status: 403 })) }
  return { user }
}

function calculateLeadScore(b) {
  let s = 0
  if (b.organization) s += 20
  if (b.phone) s += 15
  if (b.occupation) s += 10
  if (b.state) s += 10
  if (['Healthcare Professional', 'NGO', 'Government', 'Distributor'].includes(b.purpose)) s += 30
  return s
}

async function handleRoute(request, { params }) {
  const { path = [] } = params
  const route = `/${path.join('/')}`
  const method = request.method

  try {
    const { db, bucket } = await getDb()

    if (route === '/' && method === 'GET') {
      return cors(NextResponse.json({ message: 'BSV Snakebite Campaign API', version: '2.0', status: 'live' }))
    }

    // ===== AUTH =====
    if (route === '/auth/login' && method === 'POST') {
      const body = await request.json()
      // Legacy: bsv_admin_2025 as shared password
      if (body.password === (process.env.ADMIN_PASSWORD || 'bsv_admin_2025') && !body.email) {
        const fakeUser = { id: 'legacy_admin', email: 'admin@bsv.com', role: 'super_admin', name: 'Super Admin' }
        return cors(NextResponse.json({ success: true, token: signToken(fakeUser), user: fakeUser }))
      }
      if (!body.email || !body.password) return cors(NextResponse.json({ error: 'Email and password required' }, { status: 400 }))
      const user = await db.collection('users').findOne({ email: body.email.toLowerCase(), active: true })
      if (!user) return cors(NextResponse.json({ error: 'Invalid credentials' }, { status: 401 }))
      const ok = await verifyPassword(body.password, user.passwordHash)
      if (!ok) return cors(NextResponse.json({ error: 'Invalid credentials' }, { status: 401 }))
      const safe = { id: user.id, email: user.email, role: user.role, name: user.name }
      return cors(NextResponse.json({ success: true, token: signToken(safe), user: safe }))
    }

    if (route === '/auth/me' && method === 'GET') {
      const auth = requireAuth(request)
      if (auth.error) return auth.error
      return cors(NextResponse.json({ user: auth.user }))
    }

    // Legacy login endpoint
    if (route === '/admin/login' && method === 'POST') {
      const body = await request.json()
      const ok = body.password === (process.env.ADMIN_PASSWORD || 'bsv_admin_2025')
      if (!ok) return cors(NextResponse.json({ error: 'Invalid password' }, { status: 401 }))
      const fakeUser = { id: 'legacy_admin', email: 'admin@bsv.com', role: 'super_admin', name: 'Super Admin' }
      return cors(NextResponse.json({ success: true, token: signToken(fakeUser), user: fakeUser }))
    }

    // ===== USERS =====
    if (route === '/users' && method === 'GET') {
      const auth = requireAuth(request, 'users.read'); if (auth.error) return auth.error
      const users = await db.collection('users').find({}).project({ passwordHash: 0 }).toArray()
      return cors(NextResponse.json(users.map(({ _id, ...u }) => u)))
    }
    if (route === '/users' && method === 'POST') {
      const auth = requireAuth(request, 'users.create'); if (auth.error) return auth.error
      const body = await request.json()
      if (!body.email || !body.password || !body.role) return cors(NextResponse.json({ error: 'email, password, role required' }, { status: 400 }))
      if (!ROLES[body.role]) return cors(NextResponse.json({ error: 'Invalid role' }, { status: 400 }))
      const existing = await db.collection('users').findOne({ email: body.email.toLowerCase() })
      if (existing) return cors(NextResponse.json({ error: 'User already exists' }, { status: 400 }))
      const user = { id: uuidv4(), email: body.email.toLowerCase(), name: body.name || body.email, role: body.role, passwordHash: await hashPassword(body.password), active: true, createdAt: new Date() }
      await db.collection('users').insertOne(user)
      const { passwordHash, _id, ...safe } = user
      return cors(NextResponse.json(safe))
    }
    if (route.startsWith('/users/') && method === 'DELETE') {
      const auth = requireAuth(request, 'users.delete'); if (auth.error) return auth.error
      const id = route.split('/')[2]
      await db.collection('users').deleteOne({ id })
      return cors(NextResponse.json({ success: true }))
    }
    if (route.startsWith('/users/') && method === 'PATCH') {
      const auth = requireAuth(request, 'users.update'); if (auth.error) return auth.error
      const id = route.split('/')[2]
      const body = await request.json()
      const update = {}
      if (body.name) update.name = body.name
      if (body.role && ROLES[body.role]) update.role = body.role
      if (typeof body.active === 'boolean') update.active = body.active
      if (body.password) update.passwordHash = await hashPassword(body.password)
      await db.collection('users').updateOne({ id }, { $set: update })
      return cors(NextResponse.json({ success: true }))
    }
    if (route === '/users/roles' && method === 'GET') {
      return cors(NextResponse.json(Object.entries(ROLES).map(([k, v]) => ({ key: k, label: v.label, permissions: v.permissions }))))
    }

    // ===== CONTENT =====
    if (route === '/content' && method === 'GET') {
      const content = await ensureContent(db)
      return cors(NextResponse.json(content))
    }
    if (route === '/content' && method === 'PUT') {
      const auth = requireAuth(request, 'content.update'); if (auth.error) return auth.error
      const body = await request.json()
      await db.collection('site_content').updateOne({ id: 'main' }, { $set: { data: body, updatedAt: new Date() } }, { upsert: true })
      // Auto-push to git in background (non-blocking)
      gitPushContent(body, auth.user).catch(() => {})
      return cors(NextResponse.json({ success: true }))
    }
    if (route === '/content/reset' && method === 'POST') {
      const auth = requireAuth(request, 'content.update'); if (auth.error) return auth.error
      await db.collection('site_content').updateOne({ id: 'main' }, { $set: { data: DEFAULT_CONTENT, updatedAt: new Date() } }, { upsert: true })
      return cors(NextResponse.json({ success: true, data: DEFAULT_CONTENT }))
    }

    // ===== MEDIA (GridFS) =====
    if (route === '/media' && method === 'POST') {
      const auth = requireAuth(request, 'media.upload'); if (auth.error) return auth.error
      const formData = await request.formData()
      const file = formData.get('file')
      if (!file) return cors(NextResponse.json({ error: 'file required' }, { status: 400 }))
      const stableId = uuidv4()
      const alt = formData.get('alt') || ''
      const title = formData.get('title') || file.name
      const tags = (formData.get('tags') || '').toString().split(',').map(t => t.trim()).filter(Boolean)
      const language = formData.get('language') || ''
      const category = formData.get('category') || 'general'
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const uploadStream = bucket.openUploadStream(stableId, {
        contentType: file.type,
        metadata: { stableId, alt, title, tags, language, category, uploadedBy: auth.user.id, uploadedAt: new Date(), originalName: file.name },
      })
      await new Promise((resolve, reject) => {
        Readable.from(buffer).pipe(uploadStream).on('finish', resolve).on('error', reject)
      })
      const meta = {
        id: stableId,
        filename: file.name,
        title,
        alt,
        tags,
        language,
        category,
        size: buffer.length,
        contentType: file.type,
        url: `/api/media/${stableId}`,
        uploadedBy: auth.user.id,
        gridfsId: uploadStream.id.toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      await db.collection('media_metadata').insertOne(meta)
      const { _id, gridfsId, ...safe } = meta
      return cors(NextResponse.json(safe))
    }

    if (route === '/media' && method === 'GET') {
      const url = new URL(request.url)
      const tag = url.searchParams.get('tag')
      const category = url.searchParams.get('category')
      const language = url.searchParams.get('language')
      const search = url.searchParams.get('q')
      const query = {}
      if (tag) query.tags = tag
      if (category) query.category = category
      if (language) query.language = language
      if (search) query.$or = [{ title: { $regex: search, $options: 'i' } }, { filename: { $regex: search, $options: 'i' } }, { alt: { $regex: search, $options: 'i' } }]
      const items = await db.collection('media_metadata').find(query).sort({ createdAt: -1 }).limit(500).toArray()
      return cors(NextResponse.json(items.map(({ _id, gridfsId, ...r }) => r)))
    }

    if (route.startsWith('/media/') && method === 'GET') {
      const id = route.split('/')[2]
      const meta = await db.collection('media_metadata').findOne({ id })
      if (!meta) return cors(NextResponse.json({ error: 'Not found' }, { status: 404 }))
      const downloadStream = bucket.openDownloadStreamByName(id)
      const chunks = []
      for await (const chunk of downloadStream) chunks.push(chunk)
      const body = Buffer.concat(chunks)
      return new NextResponse(body, { status: 200, headers: { 'Content-Type': meta.contentType, 'Cache-Control': 'public, max-age=3600' } })
    }

    if (route.startsWith('/media/') && route.endsWith('/replace') && method === 'POST') {
      const auth = requireAuth(request, 'media.upload'); if (auth.error) return auth.error
      const id = route.split('/')[2]
      const meta = await db.collection('media_metadata').findOne({ id })
      if (!meta) return cors(NextResponse.json({ error: 'Not found' }, { status: 404 }))
      const formData = await request.formData()
      const file = formData.get('file')
      if (!file) return cors(NextResponse.json({ error: 'file required' }, { status: 400 }))
      // Delete old file content from GridFS
      try {
        const existing = await db.collection('media.files').findOne({ filename: id })
        if (existing) await bucket.delete(existing._id)
      } catch (e) { void e }
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const uploadStream = bucket.openUploadStream(id, { contentType: file.type, metadata: { ...meta, replacedAt: new Date() } })
      await new Promise((resolve, reject) => {
        Readable.from(buffer).pipe(uploadStream).on('finish', resolve).on('error', reject)
      })
      await db.collection('media_metadata').updateOne({ id }, { $set: { filename: file.name, contentType: file.type, size: buffer.length, updatedAt: new Date() } })
      return cors(NextResponse.json({ success: true, url: `/api/media/${id}` }))
    }

    if (route.startsWith('/media/') && method === 'PATCH') {
      const auth = requireAuth(request, 'media.update'); if (auth.error) return auth.error
      const id = route.split('/')[2]
      const body = await request.json()
      const update = {}
      if (body.title !== undefined) update.title = body.title
      if (body.alt !== undefined) update.alt = body.alt
      if (body.tags !== undefined) update.tags = body.tags
      if (body.category !== undefined) update.category = body.category
      if (body.language !== undefined) update.language = body.language
      update.updatedAt = new Date()
      await db.collection('media_metadata').updateOne({ id }, { $set: update })
      return cors(NextResponse.json({ success: true }))
    }

    if (route.startsWith('/media/') && method === 'DELETE') {
      const auth = requireAuth(request, 'media.delete'); if (auth.error) return auth.error
      const id = route.split('/')[2]
      try {
        const existing = await db.collection('media.files').findOne({ filename: id })
        if (existing) await bucket.delete(existing._id)
      } catch (e) { void e }
      await db.collection('media_metadata').deleteOne({ id })
      return cors(NextResponse.json({ success: true }))
    }

    // ===== MEDICAL TERMINOLOGY DICTIONARY =====
    if (route === '/dictionary' && method === 'GET') {
      const items = await db.collection('medical_terms').find({}).sort({ term: 1 }).toArray()
      return cors(NextResponse.json(items.map(({ _id, ...r }) => r)))
    }
    if (route === '/dictionary' && method === 'POST') {
      const auth = requireAuth(request, 'content.update'); if (auth.error) return auth.error
      const body = await request.json()
      if (!body.term) return cors(NextResponse.json({ error: 'term required' }, { status: 400 }))
      const t = { id: uuidv4(), term: body.term, category: body.category || 'general', definition: body.definition || '', doNotTranslate: body.doNotTranslate ?? false, translations: body.translations || {}, notes: body.notes || '', createdAt: new Date(), updatedAt: new Date() }
      await db.collection('medical_terms').insertOne(t)
      return cors(NextResponse.json(t))
    }
    if (route.startsWith('/dictionary/') && method === 'PATCH') {
      const auth = requireAuth(request, 'content.update'); if (auth.error) return auth.error
      const id = route.split('/')[2]
      const body = await request.json()
      await db.collection('medical_terms').updateOne({ id }, { $set: { ...body, updatedAt: new Date() } })
      return cors(NextResponse.json({ success: true }))
    }
    if (route.startsWith('/dictionary/') && method === 'DELETE') {
      const auth = requireAuth(request, 'content.update'); if (auth.error) return auth.error
      const id = route.split('/')[2]
      await db.collection('medical_terms').deleteOne({ id })
      return cors(NextResponse.json({ success: true }))
    }

    // ===== TRANSLATION REVIEW WORKFLOW =====
    if (route === '/translations/status' && method === 'GET') {
      const auth = requireAuth(request, 'content.read'); if (auth.error) return auth.error
      const main = await db.collection('site_content').findOne({ id: 'main' })
      const status = main?.data?.translationStatus || {}
      return cors(NextResponse.json(status))
    }
    if (route === '/translations/approve' && method === 'POST') {
      const auth = requireAuth(request, 'content.update'); if (auth.error) return auth.error
      const body = await request.json()
      const { lang, status: newStatus } = body
      if (!lang) return cors(NextResponse.json({ error: 'lang required' }, { status: 400 }))
      const main = await db.collection('site_content').findOne({ id: 'main' })
      const content = main?.data || {}
      const translationStatus = content.translationStatus || {}
      translationStatus[lang] = { status: newStatus || 'approved', approvedBy: auth.user.name, approvedAt: new Date(), userId: auth.user.id }
      content.translationStatus = translationStatus
      await db.collection('site_content').updateOne({ id: 'main' }, { $set: { data: content, updatedAt: new Date() } })
      // Audit log
      await db.collection('translation_audit').insertOne({ id: uuidv4(), lang, action: newStatus || 'approved', user: auth.user.name, userId: auth.user.id, timestamp: new Date() })
      return cors(NextResponse.json({ success: true }))
    }
    if (route === '/translations/audit' && method === 'GET') {
      const auth = requireAuth(request, 'content.read'); if (auth.error) return auth.error
      const items = await db.collection('translation_audit').find({}).sort({ timestamp: -1 }).limit(200).toArray()
      return cors(NextResponse.json(items.map(({ _id, ...r }) => r)))
    }
    if (route === '/translations/override' && method === 'POST') {
      const auth = requireAuth(request, 'content.update'); if (auth.error) return auth.error
      const body = await request.json()
      const { lang, path, value } = body
      if (!lang || !path) return cors(NextResponse.json({ error: 'lang and path required' }, { status: 400 }))
      const main = await db.collection('site_content').findOne({ id: 'main' })
      const content = main?.data || {}
      if (!content.translations) content.translations = {}
      if (!content.translations[lang]) content.translations[lang] = {}
      // Set value at nested path
      const parts = path.split(/\.|\[|\]/).filter(Boolean)
      let cursor = content.translations[lang]
      for (let i = 0; i < parts.length - 1; i++) {
        const p = parts[i]; const next = parts[i + 1]; const isArr = /^\d+$/.test(next)
        if (cursor[p] === undefined) cursor[p] = isArr ? [] : {}
        cursor = cursor[p]
      }
      const last = parts[parts.length - 1]
      if (/^\d+$/.test(last)) cursor[parseInt(last, 10)] = value
      else cursor[last] = value
      // Mark as pending_review (override invalidates approval)
      const ts = content.translationStatus || {}
      ts[lang] = { ...(ts[lang] || {}), status: 'pending_review', lastEditBy: auth.user.name, lastEditAt: new Date() }
      content.translationStatus = ts
      await db.collection('site_content').updateOne({ id: 'main' }, { $set: { data: content, updatedAt: new Date() } })
      await db.collection('translation_audit').insertOne({ id: uuidv4(), lang, action: 'manual_override', path, value, user: auth.user.name, userId: auth.user.id, timestamp: new Date() })
      return cors(NextResponse.json({ success: true }))
    }

    // ===== GLOBAL SETTINGS =====
    if (route === '/settings' && method === 'GET') {
      const existing = await db.collection('site_settings').findOne({ id: 'main' })
      if (!existing) {
        await db.collection('site_settings').insertOne({ id: 'main', data: DEFAULT_SETTINGS, updatedAt: new Date() })
        return cors(NextResponse.json(DEFAULT_SETTINGS))
      }
      // Merge defaults so new fields are always present
      const merged = { ...DEFAULT_SETTINGS, ...existing.data, branding: { ...DEFAULT_SETTINGS.branding, ...(existing.data.branding || {}) }, seoHome: { ...DEFAULT_SETTINGS.seoHome, ...(existing.data.seoHome || {}) }, contact: { ...DEFAULT_SETTINGS.contact, ...(existing.data.contact || {}) }, social: { ...DEFAULT_SETTINGS.social, ...(existing.data.social || {}) }, tracking: { ...DEFAULT_SETTINGS.tracking, ...(existing.data.tracking || {}) }, advanced: { ...DEFAULT_SETTINGS.advanced, ...(existing.data.advanced || {}) }, perPage: { ...DEFAULT_SETTINGS.perPage, ...(existing.data.perPage || {}) } }
      return cors(NextResponse.json(merged))
    }
    if (route === '/settings' && method === 'PUT') {
      const auth = requireAuth(request, 'content.update'); if (auth.error) return auth.error
      const body = await request.json()
      await db.collection('site_settings').updateOne({ id: 'main' }, { $set: { data: body, updatedAt: new Date(), updatedBy: auth.user.name } }, { upsert: true })
      return cors(NextResponse.json({ success: true }))
    }
    if (route === '/settings/reset' && method === 'POST') {
      const auth = requireAuth(request, 'content.update'); if (auth.error) return auth.error
      await db.collection('site_settings').updateOne({ id: 'main' }, { $set: { data: DEFAULT_SETTINGS, updatedAt: new Date() } }, { upsert: true })
      return cors(NextResponse.json({ success: true, data: DEFAULT_SETTINGS }))
    }

    // ===== SITEMAP.XML =====
    if (route === '/sitemap.xml' && method === 'GET') {
      const settings = (await db.collection('site_settings').findOne({ id: 'main' }))?.data || DEFAULT_SETTINGS
      const base = process.env.NEXT_PUBLIC_BASE_URL || ''
      const langs = ['en','hi','mr','kn','ta','te','or','pa','bn']
      const pages = ['/', '/impact-stories', '/reports', '/ngo-network', '/volunteer', '/thank-you']
      const stories = await db.collection('impact_stories').find({ published: true }).toArray()
      const ngos = await db.collection('ngos').find({ published: { $ne: false } }).toArray()
      const reports = await db.collection('reports').find({ published: { $ne: false } }).toArray()
      const now = new Date().toISOString().split('T')[0]
      const urls = []
      for (const p of pages) urls.push(`  <url><loc>${base}${p}</loc><lastmod>${now}</lastmod><changefreq>weekly</changefreq><priority>${p === '/' ? '1.0' : '0.8'}</priority></url>`)
      for (const s of stories) urls.push(`  <url><loc>${base}/impact-stories/${s.id}</loc><lastmod>${(s.updatedAt || s.createdAt || new Date()).toISOString ? (s.updatedAt || s.createdAt).toISOString().split('T')[0] : now}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>`)
      for (const extra of (settings.advanced?.sitemapAdditionalUrls || [])) urls.push(`  <url><loc>${extra}</loc><changefreq>monthly</changefreq><priority>0.5</priority></url>`)
      const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`
      return new NextResponse(xml, { status: 200, headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'public, max-age=3600' } })
    }

    // ===== ROBOTS.TXT =====
    if (route === '/robots.txt' && method === 'GET') {
      const settings = (await db.collection('site_settings').findOne({ id: 'main' }))?.data || DEFAULT_SETTINGS
      const txt = settings.advanced?.robotsTxt || DEFAULT_SETTINGS.advanced.robotsTxt
      return new NextResponse(txt, { status: 200, headers: { 'Content-Type': 'text/plain', 'Cache-Control': 'public, max-age=3600' } })
    }

    // ===== REDIRECTS (301) =====
    if (route === '/redirects' && method === 'GET') {
      const items = await db.collection('redirects').find({}).sort({ createdAt: -1 }).toArray()
      return cors(NextResponse.json(items.map(({ _id, ...r }) => r)))
    }
    if (route === '/redirects' && method === 'POST') {
      const auth = requireAuth(request, 'content.update'); if (auth.error) return auth.error
      const body = await request.json()
      if (!body.from || !body.to) return cors(NextResponse.json({ error: 'from and to required' }, { status: 400 }))
      const r = { id: uuidv4(), from: body.from, to: body.to, code: body.code || 301, hits: 0, createdAt: new Date() }
      await db.collection('redirects').insertOne(r)
      return cors(NextResponse.json(r))
    }
    if (route.startsWith('/redirects/') && method === 'DELETE') {
      const auth = requireAuth(request, 'content.update'); if (auth.error) return auth.error
      const id = route.split('/')[2]
      await db.collection('redirects').deleteOne({ id })
      return cors(NextResponse.json({ success: true }))
    }

    // ===== AI BULK TRANSLATE ALL CONTENT =====
    if (route === '/ai/translate-all' && method === 'POST') {
      const auth = requireAuth(request, 'content.update'); if (auth.error) return auth.error
      const body = await request.json()
      const { content, targetLangs } = body
      if (!content || !targetLangs?.length) return cors(NextResponse.json({ error: 'content and targetLangs required' }, { status: 400 }))
      const langNames = { hi: 'Hindi', mr: 'Marathi', kn: 'Kannada', ta: 'Tamil', te: 'Telugu', or: 'Odia', pa: 'Punjabi', bn: 'Bengali' }

      // Load medical terminology dictionary
      const dictItems = await db.collection('medical_terms').find({}).toArray()
      const buildDictPrompt = (lang) => {
        if (!dictItems.length) return ''
        const lines = []
        for (const d of dictItems) {
          if (d.doNotTranslate) lines.push(`- "${d.term}" → DO NOT translate, keep as "${d.term}"`)
          else if (d.translations?.[lang]) lines.push(`- "${d.term}" → "${d.translations[lang]}"`)
        }
        return lines.length ? `\n\nMEDICAL TERMINOLOGY DICTIONARY (use these exact terms):\n${lines.join('\n')}\n` : ''
      }

      // Collect all translatable strings into a flat object
      const fields = {}
      const collect = (obj, prefix = '') => {
        if (!obj) return
        if (typeof obj === 'string') { if (obj.trim() && obj.length < 2000 && !obj.startsWith('http') && !obj.startsWith('#')) fields[prefix] = obj; return }
        if (Array.isArray(obj)) { obj.forEach((v, i) => collect(v, `${prefix}[${i}]`)); return }
        if (typeof obj === 'object') Object.entries(obj).forEach(([k, v]) => { if (['id', 'icon', 'image', 'preview', 'file', 'url', 'logo', 'thumbnail', 'social', 'translations'].includes(k)) return; collect(v, prefix ? `${prefix}.${k}` : k) })
      }
      // Translate hero, about, emergency, myths, resources, footer, contact, impactStats labels, states, heroStats
      collect(content.hero, 'hero')
      collect(content.about, 'about')
      collect(content.emergencyDos, 'emergencyDos')
      collect(content.emergencyDonts, 'emergencyDonts')
      collect(content.myths, 'myths')
      collect(content.resources, 'resources')
      collect(content.impactStats, 'impactStats')
      collect(content.heroStats, 'heroStats')
      collect(content.states, 'states')
      collect(content.footer, 'footer')
      collect(content.ngos, 'ngos')

      const translations = content.translations || {}
      const results = {}

      for (const lang of targetLangs) {
        const targetName = langNames[lang] || lang
        const dictPrompt = buildDictPrompt(lang)
        const entries = Object.entries(fields)
        const chunkSize = 30
        const trMap = {}
        for (let i = 0; i < entries.length; i += chunkSize) {
          const chunk = entries.slice(i, i + chunkSize)
          const promptItems = chunk.map(([k, v], idx) => `${idx + 1}. ${v}`).join('\n')
          const prompt = `Translate these ${chunk.length} English texts to ${targetName}. Return ONLY a JSON array of strings in the same order. Preserve formatting. No explanation.${dictPrompt}\n\nTEXTS TO TRANSLATE:\n${promptItems}\n\nReturn JSON array only:`
          try {
            const r = await fetch('https://integrations.emergentagent.com/llm/openai/v1/chat/completions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.EMERGENT_LLM_KEY}` },
              body: JSON.stringify({ model: 'gpt-4o-mini', max_tokens: 4096, messages: [{ role: 'system', content: 'You are an expert medical/public-health translator for Indian languages. Always use the provided terminology dictionary. Always return a valid JSON array of strings.' }, { role: 'user', content: prompt }] }),
            })
            if (!r.ok) continue
            const data = await r.json()
            let text = data.choices?.[0]?.message?.content?.trim() || '[]'
            text = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim()
            const arr = JSON.parse(text)
            chunk.forEach(([k], idx) => { if (arr[idx]) trMap[k] = arr[idx] })
          } catch (e) { console.error('translate chunk error', e) }
        }
        // Re-nest the flat map back into structure
        const nested = {}
        for (const [path, value] of Object.entries(trMap)) {
          const parts = path.split(/\.|\[|\]/).filter(Boolean)
          let cursor = nested
          for (let i = 0; i < parts.length - 1; i++) {
            const p = parts[i]
            const next = parts[i + 1]
            const isArr = /^\d+$/.test(next)
            if (cursor[p] === undefined) cursor[p] = isArr ? [] : {}
            cursor = cursor[p]
          }
          const last = parts[parts.length - 1]
          if (/^\d+$/.test(last)) cursor[parseInt(last, 10)] = value
          else cursor[last] = value
        }
        translations[lang] = nested
        results[lang] = Object.keys(trMap).length
      }
      const updated = { ...content, translations }
      // Preserve existing translationStatus from DB; only mark NEWLY translated languages as pending_review (unless they were already approved)
      const dbMain = await db.collection('site_content').findOne({ id: 'main' })
      const existingStatus = dbMain?.data?.translationStatus || {}
      const ts = { ...existingStatus }
      for (const lang of targetLangs) {
        // If was approved, keep approved but mark for re-review
        if (ts[lang]?.status === 'approved') {
          ts[lang] = { ...ts[lang], status: 'pending_review', reason: 're-translated', generatedByUser: auth.user.name, generatedAt: new Date() }
        } else {
          ts[lang] = { status: 'pending_review', generatedBy: 'ai', generatedByUser: auth.user.name, generatedAt: new Date() }
        }
        await db.collection('translation_audit').insertOne({ id: uuidv4(), lang, action: 'ai_translated', user: auth.user.name, userId: auth.user.id, fieldCount: results[lang], timestamp: new Date() })
      }
      updated.translationStatus = ts
      await db.collection('site_content').updateOne({ id: 'main' }, { $set: { data: updated, updatedAt: new Date() } }, { upsert: true })
      return cors(NextResponse.json({ success: true, results, content: updated }))
    }

    // ===== AI TRANSLATION =====
    if (route === '/ai/translate' && method === 'POST') {
      const auth = requireAuth(request, 'content.update'); if (auth.error) return auth.error
      const body = await request.json()
      const { text, targetLang, sourceLang = 'English' } = body
      if (!text || !targetLang) return cors(NextResponse.json({ error: 'text and targetLang required' }, { status: 400 }))
      const langNames = { hi: 'Hindi', mr: 'Marathi', kn: 'Kannada', ta: 'Tamil', te: 'Telugu', or: 'Odia', pa: 'Punjabi', bn: 'Bengali', en: 'English' }
      const targetName = langNames[targetLang] || targetLang
      try {
        const r = await fetch('https://integrations.emergentagent.com/llm/openai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.EMERGENT_LLM_KEY}` },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            max_tokens: 2048,
            messages: [
              { role: 'system', content: 'You are an expert translator for Indian languages. Translate accurately, preserve formatting (HTML/markdown), and return ONLY the translated text without any preamble, quotes, or explanation.' },
              { role: 'user', content: `Translate this ${sourceLang} text to ${targetName}:\n\n${text}` },
            ],
          }),
        })
        if (!r.ok) {
          const err = await r.text()
          return cors(NextResponse.json({ error: 'Translation failed', detail: err }, { status: 500 }))
        }
        const data = await r.json()
        const translated = data.choices?.[0]?.message?.content?.trim() || ''
        return cors(NextResponse.json({ translated, sourceLang, targetLang }))
      } catch (e) {
        return cors(NextResponse.json({ error: 'Translation error', detail: e.message }, { status: 500 }))
      }
    }

    // ===== GALLERY =====
    if (route === '/gallery' && method === 'GET') {
      const items = await db.collection('gallery_albums').find({}).sort({ order: 1, createdAt: -1 }).toArray()
      return cors(NextResponse.json(items.map(({ _id, ...r }) => r)))
    }
    if (route === '/gallery' && method === 'POST') {
      const auth = requireAuth(request, 'content.update'); if (auth.error) return auth.error
      const body = await request.json()
      const a = { id: uuidv4(), title: body.title, category: body.category || 'Awareness', description: body.description || '', coverImage: body.coverImage || '', images: body.images || [], order: body.order ?? 0, published: body.published ?? true, createdAt: new Date(), updatedAt: new Date() }
      await db.collection('gallery_albums').insertOne(a)
      return cors(NextResponse.json(a))
    }
    if (route.startsWith('/gallery/') && method === 'PATCH') {
      const auth = requireAuth(request, 'content.update'); if (auth.error) return auth.error
      const id = route.split('/')[2]
      const body = await request.json()
      await db.collection('gallery_albums').updateOne({ id }, { $set: { ...body, updatedAt: new Date() } })
      return cors(NextResponse.json({ success: true }))
    }
    if (route.startsWith('/gallery/') && method === 'DELETE') {
      const auth = requireAuth(request, 'content.update'); if (auth.error) return auth.error
      const id = route.split('/')[2]
      await db.collection('gallery_albums').deleteOne({ id })
      return cors(NextResponse.json({ success: true }))
    }

    // ===== VIDEOS =====
    if (route === '/videos' && method === 'GET') {
      const items = await db.collection('videos').find({}).sort({ order: 1, createdAt: -1 }).toArray()
      return cors(NextResponse.json(items.map(({ _id, ...r }) => r)))
    }
    if (route === '/videos' && method === 'POST') {
      const auth = requireAuth(request, 'content.update'); if (auth.error) return auth.error
      const body = await request.json()
      // Extract YouTube ID from URL
      const ytMatch = (body.url || '').match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/)
      const youtubeId = body.youtubeId || ytMatch?.[1] || ''
      const v = { id: uuidv4(), title: body.title, description: body.description || '', url: body.url, youtubeId, thumbnail: body.thumbnail || (youtubeId ? `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg` : ''), category: body.category || 'Campaign', featured: body.featured ?? false, published: body.published ?? true, order: body.order ?? 0, createdAt: new Date(), updatedAt: new Date() }
      await db.collection('videos').insertOne(v)
      return cors(NextResponse.json(v))
    }
    if (route.startsWith('/videos/') && method === 'PATCH') {
      const auth = requireAuth(request, 'content.update'); if (auth.error) return auth.error
      const id = route.split('/')[2]
      const body = await request.json()
      if (body.url) {
        const ytMatch = body.url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/)
        if (ytMatch?.[1]) { body.youtubeId = ytMatch[1]; if (!body.thumbnail) body.thumbnail = `https://img.youtube.com/vi/${ytMatch[1]}/maxresdefault.jpg` }
      }
      await db.collection('videos').updateOne({ id }, { $set: { ...body, updatedAt: new Date() } })
      return cors(NextResponse.json({ success: true }))
    }
    if (route.startsWith('/videos/') && method === 'DELETE') {
      const auth = requireAuth(request, 'content.update'); if (auth.error) return auth.error
      const id = route.split('/')[2]
      await db.collection('videos').deleteOne({ id })
      return cors(NextResponse.json({ success: true }))
    }

    // ===== IMPACT STORIES =====
    if (route === '/impact-stories' && method === 'GET') {
      const url = new URL(request.url)
      const includeUnpublished = url.searchParams.get('all') === 'true'
      const q = includeUnpublished ? {} : { published: true }
      const items = await db.collection('impact_stories').find(q).sort({ createdAt: -1 }).toArray()
      return cors(NextResponse.json(items.map(({ _id, ...r }) => r)))
    }
    if (route === '/impact-stories' && method === 'POST') {
      const auth = requireAuth(request, 'impact_stories.create'); if (auth.error) return auth.error
      const body = await request.json()
      const story = { id: uuidv4(), title: body.title || 'Untitled', description: body.description || '', category: body.category || 'General', state: body.state || '', beneficiary: body.beneficiary || '', ngo: body.ngo || '', beforeImage: body.beforeImage || '', afterImage: body.afterImage || '', heroImage: body.heroImage || '', gallery: body.gallery || [], video: body.video || '', metrics: body.metrics || {}, translations: body.translations || {}, published: body.published ?? false, createdAt: new Date(), updatedAt: new Date() }
      await db.collection('impact_stories').insertOne(story)
      return cors(NextResponse.json(story))
    }
    if (route.startsWith('/impact-stories/') && method === 'GET') {
      const id = route.split('/')[2]
      const s = await db.collection('impact_stories').findOne({ id })
      if (!s) return cors(NextResponse.json({ error: 'Not found' }, { status: 404 }))
      const { _id, ...r } = s
      return cors(NextResponse.json(r))
    }
    if (route.startsWith('/impact-stories/') && method === 'PATCH') {
      const auth = requireAuth(request, 'impact_stories.update'); if (auth.error) return auth.error
      const id = route.split('/')[2]
      const body = await request.json()
      await db.collection('impact_stories').updateOne({ id }, { $set: { ...body, updatedAt: new Date() } })
      return cors(NextResponse.json({ success: true }))
    }
    if (route.startsWith('/impact-stories/') && method === 'DELETE') {
      const auth = requireAuth(request, 'impact_stories.delete'); if (auth.error) return auth.error
      const id = route.split('/')[2]
      await db.collection('impact_stories').deleteOne({ id })
      return cors(NextResponse.json({ success: true }))
    }

    // ===== NGOS =====
    if (route === '/ngos' && method === 'GET') {
      const items = await db.collection('ngos').find({}).sort({ createdAt: -1 }).toArray()
      return cors(NextResponse.json(items.map(({ _id, ...r }) => r)))
    }
    if (route === '/ngos' && method === 'POST') {
      const auth = requireAuth(request, 'ngos.create'); if (auth.error) return auth.error
      const body = await request.json()
      const ngo = { id: uuidv4(), name: body.name, logo: body.logo || '', description: body.description || '', website: body.website || '', email: body.email || '', phone: body.phone || '', stateCoverage: body.stateCoverage || [], gallery: body.gallery || [], impactNumbers: body.impactNumbers || {}, translations: body.translations || {}, published: body.published ?? true, createdAt: new Date(), updatedAt: new Date() }
      await db.collection('ngos').insertOne(ngo)
      return cors(NextResponse.json(ngo))
    }
    if (route.startsWith('/ngos/') && method === 'PATCH') {
      const auth = requireAuth(request, 'ngos.update'); if (auth.error) return auth.error
      const id = route.split('/')[2]
      const body = await request.json()
      await db.collection('ngos').updateOne({ id }, { $set: { ...body, updatedAt: new Date() } })
      return cors(NextResponse.json({ success: true }))
    }
    if (route.startsWith('/ngos/') && method === 'DELETE') {
      const auth = requireAuth(request, 'ngos.delete'); if (auth.error) return auth.error
      const id = route.split('/')[2]
      await db.collection('ngos').deleteOne({ id })
      return cors(NextResponse.json({ success: true }))
    }

    // ===== REPORTS =====
    if (route === '/reports' && method === 'GET') {
      const items = await db.collection('reports').find({}).sort({ createdAt: -1 }).toArray()
      return cors(NextResponse.json(items.map(({ _id, ...r }) => r)))
    }
    if (route === '/reports' && method === 'POST') {
      const auth = requireAuth(request, 'reports.create'); if (auth.error) return auth.error
      const body = await request.json()
      const report = { id: uuidv4(), title: body.title, category: body.category || 'Annual Report', description: body.description || '', thumbnail: body.thumbnail || '', file: body.file || '', language: body.language || 'en', downloadCount: 0, published: body.published ?? true, createdAt: new Date(), updatedAt: new Date() }
      await db.collection('reports').insertOne(report)
      return cors(NextResponse.json(report))
    }
    if (route.startsWith('/reports/') && route.endsWith('/download') && method === 'POST') {
      const id = route.split('/')[2]
      await db.collection('reports').updateOne({ id }, { $inc: { downloadCount: 1 } })
      return cors(NextResponse.json({ success: true }))
    }
    if (route.startsWith('/reports/') && method === 'PATCH') {
      const auth = requireAuth(request, 'reports.update'); if (auth.error) return auth.error
      const id = route.split('/')[2]
      const body = await request.json()
      await db.collection('reports').updateOne({ id }, { $set: { ...body, updatedAt: new Date() } })
      return cors(NextResponse.json({ success: true }))
    }
    if (route.startsWith('/reports/') && method === 'DELETE') {
      const auth = requireAuth(request, 'reports.delete'); if (auth.error) return auth.error
      const id = route.split('/')[2]
      await db.collection('reports').deleteOne({ id })
      return cors(NextResponse.json({ success: true }))
    }

    // ===== VOLUNTEERS =====
    if (route === '/volunteers' && method === 'POST') {
      const body = await request.json()
      const v = { id: uuidv4(), name: body.name, email: body.email, phone: body.phone || '', state: body.state || '', city: body.city || '', occupation: body.occupation || '', interests: body.interests || [], availability: body.availability || '', message: body.message || '', status: 'pending', createdAt: new Date() }
      await db.collection('volunteers').insertOne(v)
      return cors(NextResponse.json({ success: true, id: v.id }))
    }
    if (route === '/volunteers' && method === 'GET') {
      const auth = requireAuth(request, 'volunteers.read'); if (auth.error) return auth.error
      const items = await db.collection('volunteers').find({}).sort({ createdAt: -1 }).toArray()
      return cors(NextResponse.json(items.map(({ _id, ...r }) => r)))
    }
    if (route.startsWith('/volunteers/') && method === 'PATCH') {
      const auth = requireAuth(request, 'volunteers.update'); if (auth.error) return auth.error
      const id = route.split('/')[2]
      const body = await request.json()
      await db.collection('volunteers').updateOne({ id }, { $set: body })
      return cors(NextResponse.json({ success: true }))
    }

    // ===== EXISTING ENDPOINTS =====
    if (route === '/leads' && method === 'POST') {
      const body = await request.json()
      if (!body.name || !body.email) return cors(NextResponse.json({ error: 'name and email required' }, { status: 400 }))
      const lead = { id: uuidv4(), name: body.name, email: body.email, phone: body.phone || '', organization: body.organization || '', city: body.city || '', state: body.state || '', occupation: body.occupation || '', purpose: body.purpose || 'General Awareness', resourceId: body.resourceId || null, resourceTitle: body.resourceTitle || null, source: body.source || 'website', language: body.language || 'en', score: calculateLeadScore(body), createdAt: new Date() }
      await db.collection('leads').insertOne(lead)
      return cors(NextResponse.json({ success: true, leadId: lead.id }))
    }
    if (route === '/leads' && method === 'GET') {
      const auth = requireAuth(request, 'leads.read'); if (auth.error) return auth.error
      const leads = await db.collection('leads').find({}).sort({ createdAt: -1 }).limit(2000).toArray()
      return cors(NextResponse.json(leads.map(({ _id, ...r }) => r)))
    }
    if (route === '/quiz/submit' && method === 'POST') {
      const body = await request.json()
      const result = { id: uuidv4(), name: body.name || 'Anonymous', email: body.email || '', state: body.state || '', district: body.district || '', occupation: body.occupation || '', commonMyth: body.commonMyth || '', score: body.score || 0, total: body.total || 0, passed: body.passed ?? ((body.score || 0) >= Math.ceil((body.total || 1) * 0.6)), language: body.language || 'en', certificateNumber: 'BSV-' + Date.now().toString(36).toUpperCase(), createdAt: new Date() }
      await db.collection('quiz_results').insertOne(result)
      return cors(NextResponse.json({ success: true, certificateId: result.id, certificateNumber: result.certificateNumber, passed: result.passed }))
    }
    // Quiz Questions CMS endpoints
    if (route === '/quiz/questions' && method === 'GET') {
      const items = await db.collection('quiz_questions').find({}).sort({ order: 1, createdAt: 1 }).toArray()
      return cors(NextResponse.json(items.map(({ _id, ...r }) => r)))
    }
    if (route === '/quiz/questions' && method === 'POST') {
      const auth = requireAuth(request, 'content.write'); if (auth.error) return auth.error
      const body = await request.json()
      const q = { id: uuidv4(), question: body.question, options: body.options || [], correctIndex: body.correctIndex ?? 0, explanation: body.explanation || '', category: body.category || 'general', order: body.order || 0, published: body.published ?? true, createdAt: new Date(), updatedAt: new Date() }
      await db.collection('quiz_questions').insertOne(q)
      return cors(NextResponse.json({ success: true, id: q.id }))
    }
    if (route.startsWith('/quiz/questions/') && (method === 'PATCH' || method === 'PUT')) {
      const auth = requireAuth(request, 'content.write'); if (auth.error) return auth.error
      const id = route.split('/')[3]
      const body = await request.json()
      await db.collection('quiz_questions').updateOne({ id }, { $set: { ...body, updatedAt: new Date() } })
      return cors(NextResponse.json({ success: true }))
    }
    if (route.startsWith('/quiz/questions/') && method === 'DELETE') {
      const auth = requireAuth(request, 'content.write'); if (auth.error) return auth.error
      const id = route.split('/')[3]
      await db.collection('quiz_questions').deleteOne({ id })
      return cors(NextResponse.json({ success: true }))
    }
    if (route === '/quiz/results' && method === 'GET') {
      const auth = requireAuth(request, 'quiz.read'); if (auth.error) return auth.error
      const results = await db.collection('quiz_results').find({}).sort({ createdAt: -1 }).limit(2000).toArray()
      return cors(NextResponse.json(results.map(({ _id, ...r }) => r)))
    }
    if (route === '/contact' && method === 'POST') {
      const body = await request.json()
      const msg = { id: uuidv4(), name: body.name, email: body.email, phone: body.phone || '', message: body.message, createdAt: new Date() }
      await db.collection('contact_messages').insertOne(msg)
      return cors(NextResponse.json({ success: true }))
    }
    if (route === '/contact' && method === 'GET') {
      const auth = requireAuth(request, 'contact.read'); if (auth.error) return auth.error
      const items = await db.collection('contact_messages').find({}).sort({ createdAt: -1 }).limit(1000).toArray()
      return cors(NextResponse.json(items.map(({ _id, ...r }) => r)))
    }
    if (route === '/partnership' && method === 'POST') {
      const body = await request.json()
      const app = { id: uuidv4(), organization: body.organization, type: body.type, name: body.name, email: body.email, phone: body.phone || '', state: body.state || '', message: body.message || '', status: 'new', createdAt: new Date() }
      await db.collection('partnerships').insertOne(app)
      return cors(NextResponse.json({ success: true }))
    }
    if (route === '/partnership' && method === 'GET') {
      const auth = requireAuth(request, 'partnership.read'); if (auth.error) return auth.error
      const items = await db.collection('partnerships').find({}).sort({ createdAt: -1 }).limit(1000).toArray()
      return cors(NextResponse.json(items.map(({ _id, ...r }) => r)))
    }
    if (route === '/analytics' && method === 'GET') {
      const auth = requireAuth(request, 'analytics.read'); if (auth.error) return auth.error
      const [leads, quiz, contacts, parts, volunteers, mediaCount, storiesCount] = await Promise.all([
        db.collection('leads').countDocuments(),
        db.collection('quiz_results').countDocuments(),
        db.collection('contact_messages').countDocuments(),
        db.collection('partnerships').countDocuments(),
        db.collection('volunteers').countDocuments(),
        db.collection('media_metadata').countDocuments(),
        db.collection('impact_stories').countDocuments(),
      ])
      const byState = await db.collection('leads').aggregate([{ $group: { _id: '$state', count: { $sum: 1 } } }, { $sort: { count: -1 } }]).toArray()
      const byPurpose = await db.collection('leads').aggregate([{ $group: { _id: '$purpose', count: { $sum: 1 } } }]).toArray()
      const byLanguage = await db.collection('leads').aggregate([{ $group: { _id: '$language', count: { $sum: 1 } } }]).toArray()
      const mythHeatmap = await db.collection('quiz_results').aggregate([{ $match: { commonMyth: { $ne: '' } } }, { $group: { _id: '$state', count: { $sum: 1 }, myths: { $push: '$commonMyth' } } }, { $sort: { count: -1 } }]).toArray()
      return cors(NextResponse.json({ totals: { leads, quiz, contacts, partnerships: parts, volunteers, media: mediaCount, impactStories: storiesCount }, byState, byPurpose, byLanguage, mythHeatmap }))
    }

    return cors(NextResponse.json({ error: `Route ${route} not found` }, { status: 404 }))
  } catch (error) {
    console.error('API Error:', error)
    return cors(NextResponse.json({ error: 'Internal server error', detail: String(error?.message || error) }, { status: 500 }))
  }
}

export const GET = handleRoute
export const POST = handleRoute
export const PUT = handleRoute
export const DELETE = handleRoute
export const PATCH = handleRoute
