'use client'

import { useEffect, useState } from 'react'
import { Search, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'
import { getT } from '@/lib/translations'

const BRAND = {
    blue: '#201F5E',
    red: '#0EAFC5',
    deep: '#0D71B8',
    navy: '#201F5E',
}

function SectionHeader({ badge, title, subtitle }) {
    return (
        <div className="text-center mb-10">
            <span className="inline-block mb-2 text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: BRAND.deep }}>
                {badge}
            </span>
            <h1 className="font-display text-[26px] md:text-[34px] font-bold mb-3 leading-tight" style={{ color: BRAND.navy }}>
                {title}
            </h1>
            {subtitle && <p className="text-slate-500 text-sm md:text-base max-w-xl mx-auto">{subtitle}</p>}
        </div>
    )
}

function GallerySection({ albums, t }) {
    const [filter, setFilter] = useState('all')
    const [q, setQ] = useState('')
    const [lightbox, setLightbox] = useState(null)

    const published = (albums || []).filter(a => a.published !== false)
    const categories = ['all', ...new Set(published.map(a => a.category).filter(Boolean))]
    const filtered = published.filter(
        a =>
            (filter === 'all' || a.category === filter) &&
            (!q || `${a.title} ${a.description}`.toLowerCase().includes(q.toLowerCase()))
    )

    if (!published.length) return null

    return (
        <section className="section-pad pt-28" style={{ background: '#FDF8FF' }}>
            <div className="container mx-auto px-4">
                <SectionHeader
                    badge={t.badges.gallery}
                    title={t.gallery.title}
                    subtitle={t.gallery.subtitle}
                />

                <div className="flex flex-wrap gap-2 mb-6 items-center">
                    <div className="relative flex-1 min-w-[200px] max-w-sm">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <Input
                            placeholder={t.gallery.search}
                            value={q}
                            onChange={e => setQ(e.target.value)}
                            className="pl-9"
                        />
                    </div>

                    {categories.map(c => (
                        <Button
                            key={c}
                            size="sm"
                            variant={filter === c ? 'default' : 'outline'}
                            onClick={() => setFilter(c)}
                            style={filter === c ? { background: BRAND.blue } : undefined}
                        >
                            {c === 'all' ? t.gallery.all : c}
                        </Button>
                    ))}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {filtered.map(a => (
                        <button
                            key={a.id || a._id}
                            onClick={() => setLightbox(a)}
                            className="group relative aspect-[4/3] overflow-hidden rounded-xl shadow-md hover:shadow-2xl transition bg-white"
                        >
                            {a.coverImage && (
                                <img
                                    src={a.coverImage}
                                    alt={a.title}
                                    className="w-full h-full object-contain bg-white p-3 group-hover:scale-105 transition duration-700"
                                />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                            <div className="absolute bottom-3 left-3 right-3 text-white text-left">
                                <Badge className="text-xs mb-1 border-0" style={{ background: BRAND.red }}>
                                    {a.category}
                                </Badge>
                                <div className="font-semibold text-sm line-clamp-2">{a.title}</div>
                                <div className="text-xs text-white/80">{a.images?.length || 0} {t.gallery.photos}</div>
                            </div>
                        </button>
                    ))}
                </div>

                {lightbox && (
                    <Dialog open onOpenChange={() => setLightbox(null)}>
                        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>{lightbox.title}</DialogTitle>
                                <DialogDescription>{lightbox.description}</DialogDescription>
                            </DialogHeader>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {(lightbox.images || []).map((img, i) => (
                                    <img key={i} src={img} alt="" className="w-full h-48 object-cover rounded-lg" />
                                ))}

                                {!lightbox.images?.length && lightbox.coverImage && (
                                    <img src={lightbox.coverImage} alt="" className="w-full h-96 object-cover rounded-lg col-span-full" />
                                )}
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </section>
    )
}

export default function GalleryPage() {
    const [albums, setAlbums] = useState([])
    const t = getT('en')

    useEffect(() => {
        fetch('/api/gallery')
            .then(r => r.json())
            .then(data => setAlbums(Array.isArray(data) ? data : []))
    }, [])

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-bsv-blue text-white py-4">
                <div className="container mx-auto px-4 flex items-center gap-3">
                    <Link href="/">
                        <Button variant="ghost" className="text-white hover:bg-white/10">
                            <ArrowLeft className="w-4 h-4 mr-1" />Home
                        </Button>
                    </Link>
                    <div>
                        <div className="font-display font-extrabold text-xl">Gallery</div>
                        <div className="text-xs text-white/70">Moments from the movement</div>
                    </div>
                </div>
            </header>

            <GallerySection albums={albums} t={t} />
        </div>
    )
}