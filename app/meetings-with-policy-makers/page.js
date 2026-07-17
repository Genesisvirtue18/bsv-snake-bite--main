'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
    ArrowLeft,
    BookOpen,
    ExternalLink,
    Download,
    FileText,
    Image as ImageIcon,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

function getDocuments(card) {
    const docs = Array.isArray(card?.documents)
        ? card.documents
        : []

    return docs
        .map((doc, index) => ({
            id: doc.id || `doc-${index}`,
            title: doc.title || `Document ${index + 1}`,
            description: doc.description || '',
            coverImage: doc.coverImage || '',
            url: doc.url || doc.fileUrl || '',
        }))
        .filter((doc) => doc.url)
}

// Helper function to get absolute URL
function getAbsoluteUrl(url = '') {
    if (!url) return ''
    if (/^https?:\/\//i.test(url)) {
        return url
    }
    if (typeof window === 'undefined') {
        return url
    }
    return `${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`
}

// View document function - opens in new tab
function viewDocument(doc) {
    const absoluteUrl = getAbsoluteUrl(doc.url)

    if (!absoluteUrl) {
        alert('Document URL not found')
        return
    }

    // Check if it's a PDF
    const isPdf = absoluteUrl.toLowerCase().split('?')[0].endsWith('.pdf')

    if (isPdf) {
        window.open(absoluteUrl, '_blank', 'noopener,noreferrer')
        return
    }

    // Check if it's a Google Drive link
    const isDrive = absoluteUrl.includes('drive.google.com') || absoluteUrl.includes('docs.google.com')

    if (isDrive) {
        window.open(absoluteUrl, '_blank', 'noopener,noreferrer')
        return
    }

    // For DOCX, DOC, PPTX, XLSX - use Office Viewer
    const officeViewerUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(absoluteUrl)}`
    window.open(officeViewerUrl, '_blank', 'noopener,noreferrer')
}

export default function MeetingWithPolicyMakersPage() {
    const [content, setContent] = useState(null)

    useEffect(() => {
        fetch('/api/content')
            .then((res) => {
                if (!res.ok) {
                    throw new Error('Failed to fetch content')
                }
                return res.json()
            })
            .then((data) => {
                setContent(data)
            })
            .catch((error) => {
                console.error('Error fetching content:', error)
                setContent(null)
            })
    }, [])

    const policyCard = content?.access?.items?.[2] || {}
    const documents = useMemo(() => getDocuments(policyCard), [policyCard])
    const title = policyCard.title || 'Meeting with Policy-Makers'
    const description = policyCard.description || 'Policy discussions, advocacy initiatives, official meetings and reports.'
    const heroImage = policyCard.coverImage || policyCard.image || ''

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-[#f8fff9] to-[#eef3ff]">
            {/* Header */}
            <header className="bg-[#201F5E] text-white py-4">
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
                            {description}
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 pt-5 md:pt-7 pb-12">
                {/* Hero Section */}
                <section className="relative overflow-hidden rounded-3xl bg-white border shadow-sm mb-10">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-indigo-50" />

                    <div className="relative px-5 md:px-10 py-12 text-center max-w-4xl mx-auto">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white shadow mb-5">
                            <BookOpen className="w-8 h-8 text-[#201F5E]" />
                        </div>

                        {heroImage && (
                            <div className="mb-6">
                                <img
                                    src={heroImage}
                                    alt={title}
                                    className="w-full max-w-3xl mx-auto rounded-2xl object-cover shadow-lg"
                                    style={{ maxHeight: '400px' }}
                                />
                            </div>
                        )}

                        <h1 className="font-display text-[38px] md:text-[58px] font-extrabold leading-tight text-[#09084f]">
                            {title}
                        </h1>

                        <p className="text-slate-600 text-base md:text-lg leading-relaxed">
                            {description}
                        </p>
                    </div>
                </section>

                {/* Document Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 max-w-6xl mx-auto">
                    {documents.length === 0 ? (
                        <div className="col-span-full">
                            <div className="rounded-2xl border border-dashed bg-white/70 p-10 text-center">
                                <FileText className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                                <p className="text-slate-500">No policy documents added yet.</p>
                            </div>
                        </div>
                    ) : (
                        documents.map((doc) => (
                            <Card
                                key={doc.id}
                                className="overflow-hidden rounded-2xl border bg-white shadow-sm hover:shadow-xl transition-all duration-300 group max-w-[400px] mx-auto w-full"
                            >
                                <CardContent className="p-0">
                                    {/* Cover Image */}
                                    <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                                        {doc.coverImage ? (
                                            <img
                                                src={doc.coverImage}
                                                alt={doc.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-[#201F5E] to-[#16A34A] flex items-center justify-center">
                                                <FileText className="w-12 h-12 text-white/70" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Card Content */}
                                    <div className="p-4 sm:p-5 flex flex-col">
                                        <h3 className="font-display font-bold text-base sm:text-lg text-[#09084f] line-clamp-2 min-h-[3.5rem]">
                                            {doc.title}
                                        </h3>

                                        {doc.description && (
                                            <p className="mt-1.5 text-sm text-slate-600 leading-relaxed line-clamp-2 min-h-[2.5rem]">
                                                {doc.description}
                                            </p>
                                        )}

                                        <div className="mt-4 flex gap-2">
                                            {/* View Button - opens in new tab using viewDocument */}
                                            <Button
                                                size="sm"
                                                className="flex-1 bg-[#201F5E] hover:bg-[#17164d] text-xs sm:text-sm"
                                                onClick={() => viewDocument(doc)}
                                            >
                                                <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                                                View
                                            </Button>

                                            {/* Download Button - downloads the file */}
                                            <Button
                                                asChild
                                                size="sm"
                                                variant="outline"
                                                className="flex-1 text-xs sm:text-sm"
                                            >
                                                <a
                                                    href={doc.url}
                                                    download
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <Download className="w-3.5 h-3.5 mr-1.5" />
                                                    Download
                                                </a>
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </main>
        </div>
    )
}