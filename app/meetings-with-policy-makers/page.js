'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, BookOpen, Images, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

function getImageAlbums(card) {
    const albums = Array.isArray(card?.policyImageAlbums) ? card.policyImageAlbums : []

    return albums
        .map((album, index) => {
            const images = Array.isArray(album.images) ? album.images.filter(Boolean) : []
            const coverImage = album.coverImage || images[0] || ''

            return {
                id: album.id || `policy-album-${index}`,
                title: album.title || `Photo Album ${index + 1}`,
                description: album.description || '',
                coverImage,
                images: images.length ? images : (coverImage ? [coverImage] : []),
            }
        })
        .filter((album) => album.images.length)
}

export default function MeetingWithPolicyMakersPage() {
    const [content, setContent] = useState(null)
    const [activeAlbum, setActiveAlbum] = useState(null)

    useEffect(() => {
        fetch('/api/content')
            .then((res) => {
                if (!res.ok) throw new Error('Failed to fetch content')
                return res.json()
            })
            .then(setContent)
            .catch(() => setContent(null))
    }, [])

    const policyCard = content?.access?.items?.[2] || {}
    const albums = useMemo(() => getImageAlbums(policyCard), [policyCard])
    const title = policyCard.title || ''
    const description = policyCard.desc || policyCard.description || ''

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-[#f8fff9] to-[#eef3ff]">
            <header className="bg-[#201F5E] text-white py-4">
                <div className="container mx-auto px-4 flex items-center gap-3">
                    <Link href="/"><Button variant="ghost" className="text-white hover:bg-white/10"><ArrowLeft className="w-4 h-4 mr-1" />Home</Button></Link>
                    <div><div className="font-display font-extrabold text-xl">{title}</div><div className="text-xs text-white/70">{description}</div></div>
                </div>
            </header>

            <main className="container mx-auto px-4 pt-5 md:pt-7 pb-12">
                <section className="relative overflow-hidden rounded-3xl bg-white border shadow-sm mb-10">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-indigo-50" />
                    <div className="relative px-5 md:px-10 py-12 text-center max-w-4xl mx-auto">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white shadow mb-5"><BookOpen className="w-8 h-8 text-[#201F5E]" /></div>
                        <h1 className="font-display text-[38px] md:text-[58px] font-extrabold leading-tight text-[#09084f]">{title}</h1>
                        <p className="text-slate-600 text-base md:text-lg leading-relaxed">{description}</p>
                    </div>
                </section>

                <section className="max-w-6xl mx-auto">
                    <div className="flex items-center gap-3 mb-5"><Images className="w-6 h-6 text-[#201F5E]" /><h2 className="font-display font-bold text-2xl text-[#09084f]">Photo Albums</h2></div>
                    {!albums.length ? (
                        <div className="rounded-2xl border border-dashed bg-white/70 p-10 text-center"><Images className="w-12 h-12 mx-auto text-slate-300 mb-3" /><p className="text-slate-500">No photo albums added yet.</p></div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {albums.map((album) => (
                                <button key={album.id} type="button" onClick={() => setActiveAlbum(album)} className="text-left group">
                                    <Card className="overflow-hidden rounded-2xl border bg-white shadow-sm hover:shadow-xl transition-all duration-300 h-full">
                                        <CardContent className="p-0">
                                            <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                                                <img src={album.coverImage} alt={album.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                                                <span className="absolute left-3 top-3 rounded-full bg-[#201F5E] px-3 py-1 text-xs font-bold text-white">{album.images.length} {album.images.length === 1 ? 'photo' : 'photos'}</span>
                                            </div>
                                            <div className="p-4"><h3 className="font-display font-bold text-lg text-[#09084f]">{album.title}</h3>{album.description && <p className="mt-1 text-sm text-slate-600 line-clamp-2">{album.description}</p>}</div>
                                        </CardContent>
                                    </Card>
                                </button>
                            ))}
                        </div>
                    )}
                </section>
            </main>

            {activeAlbum && (
                <div className="fixed inset-0 z-50 bg-black/75 p-4 flex items-center justify-center" onClick={() => setActiveAlbum(null)}>
                    <div className="relative max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white p-5" onClick={(event) => event.stopPropagation()}>
                        <button type="button" onClick={() => setActiveAlbum(null)} className="absolute right-4 top-4 rounded-full bg-slate-100 p-2 text-slate-700"><X className="w-5 h-5" /></button>
                        <h2 className="font-display font-bold text-xl text-[#09084f] pr-12">{activeAlbum.title}</h2>
                        {activeAlbum.description && <p className="mt-1 text-slate-600">{activeAlbum.description}</p>}
                        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{activeAlbum.images.map((image, index) => <img key={`${image}-${index}`} src={image} alt={`${activeAlbum.title} ${index + 1}`} className="w-full rounded-xl object-cover" />)}</div>
                    </div>
                </div>
            )}
        </div>
    )
}
