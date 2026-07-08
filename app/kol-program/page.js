'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
    ArrowLeft,
    BookOpen,
    ExternalLink,
    FileText,
    Grid2X2,
    Image as ImageIcon,
    Images,
    Play,
    X,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'

const FILTERS = [
    { id: 'all', label: 'All', icon: Grid2X2 },
    { id: 'videos', label: 'Videos', icon: Play },
    { id: 'images', label: 'Images', icon: Images },
    { id: 'documents', label: 'Documents', icon: FileText },
]

function getYoutubeId(url = '') {
    const value = String(url || '').trim()
    if (!value) return ''

    try {
        const u = new URL(value)
        const host = u.hostname.replace('www.', '')
        const parts = u.pathname.split('/').filter(Boolean)

        if (host.includes('youtu.be')) return parts[0] || ''

        if (host.includes('youtube.com')) {
            if (parts[0] === 'live') return parts[1] || ''
            if (parts[0] === 'embed') return parts[1] || ''
            if (parts[0] === 'shorts') return parts[1] || ''
            return u.searchParams.get('v') || ''
        }

        return ''
    } catch {
        return ''
    }
}

function getDriveFileId(url = '') {
    const value = String(url || '').trim()
    if (!value) return ''

    return (
        value.match(/\/file\/d\/([^/?#]+)/)?.[1] ||
        value.match(/[?&]id=([^&#]+)/)?.[1] ||
        value.match(/\/d\/([^/?#]+)/)?.[1] ||
        ''
    )
}

function getDrivePreviewUrl(url = '') {
    const id = getDriveFileId(url)
    return id ? `https://drive.google.com/file/d/${id}/preview` : url
}

function getVideoType(url = '') {
    const value = String(url || '').toLowerCase()

    if (value.includes('youtube.com') || value.includes('youtu.be')) {
        return 'youtube'
    }

    if (value.includes('drive.google.com') || value.includes('docs.google.com')) {
        return 'drive'
    }

    if (
        value.includes('/api/media/') ||
        value.endsWith('.mp4') ||
        value.endsWith('.webm') ||
        value.endsWith('.mov') ||
        value.endsWith('.m4v')
    ) {
        return 'file'
    }

    return 'link'
}

function parseVideoLinks(value = '') {
    return String(value || '')
        .split('\n')
        .map(v => v.trim())
        .filter(Boolean)
        .map((line, index) => {
            const parts = line.split('|').map(v => v.trim())
            const hasTitle = parts.length > 1

            return {
                id: `${index}-${line}`,
                title: hasTitle ? parts[0] : `KOL Video ${index + 1}`,
                url: hasTitle ? parts.slice(1).join('|').trim() : line,
                type: getVideoType(hasTitle ? parts.slice(1).join('|').trim() : line),
            }
        })
        .filter(v => v.url)
}

function getVideoEmbedUrl(video) {
    if (!video?.url) return ''

    if (video.type === 'youtube') {
        const id = getYoutubeId(video.url)
        return id ? `https://www.youtube.com/embed/${id}?rel=0` : video.url
    }

    if (video.type === 'drive') {
        return getDrivePreviewUrl(video.url)
    }

    return video.url
}

function getVideoThumbnail(video) {
    if (video?.type !== 'youtube') return ''

    const id = getYoutubeId(video.url)
    return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : ''
}

function getImageAlbums(card) {
    const albums = Array.isArray(card?.kolImageAlbums)
        ? card.kolImageAlbums
        : Array.isArray(card?.trainingImageAlbums)
            ? card.trainingImageAlbums
            : []

    const normalized = albums
        .map((album, index) => ({
            id: album.id || `album-${index}`,
            title: album.title || `KOL Album ${index + 1}`,
            description: album.description || '',
            coverImage: album.coverImage || '',
            images: Array.isArray(album.images) ? album.images.filter(Boolean) : [],
        }))
        .filter(album => album.coverImage || album.images.length)

    if (normalized.length) return normalized

    const oldImages = Array.isArray(card?.trainingImages)
        ? card.trainingImages.filter(Boolean)
        : []

    if (oldImages.length) {
        return [
            {
                id: 'training-images',
                title: 'KOL Images',
                description: 'KOL photos and webinar screenshots.',
                coverImage: oldImages[0],
                images: oldImages,
            },
        ]
    }

    return []
}

function getDocuments(card) {
    const docs = Array.isArray(card?.kolDocuments)
        ? card.kolDocuments
        : Array.isArray(card?.trainingDocuments)
            ? card.trainingDocuments
            : []

    return docs
        .map((doc, index) => ({
            title: doc.title || `KOL Document ${index + 1}`,
            url: doc.url || doc.fileUrl || doc.href || '',
        }))
        .filter(doc => doc.url)
}

export default function KOLProgramPage() {
    const [content, setContent] = useState(null)
    const [filter, setFilter] = useState('all')
    const [activeVideo, setActiveVideo] = useState(null)
    const [activeAlbum, setActiveAlbum] = useState(null)

    useEffect(() => {
        fetch('/api/content')
            .then(r => r.json())
            .then(data => setContent(data))
            .catch(() => setContent(null))
    }, [])

    const kolCard = content?.access?.items?.[1] || {}

    const videos = useMemo(() => {
        // New admin Add Video system
        if (
            Array.isArray(kolCard.kolVideoItems) &&
            kolCard.kolVideoItems.length
        ) {
            return kolCard.kolVideoItems
                .map((video, index) => {
                    const url = video.url || video.link || ''

                    return {
                        id: `${index}-${url}`,
                        title: video.title || `KOL Video ${index + 1}`,
                        url,
                        type: getVideoType(url),
                        coverImage: video.coverImage || video.thumbnail || video.image || '',
                    }
                })
                .filter(video => video.url)
        }

        // Old textarea / old single video fallback
        return parseVideoLinks(
            kolCard.trainingVideos ||
            kolCard.youtubeUrl ||
            kolCard.videoUrl ||
            kolCard.youtubeLink ||
            ''
        )
    }, [kolCard])

    const imageAlbums = useMemo(() => getImageAlbums(kolCard), [kolCard])
    const documents = useMemo(() => getDocuments(kolCard), [kolCard])

    const showVideos = filter === 'all' || filter === 'videos'
    const showImages = filter === 'all' || filter === 'images'
    const showDocuments = filter === 'all' || filter === 'documents'

    const title = kolCard.title || 'KOL Program'
    const description =
        kolCard.desc ||
        kolCard.description ||
        'Conferences & webinars for snakebite training clinicians.'

    const activeAlbumImages = activeAlbum
        ? activeAlbum.images?.length
            ? activeAlbum.images
            : activeAlbum.coverImage
                ? [activeAlbum.coverImage]
                : []
        : []

    const openKOLVideo = (video) => {
        const url = video?.url || ''
        if (!url) return

        // YouTube website ke andar modal me chalega
        if (video.type === 'youtube') {
            setActiveVideo(video)
            return
        }

        // Google Drive / other links direct new tab me open honge
        window.open(url, '_blank', 'noopener,noreferrer')
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-[#f8fff9] to-[#eef3ff]">
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
                            {title}
                        </div>
                        <div className="text-xs text-white/70">
                            Conferences & webinars for snakebite training clinicians.
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 pt-5 md:pt-7 pb-12">
                <section className="relative overflow-hidden rounded-3xl bg-white border shadow-sm mb-10">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-indigo-50" />

                    <div className="relative px-5 md:px-10 py-12 text-center max-w-4xl mx-auto">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white shadow mb-5">
                            <BookOpen className="w-8 h-8 text-[#201F5E]" />
                        </div>



                        <h1 className="font-display text-[38px] md:text-[58px] font-extrabold leading-tight text-[#09084f]">
                            {title}
                        </h1>



                        <p className="text-slate-600 text-base md:text-lg leading-relaxed">
                            {description}
                        </p>
                    </div>
                </section>

                <div className="mb-9">
                    <div className="flex flex-wrap justify-center gap-3">
                        {FILTERS.map(item => {
                            const Icon = item.icon

                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setFilter(item.id)}
                                    className={[
                                        'min-w-[130px] rounded-xl border px-5 py-3 text-sm md:text-base font-semibold transition-all flex items-center justify-center gap-2',
                                        filter === item.id
                                            ? 'border-[#201F8F] bg-[#201F8F] text-white shadow-lg shadow-[#201F8F]/20'
                                            : 'border-[#d8def0] bg-white/90 text-[#09084f] hover:border-[#201F8F] hover:bg-white',
                                    ].join(' ')}
                                >
                                    <Icon className="w-4 h-4" />
                                    {item.label}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {showVideos && (
                    <section className="mb-10">
                        <SectionTitle icon={Play} title="Videos" count={videos.length} color="bg-[#201F8F]" />

                        {!videos.length ? (
                            <EmptyBox text="No KOL videos added yet." />
                        ) : (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {videos.map((video, index) => {
                                    const thumb = video.coverImage || getVideoThumbnail(video)

                                    return (
                                        <Card key={video.id} className="overflow-hidden rounded-2xl border bg-white shadow-sm hover:shadow-xl transition group">
                                            <CardContent className="p-0">
                                                <button
                                                    type="button"
                                                    onClick={() => openKOLVideo(video)}
                                                    className="relative aspect-video w-full bg-slate-900 overflow-hidden text-left"
                                                >
                                                    {thumb ? (
                                                        <img
                                                            src={thumb}
                                                            alt={video.title}
                                                            className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition duration-500"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-gradient-to-br from-[#201F5E] to-[#16A34A] flex items-center justify-center">
                                                            <Play className="w-16 h-16 text-white/80" />
                                                        </div>
                                                    )}

                                                    <div className="absolute inset-0 bg-black/25" />

                                                    <div className="absolute left-4 top-4">
                                                        <Badge className="bg-white text-[#201F5E] border-0">
                                                            {video.type === 'drive' ? 'Drive Video' : video.type === 'youtube' ? 'YouTube' : 'Video'}
                                                        </Badge>
                                                    </div>

                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="w-14 h-14 rounded-full bg-white text-[#201F5E] flex items-center justify-center shadow-lg">
                                                            <Play className="w-7 h-7 ml-1" />
                                                        </div>
                                                    </div>
                                                </button>

                                                <div className="p-5">
                                                    <h3 className="font-display font-bold text-lg text-[#09084f]">
                                                        {video.title || `KOL Video ${index + 1}`}
                                                    </h3>

                                                    <button
                                                        type="button"
                                                        onClick={() => openKOLVideo(video)}
                                                        className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-green-700 hover:text-green-800"
                                                    >
                                                        Watch video
                                                        <ExternalLink className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )
                                })}
                            </div>
                        )}
                    </section>
                )}

                {showImages && (
                    <section className="mb-10">
                        <SectionTitle icon={Images} title="Images" count={imageAlbums.length} color="bg-green-600" />

                        {!imageAlbums.length ? (
                            <EmptyBox text="No KOL image albums added yet." />
                        ) : (
                            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                                {imageAlbums.map((album, index) => {
                                    const cover = album.coverImage || album.images?.[0] || ''
                                    const photoCount = album.images?.length || (album.coverImage ? 1 : 0)

                                    return (
                                        <button
                                            key={album.id || index}
                                            type="button"
                                            onClick={() => setActiveAlbum(album)}
                                            className="group overflow-hidden rounded-2xl bg-white border shadow-sm hover:shadow-xl transition text-left"
                                        >
                                            <div className="relative aspect-[4/3] bg-white overflow-hidden">
                                                {cover ? (
                                                    <img
                                                        src={cover}
                                                        alt={album.title}
                                                        className="w-full h-full object-contain bg-white p-2 group-hover:scale-[1.03] transition duration-500"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-slate-100">
                                                        <ImageIcon className="w-12 h-12 text-slate-300" />
                                                    </div>
                                                )}

                                                <div className="absolute left-3 top-3">
                                                    <Badge className="border-0 bg-green-600 text-white">
                                                        {photoCount} {photoCount === 1 ? 'photo' : 'photos'}
                                                    </Badge>
                                                </div>
                                            </div>

                                            <div className="p-4">
                                                <div className="font-display font-bold text-[#09084f] text-base line-clamp-2">
                                                    {album.title || `KOL Album ${index + 1}`}
                                                </div>

                                                {album.description && (
                                                    <div className="text-xs text-slate-500 mt-1 line-clamp-2">
                                                        {album.description}
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        )}
                    </section>
                )}

                {showDocuments && (
                    <section>
                        <SectionTitle icon={FileText} title="Documents" count={documents.length} color="bg-orange-500" />

                        {!documents.length ? (
                            <EmptyBox text="No KOL documents added yet." />
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {documents.map((doc, index) => (
                                    <Card key={`${doc.url}-${index}`} className="rounded-2xl bg-white shadow-sm hover:shadow-xl transition">
                                        <CardContent className="p-5 flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center flex-shrink-0">
                                                <FileText className="w-6 h-6" />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-display font-bold text-[#09084f] truncate">
                                                    {doc.title || `KOL Document ${index + 1}`}
                                                </h3>

                                                <button
                                                    type="button"
                                                    onClick={() => window.open(doc.url, '_blank', 'noopener,noreferrer')}
                                                    className="mt-2 inline-flex items-center gap-2 text-sm font-bold text-orange-600 hover:text-orange-700"
                                                >
                                                    View / Download
                                                    <ExternalLink className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </section>
                )}
            </main>

            {activeVideo && (
                <Dialog open onOpenChange={() => setActiveVideo(null)}>
                    <DialogContent className="max-w-5xl w-[94vw] p-0 overflow-hidden">
                        <DialogHeader className="sr-only">
                            <DialogTitle>{activeVideo.title}</DialogTitle>
                            <DialogDescription>{activeVideo.url}</DialogDescription>
                        </DialogHeader>

                        <div className="flex items-center justify-between px-4 py-3 border-b bg-white">
                            <div className="font-display font-bold text-[#09084f] truncate pr-4">
                                {activeVideo.title}
                            </div>

                            <button
                                type="button"
                                onClick={() => setActiveVideo(null)}
                                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="aspect-video bg-black">
                            {activeVideo.type === 'file' ? (
                                <video
                                    key={activeVideo.url}
                                    src={activeVideo.url}
                                    controls
                                    className="w-full h-full"
                                >
                                    Your browser does not support the video tag.
                                </video>
                            ) : activeVideo.type === 'youtube' || activeVideo.type === 'drive' ? (
                                <iframe
                                    key={activeVideo.url}
                                    src={getVideoEmbedUrl(activeVideo)}
                                    title={activeVideo.title}
                                    className="w-full h-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-white p-6 text-center">
                                    <p className="text-sm text-white/80">
                                        This video link cannot be embedded directly.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={() => window.open(activeVideo.url, '_blank', 'noopener,noreferrer')}
                                        className="rounded-lg bg-white px-5 py-2 text-sm font-bold text-[#201F5E]"
                                    >
                                        Open video
                                    </button>
                                </div>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            {activeAlbum && (
                <Dialog open onOpenChange={() => setActiveAlbum(null)}>
                    <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{activeAlbum.title}</DialogTitle>
                            <DialogDescription>
                                {activeAlbum.description || 'KOL images and screenshots'}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {activeAlbumImages.map((img, index) => (
                                <img
                                    key={`${img}-${index}`}
                                    src={img}
                                    alt=""
                                    className={[
                                        'w-full rounded-xl bg-white',
                                        activeAlbumImages.length === 1
                                            ? 'h-96 object-contain col-span-full'
                                            : 'h-48 object-cover',
                                    ].join(' ')}
                                />
                            ))}
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    )
}

function SectionTitle({ icon: Icon, title, count, color }) {
    return (
        <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${color} text-white flex items-center justify-center`}>
                    <Icon className="w-5 h-5" />
                </div>

                <h2 className="font-display font-extrabold text-2xl text-[#09084f]">
                    {title}
                </h2>

                <Badge variant="outline">{count}</Badge>
            </div>
        </div>
    )
}

function EmptyBox({ text }) {
    return (
        <div className="rounded-2xl border border-dashed bg-white/70 p-10 text-center">
            <ImageIcon className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500">{text}</p>
        </div>
    )
}