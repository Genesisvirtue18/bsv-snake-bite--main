'use client'

import { useEffect, useState } from 'react'
import { Play, ArrowLeft, X } from 'lucide-react'
import Link from 'next/link'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { motion } from 'framer-motion'

const BSV_RED = '#de2527'
const BRAND = { navy: '#201F5E', deep: '#0D71B8' }
const VIDEO_BADGE = 'SaanpKaVaarAspataalMeinHiUpchaar'

function VideoCard({ v, onClick, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100"
    >
      <button onClick={() => onClick(v)} className="relative w-full group text-left block">
        <div className="relative aspect-video overflow-hidden bg-slate-900">
          {v.thumbnail && (
            <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
          )}
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center group-hover:scale-110 transition-all shadow-xl" style={{ background: BSV_RED }}>
              <Play className="w-6 h-6 fill-white text-white ml-0.5" />
            </div>
          </div>
          <div className="absolute bottom-3 left-3">
            <span className="inline-flex rounded-full px-3 py-1 text-[10px] font-bold text-white" style={{ background: BSV_RED }}>
              {VIDEO_BADGE}
            </span>
          </div>
        </div>
      </button>
      <div className="p-4">
        <h3 className="font-semibold text-[15px] leading-snug mb-1.5" style={{ color: BRAND.navy }}>{v.title}</h3>
        {v.description && <p className="text-[12px] text-slate-500 line-clamp-2">{v.description}</p>}
      </div>
    </motion.div>
  )
}

export default function VideosPage() {
  const [videos, setVideos] = useState([])
  const [active, setActive] = useState(null)

  useEffect(() => {
    fetch('/api/videos')
      .then(r => r.ok ? r.json() : [])
      .then(d => setVideos(Array.isArray(d) ? d.filter(v => v.published !== false) : []))
      .catch(() => { })
  }, [])

  // Merge CMS videos with the hardcoded Ganguly video (avoid duplicate)
  const allVideos = [...videos].sort((a, b) => {
    const featuredSort = Number(Boolean(b.featured)) - Number(Boolean(a.featured))
    if (featuredSort !== 0) return featuredSort

    const aOrder = a.sortOrder ?? a.order ?? 0
    const bOrder = b.sortOrder ?? b.order ?? 0
    return aOrder - bOrder
  })

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <div className="h-5 w-px bg-slate-200" />
          <h1 className="font-semibold text-[16px]" style={{ color: BRAND.navy }}>Campaign Videos</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Hero banner */}
        <div className="text-center mb-10">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full text-white shadow-md" style={{ background: BSV_RED }}>
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </div>
          <h2 className="font-bold text-[28px] md:text-[36px]" style={{ color: BRAND.navy }}>Watch the Campaign</h2>
          <p className="text-slate-500 text-sm mt-2 max-w-lg mx-auto">
            Powerful films, expert interviews, and ground-level stories driving snakebite awareness across India.
          </p>
        </div>

        {allVideos.length === 0 ? (
          <div className="text-center py-24 text-slate-400">
            <Play className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>Videos loading…</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {allVideos.map((v, i) => (
              <VideoCard key={v.id || i} v={v} onClick={setActive} index={i} />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {active && (
        <Dialog open onOpenChange={() => setActive(null)}>
          <DialogContent className="max-w-4xl w-[92vw] max-h-[82vh] overflow-y-auto p-0 bg-black mt-10">
            <DialogHeader className="sr-only">
              <DialogTitle>{active.title}</DialogTitle>
              <DialogDescription>{active.description}</DialogDescription>
            </DialogHeader>
            <div className="aspect-video w-full max-h-[65vh] bg-black">
              {active.youtubeId ? (
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${active.youtubeId}?autoplay=1&rel=0`}
                  title={active.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : active.url ? (
                <video src={active.url} controls autoPlay className="w-full h-full" />
              ) : null}
            </div>
            <div className="p-4 bg-white">
              <div className="font-semibold text-lg" style={{ color: BRAND.navy }}>{active.title}</div>
              {active.description && <p className="text-sm text-slate-600 mt-1">{active.description}</p>}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
