'use client'

import { useEffect, useState } from 'react'
import { DEFAULT_CONTENT } from '@/lib/defaultContent'
import { getT } from '@/lib/translations'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function DownloadsPage() {
    const [lang, setLang] = useState('en')
    const [settings, setSettings] = useState(DEFAULT_CONTENT?.settings || {})
    const t = getT(lang)

    const [content, setContent] = useState(null)
    const resources = content?.resources

    useEffect(() => {
        fetch('/api/content')
            .then((r) => r.json())
            .then((d) => setContent(d))
            .catch(console.error)

        fetch('/api/settings')
            .then((r) => (r.ok ? r.json() : null))
            .then((d) => {
                if (d) setSettings(d)
            })
            .catch(() => { })
    }, [])

    return (
        <>
            <header className="bg-bsv-blue text-white py-4">
                <div className="container mx-auto px-4 flex items-center gap-3">
                    <Link href="/">
                        <Button variant="ghost" className="text-white hover:bg-white/10">
                            <ArrowLeft className="w-4 h-4 mr-1" />Home
                        </Button>
                    </Link>
                    <div>
                        <div className="font-display font-extrabold text-xl">Downloads</div>
                        <div className="text-xs text-white/70">Resource library</div>
                    </div>
                </div>
            </header>

            <main className="min-h-screen bg-slate-50 pt-24 pb-16">
                <section id="resources" className="section-pad bg-slate-50">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-10">
                            <span className="inline-block mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#0D71B8]">
                                FREE DOWNLOADS
                            </span>

                            <h1 className="font-display text-[26px] md:text-[34px] font-bold mb-3 leading-tight text-[#201F5E]">
                                Resource Library
                            </h1>

                            <p className="text-slate-500 text-sm md:text-base max-w-xl mx-auto">
                                Posters, brochures, training material — quick download with just name, phone, and city.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {resources?.map((r) => (
                                <Card
                                    key={r.id}
                                    className="group overflow-hidden hover:shadow-2xl transition hover:-translate-y-1"
                                >
                                    <div className="aspect-video bg-slate-200 relative overflow-hidden">
                                        {r.preview && (
                                            <img
                                                src={r.preview}
                                                alt={r.title}
                                                className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                                            />
                                        )}

                                        <Badge className="absolute top-3 left-3 border-0 bg-[#0EAFC5]">
                                            {r.category}
                                        </Badge>
                                    </div>

                                    <CardContent className="p-5">
                                        <h3 className="font-display font-semibold mb-1 text-[#201F5E]">
                                            {r.title}
                                        </h3>

                                        <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                                            {r.desc}
                                        </p>

                                        <Button
                                            size="sm"
                                            className="w-full text-white bg-[#201F5E]"
                                            onClick={() => {
                                                if (r.file && r.file !== '#') {
                                                    window.open(r.file, '_blank')
                                                }
                                            }}
                                        >
                                            {t.resources?.download}
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
        </>
    )
}