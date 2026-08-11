'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Download, FileText } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { getDocumentPath } from '@/lib/documentPaths'

export default function ComicPartsReader({ params }) {
  const [content, setContent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/content')
      .then(response => response.ok ? response.json() : null)
      .then(data => setContent(data))
      .catch(() => setContent(null))
      .finally(() => setLoading(false))
  }, [])

  const comic = useMemo(() => {
    const comics = Array.isArray(content?.comics) ? content.comics : []
    return comics.find(item => String(item.id) === String(params.id))
  }, [content, params.id])

  const parts = useMemo(() => {
    const savedParts = Array.isArray(comic?.file?.parts) ? comic.file.parts : []
    return savedParts
      .filter(part => part?.id)
      .sort((a, b) => Number(a.partNumber || 0) - Number(b.partNumber || 0))
  }, [comic])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="text-sm">Loading comic...</div>
      </div>
    )
  }

  if (!comic || !parts.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white px-4">
        <div className="text-center">
          <FileText className="w-12 h-12 mx-auto mb-4 text-white/50" />
          <h1 className="text-xl font-bold">Comic unavailable</h1>
          <Link href="/Comic-&-Visual-Stories">
            <Button className="mt-5 bg-white text-slate-950 hover:bg-white/90">Back to comics</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <Link href="/Comic-&-Visual-Stories">
              <Button variant="ghost" className="mb-1 h-8 px-2 text-white hover:bg-white/10">
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back
              </Button>
            </Link>
            <h1 className="truncate text-lg font-bold">{comic.title || 'Comic'}</h1>
            <p className="text-xs text-white/60">{parts.length} PDF parts</p>
          </div>

          <a href={getDocumentPath('communication', parts[0].id)} target="_blank" rel="noreferrer">
            <Button className="bg-white text-slate-950 hover:bg-white/90">
              <Download className="mr-2 h-4 w-4" />
              Part 1
            </Button>
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6">
        {parts.map((part, index) => (
          <section key={part.id} className="overflow-hidden rounded-lg border border-white/10 bg-black">
            <div className="flex items-center justify-between border-b border-white/10 px-3 py-2 text-xs text-white/70">
              <span>Part {index + 1}</span>
              <a className="hover:text-white" href={getDocumentPath('communication', part.id)} target="_blank" rel="noreferrer">
                Open part
              </a>
            </div>
            <iframe
              title={`${comic.title || 'Comic'} part ${index + 1}`}
              src={getDocumentPath('communication', part.id)}
              className="h-[82vh] w-full bg-white"
            />
          </section>
        ))}
      </main>
    </div>
  )
}
