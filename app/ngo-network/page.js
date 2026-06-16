'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Handshake, Globe, Mail, Phone } from 'lucide-react'
import Link from 'next/link'

export default function NGONetworkPage() {
  const [ngos, setNgos] = useState([])
  useEffect(() => { fetch('/api/ngos').then(r => r.json()).then(d => setNgos(d.filter(n => n.published !== false))).catch(() => setNgos([])) }, [])

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-bsv-blue text-white py-4">
        <div className="container mx-auto px-4 flex items-center gap-3">
          <Link href="/"><Button variant="ghost" className="text-white hover:bg-white/10"><ArrowLeft className="w-4 h-4 mr-1" />Home</Button></Link>
          <div><div className="font-display font-extrabold text-xl">NGO Network</div><div className="text-xs text-white/70">Our partner organizations</div></div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <Badge variant="outline" className="border-bsv-red text-bsv-red mb-3">PARTNERSHIPS</Badge>
          <h1 className="font-display text-3xl md:text-5xl font-extrabold text-bsv-blue mb-2">Our NGO Partners</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">Working hand in hand with grassroots organizations to drive snakebite awareness across India.</p>
        </div>
        {!ngos.length && (
          <Card><CardContent className="p-12 text-center">
            <Handshake className="w-16 h-16 mx-auto text-slate-300 mb-3" />
            <h3 className="font-display font-bold text-xl text-bsv-blue">NGO Network Coming Soon</h3>
            <p className="text-muted-foreground">Featured NGOs: SHE Foundation, Sarpa Sathi, Nisarg Foundation, and more.</p>
            <Link href="/#partner"><Button className="mt-4 bg-bsv-red hover:bg-bsv-red/90">Become a Partner</Button></Link>
          </CardContent></Card>
        )}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">{ngos.map(n => (
          <Card key={n.id} className="hover:shadow-xl transition">
            <CardContent className="p-6">
              {n.logo && <img src={n.logo} alt={n.name} className="w-20 h-20 object-cover rounded mb-3" />}
              <h3 className="font-display font-bold text-lg text-bsv-blue mb-2">{n.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{n.description}</p>
              {n.stateCoverage?.length > 0 && <div className="flex flex-wrap gap-1 mb-2">{n.stateCoverage.map(s => <Badge key={s} variant="outline" className="text-xs">{s}</Badge>)}</div>}
              <div className="space-y-1 text-xs">
                {n.website && <div className="flex items-center gap-2"><Globe className="w-3 h-3" /><a href={n.website} target="_blank" rel="noreferrer" className="text-bsv-blue hover:underline">{n.website}</a></div>}
                {n.email && <div className="flex items-center gap-2"><Mail className="w-3 h-3" />{n.email}</div>}
                {n.phone && <div className="flex items-center gap-2"><Phone className="w-3 h-3" />{n.phone}</div>}
              </div>
            </CardContent>
          </Card>))}</div>
      </main>
    </div>
  )
}
