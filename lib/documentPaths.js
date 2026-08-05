export function getDocumentPath(module, id) {
  if (!id) return ''
  if (module === 'brochures') return `/brochures/${id}`
  if (module === 'kol') return `/kol-program/${id}`
  if (module === 'communication') return `/animated-videos-&-comics/${id}`
  return `/document/${id}`
}
