'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Images } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'

export default function SarpathonPhotoGallery({ albums }) {
  const [viewer, setViewer] = useState(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const move = direction => setActiveIndex(index => (index + direction + viewer.images.length) % viewer.images.length)

  return (
    <>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {albums.map(album => {
          const photos = album.images?.length ? album.images : album.coverImage ? [album.coverImage] : []
          const cover = album.coverImage || photos[0]
          const open = () => { setViewer({ ...album, images: photos }); setActiveIndex(0) }
          return (
            <Card key={album.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 group h-full">
              <CardContent className="p-0">
                <button type="button" onClick={open} disabled={!photos.length} aria-label={`View photos: ${album.title}`} className="relative block w-full h-56 bg-slate-200 overflow-hidden">
                  {cover && <img src={cover} alt={album.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />}
                  <span className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-3 py-1.5 rounded-full">{photos.length} {photos.length === 1 ? 'Photo' : 'Photos'}</span>
                </button>
                <div className="p-5">
                  <h3 className="font-display font-bold text-xl text-bsv-blue mb-2">{album.title}</h3>
                  {album.description && <p className="text-sm text-slate-600 line-clamp-3 mb-4">{album.description}</p>}
                  <Button type="button" size="sm" variant="outline" className="mt-4 border-bsv-red text-bsv-red hover:bg-bsv-red hover:text-white" onClick={open} disabled={!photos.length}>
                    View Photos <Images className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
      {viewer && (
        <Dialog open onOpenChange={open => { if (!open) setViewer(null) }}>
          <DialogContent className="w-[calc(100%-2rem)] max-w-5xl max-h-[95dvh] overflow-y-auto rounded-xl border-0 bg-black text-white p-0 gap-0" onKeyDown={event => {
            if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1) }
            if (event.key === 'ArrowRight') { event.preventDefault(); move(1) }
          }}>
            <DialogHeader className="p-4 pr-12 text-left">
              <DialogTitle className="text-base">{viewer.title}</DialogTitle>
              <DialogDescription className="text-white/70" aria-live="polite">{activeIndex + 1} / {viewer.images.length}</DialogDescription>
            </DialogHeader>
            <div className="relative">
              <img src={viewer.images[activeIndex]} alt={`${viewer.title} - Photo ${activeIndex + 1}`} className="w-full max-h-[65dvh] object-contain bg-black" />
              {viewer.images.length > 1 && <>
                <button type="button" aria-label="Previous photo" onClick={() => move(-1)} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 text-bsv-blue rounded-full p-2"><ChevronLeft className="w-5 h-5" /></button>
                <button type="button" aria-label="Next photo" onClick={() => move(1)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 text-bsv-blue rounded-full p-2"><ChevronRight className="w-5 h-5" /></button>
              </>}
            </div>
            {viewer.images.length > 1 && (
              <div className="flex gap-2 p-4 overflow-x-auto">
                {viewer.images.map((src, index) => (
                  <button key={index} type="button" aria-label={`Show photo ${index + 1}`} aria-pressed={activeIndex === index} onClick={() => setActiveIndex(index)} className={`w-20 h-16 rounded overflow-hidden border-2 shrink-0 ${activeIndex === index ? 'border-bsv-red' : 'border-transparent'}`}>
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
