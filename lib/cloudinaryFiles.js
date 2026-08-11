import { v2 as cloudinary } from 'cloudinary'
import { Readable } from 'node:stream'

export const MAX_FILE_SIZE_MB = Number(process.env.FILE_UPLOAD_MAX_SIZE_MB || 100)
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

const FILE_TYPES = {
  documents: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv', 'rtf'],
  images: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'bmp', 'tiff', 'tif', 'avif'],
  videos: ['mp4', 'mov', 'avi', 'mkv', 'webm', 'mpeg', 'mpg', 'm4v'],
  audio: ['mp3', 'wav', 'aac', 'm4a', 'ogg', 'flac'],
  archives: ['zip', 'rar', '7z', 'tar', 'gz'],
  other: ['json', 'xml'],
}

export const ALLOWED_EXTENSIONS = new Set(Object.values(FILE_TYPES).flat())
export const VIDEO_EXTENSIONS = new Set(FILE_TYPES.videos)
export const IMAGE_EXTENSIONS = new Set(FILE_TYPES.images)

const MIME_BY_EXTENSION = {
  pdf: ['application/pdf'], doc: ['application/msword'], docx: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  xls: ['application/vnd.ms-excel'], xlsx: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  ppt: ['application/vnd.ms-powerpoint'], pptx: ['application/vnd.openxmlformats-officedocument.presentationml.presentation'],
  txt: ['text/plain'], csv: ['text/csv', 'application/csv'], rtf: ['application/rtf', 'text/rtf'],
  jpg: ['image/jpeg'], jpeg: ['image/jpeg'], png: ['image/png'], webp: ['image/webp'], gif: ['image/gif'], svg: ['image/svg+xml'], bmp: ['image/bmp'], tiff: ['image/tiff'], tif: ['image/tiff'], avif: ['image/avif'],
  mp4: ['video/mp4'], mov: ['video/quicktime'], avi: ['video/x-msvideo'], mkv: ['video/x-matroska'], webm: ['video/webm'], mpeg: ['video/mpeg'], mpg: ['video/mpeg'], m4v: ['video/x-m4v'],
  mp3: ['audio/mpeg'], wav: ['audio/wav', 'audio/x-wav', 'audio/wave'], aac: ['audio/aac'], m4a: ['audio/mp4', 'audio/x-m4a'], ogg: ['audio/ogg'], flac: ['audio/flac'],
  zip: ['application/zip', 'application/x-zip-compressed'], rar: ['application/vnd.rar', 'application/x-rar-compressed'], '7z': ['application/x-7z-compressed'], tar: ['application/x-tar'], gz: ['application/gzip', 'application/x-gzip'],
  json: ['application/json'], xml: ['application/xml', 'text/xml'],
}

export const FILE_FOLDERS = {
  kol: 'documents/kol-program',
  massMedia: 'documents/mass-media',
  communication: 'documents/communication',
  posters: 'documents/posters',
  brochures: 'documents/brochures',
  media: 'media/general',
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

function extensionOf(name = '') {
  return String(name).split('.').pop().toLowerCase()
}

function hasExpectedSignature(buffer, extension) {
  const text = buffer.subarray(0, 16).toString('utf8')
  if (extension === 'pdf') return buffer.subarray(0, 5).toString('utf8') === '%PDF-'
  if (extension === 'png') return buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  if (['jpg', 'jpeg'].includes(extension)) return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff
  if (extension === 'gif') return text.startsWith('GIF87a') || text.startsWith('GIF89a')
  if (extension === 'zip' || extension === 'docx' || extension === 'xlsx' || extension === 'pptx') return buffer.subarray(0, 2).toString('utf8') === 'PK'
  if (extension === 'rar') return buffer.subarray(0, 7).toString('utf8') === 'Rar!\x1A\x07'
  if (extension === 'gz') return buffer[0] === 0x1f && buffer[1] === 0x8b
  if (extension === 'json') { try { JSON.parse(buffer.toString('utf8')); return true } catch { return false } }
  if (extension === 'xml') return text.trimStart().startsWith('<')
  return true
}

export function validateFile(file, buffer) {
  if (!file || !file.name) throw new Error('Please select a file to upload.')
  if (!file.size || !buffer?.length) throw new Error('The selected file is empty.')
  if (file.size > MAX_FILE_SIZE_BYTES) throw new Error(`File exceeds the ${MAX_FILE_SIZE_MB} MB upload limit.`)
  const extension = extensionOf(file.name)
  if (!ALLOWED_EXTENSIONS.has(extension)) throw new Error(`.${extension || 'unknown'} files are not supported.`)
  const allowedMimes = MIME_BY_EXTENSION[extension]
  if (file.type && file.type !== 'application/octet-stream' && allowedMimes && !allowedMimes.includes(file.type)) {
    throw new Error('The file type does not match its extension.')
  }
  if (!hasExpectedSignature(buffer, extension)) throw new Error('This file appears to be corrupted or has an invalid extension.')
  return { extension, fileType: file.type || 'application/octet-stream' }
}

export function getFolder(module) {
  const folder = FILE_FOLDERS[module]
  if (!folder) throw new Error('Invalid upload destination.')
  return folder
}

export function getUploadResourceType(extension) {
  if (VIDEO_EXTENSIONS.has(extension)) return 'video'
  if (IMAGE_EXTENSIONS.has(extension)) return 'image'
  return 'raw'
}

export function getCloudinaryConfig() {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error('Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.')
  }
  return {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  }
}

export function createDirectUploadSignature({ folder, publicId, resourceType = 'raw' }) {
  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig()
  const timestamp = Math.round(Date.now() / 1000)
  const params = { folder, public_id: publicId, timestamp }
  return {
    cloudName,
    apiKey,
    folder,
    publicId,
    resourceType,
    timestamp,
    signature: cloudinary.utils.api_sign_request(params, apiSecret),
  }
}

export async function uploadFile({ buffer, originalFileName, folder, publicId }) {
  getCloudinaryConfig()
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ resource_type: 'auto', folder, public_id: publicId, overwrite: false }, (error, result) => {
      if (error) reject(error)
      else resolve(result)
    })
    Readable.from(buffer).pipe(stream)
  })
}

export async function deleteCloudinaryFile(publicId, resourceType = 'raw') {
  if (!publicId) return
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType, invalidate: true })
}

export function getPrivateDownloadUrl(document) {
  const format = String(document?.storedFileName || document?.originalFileName || '').split('.').pop().toLowerCase()
  if (!document?.cloudinaryPublicId || !format) throw new Error('Document delivery metadata is incomplete.')
  const publicId = document.cloudinaryResourceType === 'raw' && document.cloudinaryPublicId.endsWith(`.${format}`)
    ? document.cloudinaryPublicId.slice(0, -(format.length + 1))
    : document.cloudinaryPublicId
  return cloudinary.utils.private_download_url(publicId, format, {
    resource_type: document.cloudinaryResourceType || 'raw',
    type: 'upload',
    attachment: false,
    expires_at: Math.floor(Date.now() / 1000) + 300,
  })
}

export function safeDownloadName(name = 'download') {
  return String(name).replace(/[\\/\r\n"]/g, '_')
}
