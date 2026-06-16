// Helper to resolve a translated value
// Content is stored with primary English text. Translations live at content.translations[lang][path]
export function tr(content, path, lang) {
  if (!content) return ''
  // First check translations map
  if (lang && lang !== 'en' && content.translations?.[lang]) {
    const parts = path.split('.')
    let val = content.translations[lang]
    for (const p of parts) {
      val = val?.[p]
      if (val === undefined) break
    }
    if (typeof val === 'string' && val.trim()) return val
    if (Array.isArray(val)) return val
  }
  // Fallback to English (primary content)
  const parts = path.split('.')
  let val = content
  for (const p of parts) {
    val = val?.[p]
    if (val === undefined) return ''
  }
  return val
}

// Translate an entire string value for a content field
export function trItem(item, field, lang) {
  if (!item) return ''
  if (lang && lang !== 'en' && item.translations?.[lang]?.[field]) return item.translations[lang][field]
  return item?.[field] ?? ''
}
