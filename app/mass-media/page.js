'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Radio,
  Newspaper,
  Users,
  Images,
  X,
  ChevronLeft,
  ChevronRight,
  Megaphone,
  CalendarDays,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const CATEGORIES = [
  { key: 'all', label: 'All', icon: Megaphone },
  { key: 'PR Coverage', label: 'PR Coverage', icon: Newspaper },
  { key: 'Radio Coverage', label: 'Radio Coverage', icon: Radio },
  { key: 'Influencers', label: 'Influencers', icon: Users },
]

export default function MassMediaPage() {
  const [content, setContent] = useState(null)
  const [activeFilter, setActiveFilter] = useState('all')
  const [viewer, setViewer] = useState(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const BRAND = {
    blue: '#201F5E',
    red: '#de2527',
  }

  useEffect(() => {
    fetch('/api/content')
      .then(r => r.json())
      .then(setContent)
      .catch(() => setContent(null))
  }, [])

  const items = useMemo(() => {
    const cmsItems = content?.massMediaActivities || []

    return cmsItems
      .filter(item => item.published !== false)
      .filter(item => activeFilter === 'all' || item.category === activeFilter)
  }, [content, activeFilter])

  const openViewer = (item) => {
    const images = item.gallery?.length
      ? item.gallery
      : item.image
        ? [item.image]
        : []

    if (!images.length) return

    setViewer({ ...item, images })
    setActiveIndex(0)
  }

  const nextImage = () => {
    setActiveIndex(i => (i + 1) % viewer.images.length)
  }

  const prevImage = () => {
    setActiveIndex(i => (i - 1 + viewer.images.length) % viewer.images.length)
  }

  const categoryColor = (category) => {
    if (category === 'PR Coverage') return '#de2527'
    if (category === 'Radio Coverage') return '#2563eb'
    if (category === 'Influencers') return '#7c3aed'
    return BRAND.blue
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-bsv-blue text-white py-4">
        <div className="container mx-auto px-4 flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" className="text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Home
            </Button>
          </Link>

          <div>
            <div className="font-display font-extrabold text-xl">
              Mass Media
            </div>
            <div className="text-xs text-white/70">
              PR, Radio Coverage and Influencers
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className="py-14 md:py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
              <Megaphone className="w-8 h-8" style={{ color: BRAND.blue }} />
            </div>

            <h1
              className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4"
              style={{ color: BRAND.blue }}
            >
              Mass Media Coverage
            </h1>

            <p className="text-slate-600 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              Press coverage, radio outreach and influencer collaborations helping spread the hospital-first snakebite treatment message.
            </p>
          </div>
        </section>

        <section className="py-10 md:py-14 bg-slate-50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-3 mb-10">
              {CATEGORIES.map(cat => {
                const Icon = cat.icon
                const active = activeFilter === cat.key

                return (
                  <button
                    key={cat.key}
                    onClick={() => setActiveFilter(cat.key)}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm font-bold transition-all ${
                      active
                        ? 'text-white shadow-md'
                        : 'bg-white text-bsv-blue border-bsv-blue/30 hover:border-bsv-blue'
                    }`}
                    style={active ? { background: BRAND.red, borderColor: BRAND.red } : undefined}
                  >
                    <Icon className="w-4 h-4" />
                    {cat.label}
                  </button>
                )
              })}
            </div>

            <div className="flex items-center justify-center gap-3 mb-8">
              <span className="h-px w-16 bg-slate-300" />
              <span className="text-sm text-slate-500 font-medium">
                {activeFilter === 'all' ? 'Showing All Activities' : activeFilter}
              </span>
              <span className="h-px w-16 bg-slate-300" />
            </div>

            {!items.length && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Images className="w-16 h-16 mx-auto text-slate-300 mb-3" />
                  <h3 className="font-display font-bold text-xl text-bsv-blue">
                    Mass Media Activities Coming Soon
                  </h3>
                  <p className="text-muted-foreground">
                    Activities will be visible here once added from admin.
                  </p>
                </CardContent>
              </Card>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item, i) => {
                const gallery = item.gallery || []
                const coverImage = item.image || gallery[0]
                const color = categoryColor(item.category)

                return (
                  <motion.div
                    key={item.id || i}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                  >
                    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group h-full">
                      <CardContent className="p-0">
                        <div className="relative h-56 bg-slate-200 overflow-hidden">
                          {coverImage ? (
                            <img
                              src={coverImage}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Images className="w-14 h-14 text-slate-400" />
                            </div>
                          )}

                          <div
                            className="absolute top-3 left-3 text-white text-xs font-bold px-3 py-1.5 rounded-md"
                            style={{ background: color }}
                          >
                            {item.category}
                          </div>

                          {gallery.length > 0 && (
                            <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-3 py-1.5 rounded-full">
                              {gallery.length} Photos
                            </div>
                          )}
                        </div>

                        <div className="p-5">
                          <h3 className="font-display font-bold text-xl text-bsv-blue mb-2">
                            {item.title}
                          </h3>

                          <p className="text-sm text-slate-600 line-clamp-3 mb-4">
                            {item.description}
                          </p>

                          <div className="flex items-center justify-between gap-3">
                            {item.date && (
                              <div className="flex items-center gap-1 text-xs text-slate-500">
                                <CalendarDays className="w-3.5 h-3.5" />
                                {item.date}
                              </div>
                            )}

                            <Button
                              size="sm"
                              variant="outline"
                              className="ml-auto border-bsv-red text-bsv-red hover:bg-bsv-red hover:text-white"
                              onClick={() => openViewer(item)}
                              disabled={!coverImage && !gallery.length}
                            >
                              View Photos
                              <Images className="w-4 h-4 ml-2" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>
      </main>

      {viewer && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="bg-black rounded-xl max-w-5xl w-full overflow-hidden relative">
            <div className="flex items-center justify-between p-4 text-white">
              <div>
                <h3 className="font-bold">{viewer.title}</h3>
                <p className="text-sm text-white/70">
                  {activeIndex + 1} / {viewer.images.length}
                </p>
              </div>

              <button onClick={() => setViewer(null)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="relative">
              <img
                src={viewer.images[activeIndex]}
                alt=""
                className="w-full max-h-[70vh] object-contain bg-black"
              />

              {viewer.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-2"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <button
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-2"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {viewer.images.length > 1 && (
              <div className="flex gap-2 p-4 overflow-x-auto">
                {viewer.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIndex(i)}
                    className={`w-20 h-16 rounded overflow-hidden border-2 shrink-0 ${
                      activeIndex === i ? 'border-bsv-red' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}