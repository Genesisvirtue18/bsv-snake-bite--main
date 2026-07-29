'use client'

import { useEffect, useState } from 'react'

// Loads only CMS-managed page-header content. Empty values intentionally render empty.
export function usePageHeader(pageKey) {
  const [header, setHeader] = useState(null)

  useEffect(() => {
    fetch('/api/content')
      .then(r => r.ok ? r.json() : null)
      .then(content => setHeader(content?.pageHeaders?.[pageKey] || null))
      .catch(() => setHeader(null))
  }, [pageKey])

  return header || { title: '', description: '' }
}
