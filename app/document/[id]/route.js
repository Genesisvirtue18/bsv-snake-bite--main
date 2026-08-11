import { NextResponse } from 'next/server'
import { getDb } from '@/lib/auth'
import { getPrivateDownloadUrl, safeDownloadName } from '@/lib/cloudinaryFiles'

export const runtime = 'nodejs'

async function fetchDocumentUpstream(document, options = {}) {
  const urls = []
  try {
    urls.push(getPrivateDownloadUrl(document))
  } catch (error) {
    console.error('Document signed URL error:', error)
  }
  if (document?.cloudinaryUrl) urls.push(document.cloudinaryUrl)

  for (const url of urls) {
    const upstream = await fetch(url, { ...options, cache: 'no-store' })
    if (upstream.ok && (options.method === 'HEAD' || upstream.body)) return upstream
  }
  return null
}

export async function HEAD(request, { params }) {
  try {
    const { db } = await getDb()
    const document = await db.collection('file_metadata').findOne({ id: params.id })
    if (!document) return new NextResponse(null, { status: 404 })
    const upstream = await fetchDocumentUpstream(document, { method: 'HEAD' })
    return new NextResponse(null, { status: upstream ? 200 : 502 })
  } catch (error) {
    console.error('Document lookup error:', error)
    return new NextResponse(null, { status: 500 })
  }
}

export async function GET(request, { params }) {
  try {
    const { db } = await getDb()
    const document = await db.collection('file_metadata').findOne({ id: params.id })
    if (!document?.cloudinaryUrl) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    const upstream = await fetchDocumentUpstream(document)
    if (!upstream) {
      return NextResponse.json({ error: 'Document is currently unavailable' }, { status: 502 })
    }

    const download = new URL(request.url).searchParams.get('download') === '1'
    const headers = {
      'Content-Type': document.fileType || upstream.headers.get('content-type') || 'application/octet-stream',
      'Content-Disposition': `${download ? 'attachment' : 'inline'}; filename="${safeDownloadName(document.originalFileName)}"`,
      'Cache-Control': 'private, max-age=3600',
      'X-Content-Type-Options': 'nosniff',
    }
    const contentLength = document.fileSize || upstream.headers.get('content-length')
    if (contentLength) headers['Content-Length'] = String(contentLength)

    return new NextResponse(upstream.body, {
      status: 200,
      headers,
    })
  } catch (error) {
    console.error('Document stream error:', error)
    return NextResponse.json({ error: 'Unable to open document' }, { status: 500 })
  }
}
