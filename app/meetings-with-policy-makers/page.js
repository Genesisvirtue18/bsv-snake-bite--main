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
            {/* Header - Same as KOL page */}
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
                {/* Hero Section - Same as KOL page */}
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

                {/* Document Cards - Only documents, no filters, no heading */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                                className="overflow-hidden rounded-2xl border bg-white shadow-sm hover:shadow-xl transition-all duration-300 group"
                            >
                                <CardContent className="p-0">
                                    {/* Cover Image - Same as KOL video cards */}
                                    <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                                        {doc.coverImage ? (
                                            <img
                                                src={doc.coverImage}
                                                alt={doc.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-[#201F5E] to-[#16A34A] flex items-center justify-center">
                                                <FileText className="w-16 h-16 text-white/70" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Card Content - Same as KOL video cards */}
                                    <div className="p-5 flex flex-col h-[220px]">
                                        <h3 className="font-display font-bold text-lg text-[#09084f] line-clamp-2">
                                            {doc.title}
                                        </h3>

                                        {doc.description && (
                                            <p className="mt-2 text-sm text-slate-600 leading-6 line-clamp-3 flex-1">
                                                {doc.description}
                                            </p>
                                        )}

                                        <div className="mt-4 flex gap-3">
                                            <Button
                                                asChild
                                                className="flex-1 bg-[#201F5E] hover:bg-[#17164d]"
                                            >
                                                <a
                                                    href={doc.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <ExternalLink className="w-4 h-4 mr-2" />
                                                    View
                                                </a>
                                            </Button>

                                            <Button
                                                asChild
                                                variant="outline"
                                                className="flex-1"
                                            >
                                                <a
                                                    href={doc.url}
                                                    download
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <Download className="w-4 h-4 mr-2" />
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