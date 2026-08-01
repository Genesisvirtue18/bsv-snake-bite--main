'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Handshake, Images, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DEFAULT_CONTENT } from '@/lib/defaultContent'

export default function MankindAgritechCollaborationPage() {
  const [page, setPage] = useState(DEFAULT_CONTENT.mankindAgritech)
  const [activities, setActivities] = useState([])
  const [viewer, setViewer] = useState(null)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    fetch('/api/content')
      .then(response => response.ok ? response.json() : null)
      .then(content => {
        setPage({ ...DEFAULT_CONTENT.mankindAgritech, ...(content?.mankindAgritech || {}), ...(content?.pageHeaders?.mankindAgritech || {}) })
      })
      .catch(() => {})
    fetch('/api/mankind-agritech').then(response => response.ok ? response.json() : []).then(setActivities).catch(() => setActivities([]))
  }, [])

  const visibleActivities = activities.filter(item => item.published !== false)
  const nextImage = () => setActiveIndex(index => (index + 1) % viewer.images.length)
  const prevImage = () => setActiveIndex(index => (index - 1 + viewer.images.length) % viewer.images.length)

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-bsv-blue text-white py-4">
        <div className="container mx-auto px-4 flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" className="text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-1" /> Home
            </Button>
          </Link>
          <div>
            <div className="font-display font-extrabold text-xl">{page.title}</div>
            <div className="text-xs text-white/70">Activity Images With Mankind Agritech</div>
          </div>
        </div>
      </header>

      <main>
        <section className="py-16 md:py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-5">
              <Handshake className="w-8 h-8 text-bsv-blue" />
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-extrabold text-bsv-blue mb-5">{page.title}</h1>
            <p className="text-slate-600 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">{page.description}</p>
          </div>
        </section>

        {(page.image || page.body) && (
          <section className="py-12 md:py-16">
            <div className="max-w-4xl mx-auto px-4 grid gap-8 items-center md:grid-cols-2">
              {page.image && <img src={page.image} alt={page.title} className="w-full rounded-2xl shadow-lg object-cover" />}
              {page.body && <p className="whitespace-pre-line text-slate-700 leading-relaxed text-base md:text-lg">{page.body}</p>}
            </div>
          </section>
        )}

        <section className="py-10 md:py-14 bg-slate-50">
          <div className="max-w-6xl mx-auto px-4">
            {!visibleActivities.length && <Card><CardContent className="p-12 text-center"><Handshake className="w-16 h-16 mx-auto text-slate-300 mb-3" /><h2 className="font-display font-bold text-xl text-bsv-blue">Stories of Collaboration Coming Soon</h2><p className="text-muted-foreground">Updates from our collaboration with Mankind Agritech will be shared here.</p></CardContent></Card>}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleActivities.map((item, index) => {
                const gallery = item.activityImages || []
                const coverImage = item.logo || gallery[0]
                return <Card key={item.id || index} className="overflow-hidden hover:shadow-xl transition"><CardContent className="p-0"><div className="relative h-56 bg-slate-200 overflow-hidden">{coverImage ? <img src={coverImage} alt={item.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Images className="w-14 h-14 text-slate-400" /></div>}{gallery.length > 0 && <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-3 py-1.5 rounded-full">{gallery.length} Photos</div>}</div><div className="p-5"><h2 className="font-display font-bold text-xl text-bsv-blue mb-2">{item.name}</h2><p className="text-sm text-slate-600 line-clamp-3 mb-4">{item.description}</p><Button size="sm" variant="outline" className="border-bsv-red text-bsv-red" disabled={!coverImage && !gallery.length} onClick={() => { setViewer({ title: item.name, images: gallery.length ? gallery : [coverImage] }); setActiveIndex(0) }}>View Photos <Images className="w-4 h-4 ml-2" /></Button></div></CardContent></Card>
              })}
            </div>
          </div>
        </section>
      </main>
      {viewer && <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4"><div className="bg-black rounded-xl max-w-5xl w-full overflow-hidden relative"><div className="flex items-center justify-between p-4 text-white"><div><h3 className="font-bold">{viewer.title}</h3><p className="text-sm text-white/70">{activeIndex + 1} / {viewer.images.length}</p></div><button onClick={() => setViewer(null)}><X className="w-6 h-6" /></button></div><div className="relative"><img src={viewer.images[activeIndex]} alt={viewer.title} className="w-full max-h-[70vh] object-contain bg-black" />{viewer.images.length > 1 && <><button onClick={prevImage} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-2"><ChevronLeft className="w-5 h-5" /></button><button onClick={nextImage} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-2"><ChevronRight className="w-5 h-5" /></button></>}</div>{viewer.images.length > 1 && <div className="flex gap-2 p-4 overflow-x-auto">{viewer.images.map((image, index) => <button key={image} onClick={() => setActiveIndex(index)} className={`w-20 h-16 rounded overflow-hidden border-2 shrink-0 ${activeIndex === index ? 'border-bsv-red' : 'border-transparent'}`}><img src={image} alt="" className="w-full h-full object-cover" /></button>)}</div>}</div></div>}
    </div>
  )
}
