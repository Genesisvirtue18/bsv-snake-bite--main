'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Download, FileText } from 'lucide-react'
import Link from 'next/link'

export default function ReportsPage() {
  const [reports, setReports] = useState([])
  const [filter, setFilter] = useState('all')
  useEffect(() => { fetch('/api/reports').then(r => r.json()).then(d => setReports(d.filter(r => r.published !== false))).catch(() => setReports([])) }, [])

  const categories = ['all', ...new Set(reports.map(r => r.category).filter(Boolean))]
  const filtered = filter === 'all' ? reports : reports.filter(r => r.category === filter)

  const download = async (r) => {
    await fetch(`/api/reports/${r.id}/download`, { method: 'POST' })
    if (r.file && r.file !== '#') window.open(r.file, '_blank')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-bsv-blue text-white py-4">
        <div className="container mx-auto px-4 flex items-center gap-3">
          <Link href="/"><Button variant="ghost" className="text-white hover:bg-white/10"><ArrowLeft className="w-4 h-4 mr-1" />Home</Button></Link>
          <div><div className="font-display font-extrabold text-xl">Reports &amp; Publications</div><div className="text-xs text-white/70">Research, impact assessments &amp; campaign reports</div></div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <Badge variant="outline" className="border-bsv-red text-bsv-red mb-3">KNOWLEDGE HUB</Badge>
          <h1 className="font-display text-3xl md:text-5xl font-extrabold text-bsv-blue mb-2">Reports &amp; Publications</h1>
          <p className="text-muted-foreground">Annual reports, research findings, and campaign assessments — freely available.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map(c => (
            <Button key={c} variant={filter === c ? 'default' : 'outline'} size="sm" onClick={() => setFilter(c)} className={filter === c ? 'bg-bsv-blue' : ''}>{c === 'all' ? 'All Reports' : c}</Button>
          ))}
        </div>
        {!filtered.length && (
          <Card><CardContent className="p-12 text-center">
            <FileText className="w-16 h-16 mx-auto text-slate-300 mb-3" />
            <h3 className="font-display font-bold text-xl text-bsv-blue">Reports Coming Soon</h3>
            <p className="text-muted-foreground">Our annual impact reports and research publications will appear here.</p>
          </CardContent></Card>
        )}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">{filtered.map(r => (
          <Card key={r.id} className="overflow-hidden hover:shadow-xl transition">
            {r.thumbnail && <img src={r.thumbnail} alt={r.title} className="w-full h-40 object-cover" />}
            <CardContent className="p-5">
              <Badge className="bg-bsv-red mb-2">{r.category}</Badge>
              <h3 className="font-display font-bold text-bsv-blue mb-1">{r.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{r.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">{r.downloadCount || 0} downloads</span>
                <Button size="sm" onClick={() => download(r)} className="bg-bsv-blue"><Download className="w-3 h-3 mr-1" />Download</Button>
              </div>
            </CardContent>
          </Card>))}</div>
      </main>
    </div>
  )
}
