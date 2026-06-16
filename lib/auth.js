import { MongoClient, GridFSBucket, ObjectId } from 'mongodb'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

let client
let db
let bucket
let connecting

export async function getDb() {
  if (db && client) return { db, bucket }
  if (connecting) { await connecting; return { db, bucket } }
  connecting = (async () => {
    client = new MongoClient(process.env.MONGO_URL)
    await client.connect()
    db = client.db(process.env.DB_NAME || 'bsv_snakebite_campaign')
    bucket = new GridFSBucket(db, { bucketName: 'media' })
    const count = await db.collection('users').countDocuments()
    if (count === 0) {
      const hash = await bcrypt.hash('bsv_admin_2025', 10)
      await db.collection('users').insertOne({ id: 'super_admin_default', email: 'admin@bsv.com', name: 'Super Administrator', passwordHash: hash, role: 'super_admin', active: true, createdAt: new Date() })
    }
  })()
  await connecting
  connecting = null
  return { db, bucket }
}

export const ROLES = {
  super_admin: { label: 'Super Admin', permissions: ['*'] },
  content_admin: { label: 'Content Admin', permissions: ['content.*', 'media.*', 'impact_stories.*', 'reports.*', 'ngos.*', 'faqs.*'] },
  campaign_manager: { label: 'Campaign Manager', permissions: ['content.read', 'content.update', 'impact_stories.*', 'reports.read', 'media.upload', 'media.read', 'analytics.read'] },
  regional_manager: { label: 'Regional Manager', permissions: ['content.read', 'impact_stories.read', 'leads.read'] },
  media_manager: { label: 'Media Manager', permissions: ['media.*', 'content.read'] },
  lead_manager: { label: 'Lead Manager', permissions: ['leads.*', 'quiz.read', 'contact.read', 'partnership.read', 'analytics.read'] },
}

export function can(user, permission) {
  if (!user) return false
  const role = ROLES[user.role]
  if (!role) return false
  if (role.permissions.includes('*')) return true
  if (role.permissions.includes(permission)) return true
  // wildcard match  e.g. permission 'content.update' matches 'content.*'
  const [domain] = permission.split('.')
  if (role.permissions.includes(`${domain}.*`)) return true
  return false
}

export function signToken(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, process.env.JWT_SECRET || 'fallback', { expiresIn: '7d' })
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'fallback')
  } catch (e) { return null }
}

export function getUserFromRequest(request) {
  const header = request.headers.get('authorization')
  if (!header) {
    // Backwards compat: x-admin-password = legacy super admin
    const legacy = request.headers.get('x-admin-password')
    if (legacy && legacy === (process.env.ADMIN_PASSWORD || 'bsv_admin_2025')) {
      return { id: 'legacy_admin', email: 'admin@bsv.com', role: 'super_admin', name: 'Legacy Admin' }
    }
    return null
  }
  const token = header.replace('Bearer ', '')
  return verifyToken(token)
}

export async function hashPassword(pw) { return bcrypt.hash(pw, 10) }
export async function verifyPassword(pw, hash) { return bcrypt.compare(pw, hash) }

export { ObjectId }
