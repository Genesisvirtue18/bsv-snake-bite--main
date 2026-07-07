'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Handshake, Images, X, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export default function NGONetworkPage() {
  const [ngos, setNgos] = useState([])
  const [viewer, setViewer] = useState(null)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    fetch('/api/ngos')
      .then(r => r.json())
      .then(d => setNgos(d.filter(n => n.published !== false)))
      .catch(() => setNgos([]))
  }, [])

  const openViewer = (ngo) => {
    const images = ngo.activityImages || []
    if (!images.length) return
    setViewer({ ...ngo, images })
    setActiveIndex(0)
  }

  const nextImage = () => {
    setActiveIndex(i => (i + 1) % viewer.images.length)
  }

  const prevImage = () => {
    setActiveIndex(i => (i - 1 + viewer.images.length) % viewer.images.length)
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
          NGO Collaborations
        </div>
        <div className="text-xs text-white/70">
          Activity Images With NGO Partners
        </div>
      </div>
    </div>
  </header>

  <section className="py-16 md:py-20 bg-white">
    <div className="max-w-4xl mx-auto px-4 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-5">
        <Handshake className="w-8 h-8 text-bsv-blue" />
      </div>

      <h1 className="font-display text-4xl md:text-6xl font-extrabold text-bsv-blue mb-5">
        NGO Collaborations
      </h1>

      <p className="text-slate-600 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
        Activity images from collaborations with grassroots organizations for snakebite awareness.
      </p>
    </div>
  </section>

  <main className="container mx-auto px-4 py-10">


        {!ngos.length && (
          <Card>
            <CardContent className="p-12 text-center">
              <Handshake className="w-16 h-16 mx-auto text-slate-300 mb-3" />
              <h3 className="font-display font-bold text-xl text-bsv-blue">
                NGO Activities Coming Soon
              </h3>
              <p className="text-muted-foreground">
                Activity images will be added here once uploaded from admin.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ngos.map(n => {
            const activityImages = n.activityImages || []
            const coverImage = n.logo || activityImages[0]

            return (
              <Card key={n.id} className="overflow-hidden hover:shadow-xl transition">
                <CardContent className="p-0">
                  <div className="relative h-56 bg-slate-200 overflow-hidden">
                    {coverImage ? (
                      <img
                        src={coverImage}
                        alt={n.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Images className="w-14 h-14 text-slate-400" />
                      </div>
                    )}


                    {activityImages.length > 0 && (
                      <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-3 py-1.5 rounded-full">
                        {activityImages.length} Photos
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <h3 className="font-display font-bold text-xl text-bsv-blue mb-2">
                      {n.name}
                    </h3>

                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                      {n.description}
                    </p>

                    <Button
                      variant="outline"
                      className="border-bsv-red text-bsv-red hover:bg-bsv-red hover:text-white"
                      onClick={() => openViewer(n)}
                      disabled={!activityImages.length}
                    >
                      View Photos
                      <Images className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </main>

      {viewer && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-black rounded-xl max-w-4xl w-full overflow-hidden relative">
            <div className="flex items-center justify-between p-4 text-white">
              <div>
                <h3 className="font-bold">{viewer.name} - Activity Photos</h3>
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