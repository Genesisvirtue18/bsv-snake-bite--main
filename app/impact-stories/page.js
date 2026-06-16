'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Heart, MapPin } from 'lucide-react'
import Link from 'next/link'

export default function ImpactStoriesPage() {
  const [stories, setStories] = useState([])
  const [filter, setFilter] = useState({ state: 'all', category: 'all', q: '' })

  useEffect(() => {
    fetch('/api/impact-stories').then(r => r.json()).then(setStories).catch(() => setStories([]))
  }, [])

  const filtered = stories.filter(s => {
    if (filter.state !== 'all' && s.state !== filter.state) return false
    if (filter.category !== 'all' && s.category !== filter.category) return false
    if (filter.q && !`${s.title} ${s.description} ${s.beneficiary}`.toLowerCase().includes(filter.q.toLowerCase())) return false
    return true
  })

  const states = [...new Set(stories.map(s => s.state).filter(Boolean))]
  const categories = [...new Set(stories.map(s => s.category).filter(Boolean))]

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-bsv-blue text-white py-4">
        <div className="container mx-auto px-4 flex items-center gap-3">
          <Link href="/"><Button variant="ghost" className="text-white hover:bg-white/10"><ArrowLeft className="w-4 h-4 mr-1" />Home</Button></Link>
          <div><div className="font-display font-extrabold text-xl">Impact Stories</div><div className="text-xs text-white/70">Lives changed across India</div></div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <Badge variant="outline" className="border-bsv-red text-bsv-red mb-3">REAL LIVES SAVED</Badge>
          <h1 className="font-display text-3xl md:text-5xl font-extrabold text-bsv-blue mb-2">Stories of Hope and Action</h1>
          <p className="text-muted-foreground">Behind every statistic is a life saved, a family preserved, a community strengthened.</p>
        </div>
        <div className="flex flex-wrap gap-3 mb-6">
          <Input placeholder="Search stories..." value={filter.q} onChange={e => setFilter({...filter, q: e.target.value})} className="max-w-sm" />
          <Select value={filter.state} onValueChange={v => setFilter({...filter, state: v})}><SelectTrigger className="max-w-[200px]"><SelectValue placeholder="State" /></SelectTrigger><SelectContent><SelectItem value="all">All States</SelectItem>{states.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
          <Select value={filter.category} onValueChange={v => setFilter({...filter, category: v})}><SelectTrigger className="max-w-[200px]"><SelectValue placeholder="Category" /></SelectTrigger><SelectContent><SelectItem value="all">All Categories</SelectItem>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
        </div>
        {!filtered.length && (
          <Card><CardContent className="p-12 text-center">
            <Heart className="w-16 h-16 mx-auto text-slate-300 mb-3" />
            <h3 className="font-display font-bold text-xl text-bsv-blue">More Stories Coming Soon</h3>
            <p className="text-muted-foreground">Our team is documenting impact stories from across India. Check back soon!</p>
          </CardContent></Card>
        )}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">{filtered.map(s => (
          <Link key={s.id} href={`/impact-stories/${s.id}`}>
          <Card className="overflow-hidden hover:shadow-2xl transition group cursor-pointer h-full hover:-translate-y-1 duration-300">
            {s.heroImage && <div className="relative overflow-hidden"><img src={s.heroImage} alt={s.title} className="w-full h-48 object-cover group-hover:scale-110 transition duration-700" /><div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" /></div>}
            <CardContent className="p-5">
              <div className="flex gap-2 mb-2"><Badge className="bg-bsv-red">{s.category}</Badge>{s.state && <Badge variant="outline"><MapPin className="w-3 h-3 mr-1" />{s.state}</Badge>}</div>
              <h3 className="font-display font-bold text-lg text-bsv-blue mb-2 group-hover:text-bsv-red transition">{s.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-3">{s.description}</p>
              {s.beneficiary && <p className="text-xs mt-2 italic text-slate-500">— {s.beneficiary}{s.ngo ? `, ${s.ngo}` : ''}</p>}
              <div className="mt-3 inline-flex items-center text-sm font-semibold text-bsv-red group-hover:translate-x-1 transition">Read full story →</div>
            </CardContent>
          </Card>
          </Link>))}</div>
      </main>
    </div>
  )
}
