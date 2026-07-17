'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Sparkles, Heart, Share2, ArrowRight } from 'lucide-react'
import Link from 'next/link'

function ThankYouContent() {
  const params = useSearchParams()
  const type = params.get('type') || 'general'
  const name = params.get('name') || ''

  const messages = {
    download: { title: 'Thank You for Downloading!', desc: 'Your resource is on its way. Please check your email for the download link.', next: '/impact-stories', nextLabel: 'Explore Impact Stories' },
    partnership: { title: 'Partnership Application Received', desc: 'Our team will review your application and reach out within 48 hours.', next: '/ngo-network', nextLabel: 'Meet Our Partners' },
    volunteer: { title: 'Welcome to the Movement!', desc: 'Your volunteer journey begins now. Watch your email for training details.', next: '/reports', nextLabel: 'Read Our Impact Reports' },
    quiz: { title: 'Awareness Champion!', desc: 'You’ve completed the quiz. Share your certificate and spread the word.', next: '/#myths', nextLabel: 'Learn More Myths' },
    general: { title: 'Thank You!', desc: 'We appreciate your engagement with our mission.', next: '/', nextLabel: 'Back to Home' },
  }
  const m = messages[type] || messages.general

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-bsv-blue via-[#1e2a8a] to-bsv-blue p-4">
      <Card className="max-w-lg w-full shadow-2xl">
        <CardContent className="p-10 text-center">
          <div className="relative inline-block mb-4">
            <CheckCircle2 className="w-24 h-24 text-green-500" />
            <Sparkles className="w-8 h-8 text-yellow-500 absolute -top-2 -right-2 animate-pulse" />
          </div>
          <h1 className="font-display font-extrabold text-3xl text-bsv-blue mb-2">{m.title}</h1>
          {name && <p className="text-bsv-red font-semibold mb-2">Dear {name},</p>}
          <p className="text-muted-foreground mb-6">{m.desc}</p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Link href={m.next}><Button className="bg-bsv-red hover:bg-bsv-red/90">{m.nextLabel} <ArrowRight className="w-4 h-4 ml-1" /></Button></Link>
            <Button variant="outline" onClick={() => navigator.share ? navigator.share({title: 'BSV Snakebite Awareness', url: window.location.origin}) : null}><Share2 className="w-4 h-4 mr-1" />Share</Button>
          </div>
          <div className="mt-8 pt-6 border-t">
            <p className="text-xs text-muted-foreground">Every share saves a life. <Heart className="w-3 h-3 inline text-bsv-red" /></p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ThankYouPage() {
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><ThankYouContent /></Suspense>
}
