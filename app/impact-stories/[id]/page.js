'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, ArrowRight, MapPin, User, Heart, Copy as CopyIcon, CheckCircle2, Activity, Share2 } from 'lucide-react'
import { toast } from 'sonner'

export default function StoryDetailPage() {
  const params = useParams()
  const [story, setStory] = useState(null)
  const [related, setRelated] = useState([])
  const [progress, setProgress] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!params?.id) return
    fetch(`/api/impact-stories/${params.id}`).then(r => r.ok ? r.json() : null).then(s => { setStory(s); setLoading(false) })
    fetch('/api/impact-stories').then(r => r.json()).then(all => setRelated(all.filter(s => s.id !== params.id).slice(0, 3)))
    const onScroll = () => {
      const h = document.documentElement
      const total = h.scrollHeight - h.clientHeight
      setProgress(total ? (h.scrollTop / total) * 100 : 0)
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [params?.id])

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-muted-foreground">Loading story...</div></div>
  if (!story) return (
    <div className="min-h-screen flex items-center justify-center">
      <Card><CardContent className="p-10 text-center">
        <h2 className="font-display font-bold text-2xl text-bsv-blue">Story Not Found</h2>
        <Link href="/impact-stories"><Button className="mt-4 bg-bsv-red">Back to Stories</Button></Link>
      </CardContent></Card>
    </div>
  )

  const copyLink = async () => {
    if (typeof window === 'undefined') return
    const url = window.location.href
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url)
        toast.success('Link copied to clipboard!')
      } else {
        // Fallback for non-secure contexts
        const ta = document.createElement('textarea')
        ta.value = url
        ta.style.position = 'fixed'
        ta.style.left = '-9999px'
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
        toast.success('Link copied!')
      }
    } catch {
      toast.error('Could not copy. Long-press the URL to copy.')
    }
  }

  const shareTo = (platform) => {
    if (typeof window === 'undefined') return
    const url = encodeURIComponent(window.location.href)
    const title = encodeURIComponent(story.title || 'Impact Story')
    const text = encodeURIComponent(`${story.title} - BSV Snakebite Awareness Campaign`)
    const urls = {
      whatsapp: `https://wa.me/?text=${text}%20${url}`,
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      telegram: `https://t.me/share/url?url=${url}&text=${text}`,
      email: `mailto:?subject=${title}&body=${text}%20${url}`,
    }
    if (urls[platform]) window.open(urls[platform], '_blank', 'noopener,noreferrer,width=600,height=500')
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Reading progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-slate-100 z-[60]"><div className="h-full bg-bsv-red transition-all" style={{ width: `${progress}%` }} /></div>

      <header className="bg-bsv-blue text-white py-4 sticky top-1 z-50 shadow-lg">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Link href="/impact-stories"><Button variant="ghost" className="text-white hover:bg-white/10"><ArrowLeft className="w-4 h-4 mr-1" />All Stories</Button></Link>
          <div className="text-xs text-white/70 hidden md:block">Impact Stories · BSV Snakebite Campaign</div>
        </div>
      </header>

      {/* Hero */}
      <div className="relative h-[60vh] overflow-hidden">
        {story.heroImage ? <img src={story.heroImage} alt={story.title} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-to-br from-bsv-blue to-bsv-red" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 container mx-auto px-4 lg:px-8 pb-12 text-white">
          <div className="flex gap-2 mb-3">
            <Badge className="bg-bsv-red border-0">{story.category}</Badge>
            {story.state && <Badge variant="outline" className="border-white/40 text-white"><MapPin className="w-3 h-3 mr-1" />{story.state}</Badge>}
          </div>
          <h1 className="font-display font-extrabold text-3xl md:text-5xl lg:text-6xl drop-shadow-2xl max-w-4xl">{story.title}</h1>
          {story.beneficiary && <div className="mt-4 flex items-center gap-2 text-white/90"><User className="w-4 h-4" /><span>{story.beneficiary}{story.ngo ? ` · ${story.ngo}` : ''}</span></div>}
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-12 grid lg:grid-cols-[1fr_280px] gap-12">
        {/* Article */}
        <article className="prose prose-lg max-w-none">
          <p className="text-xl text-bsv-blue font-display font-medium leading-relaxed mb-8">{story.description?.split('. ')[0]}.</p>
          <div className="text-slate-700 leading-relaxed whitespace-pre-line">{story.description}</div>

          {story.metrics && Object.keys(story.metrics).length > 0 && (
            <div className="my-10 grid grid-cols-2 md:grid-cols-3 gap-4 not-prose">
              {Object.entries(story.metrics).map(([k, v]) => (
                <Card key={k} className="border-l-4 border-bsv-red"><CardContent className="p-4">
                  <div className="text-2xl font-display font-extrabold text-bsv-blue">{v}</div>
                  <div className="text-xs text-muted-foreground capitalize">{k.replace(/([A-Z])/g, ' $1').trim()}</div>
                </CardContent></Card>
              ))}
            </div>
          )}

          {story.video && (
            <div className="my-8 aspect-video rounded-2xl overflow-hidden not-prose">
              <iframe src={story.video.includes('embed') ? story.video : story.video.replace('watch?v=', 'embed/')} className="w-full h-full" allow="autoplay; encrypted-media" allowFullScreen />
            </div>
          )}

          {story.beforeImage && story.afterImage && (
            <div className="my-10 grid md:grid-cols-2 gap-4 not-prose">
              <div><Badge className="mb-2 bg-slate-500">BEFORE</Badge><img src={story.beforeImage} alt="" className="w-full h-64 object-cover rounded-xl" /></div>
              <div><Badge className="mb-2 bg-bsv-red">AFTER</Badge><img src={story.afterImage} alt="" className="w-full h-64 object-cover rounded-xl" /></div>
            </div>
          )}

          {story.gallery?.length > 0 && (
            <div className="my-10 grid grid-cols-2 md:grid-cols-3 gap-3 not-prose">
              {story.gallery.map((img, i) => <img key={i} src={img} alt="" className="w-full h-40 object-cover rounded-lg" />)}
            </div>
          )}

          <div className="mt-12 p-6 bg-bsv-blue text-white rounded-2xl not-prose">
            <h3 className="font-display font-bold text-xl mb-2">Inspired? Become Part of the Movement.</h3>
            <p className="text-white/80 mb-4 text-sm">Join thousands across India helping save lives through awareness, education, and timely hospital action.</p>
            <div className="flex flex-wrap gap-2">
              <Link href="/volunteer"><Button className="bg-bsv-red hover:bg-bsv-red/90">Volunteer Now</Button></Link>
              <Link href="/#partner"><Button variant="outline" className="bg-white/10 border-white/40 text-white hover:bg-white hover:text-bsv-blue">Partner With Us</Button></Link>
            </div>
          </div>
        </article>

        {/* Sticky Sidebar */}
        <aside className="lg:sticky lg:top-24 self-start space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3 font-semibold flex items-center gap-1"><Share2 className="w-3 h-3" /> Share this story</div>
              <div className="grid grid-cols-3 gap-2">
                <button onClick={() => shareTo('whatsapp')} className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-green-50 transition group" title="Share on WhatsApp">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-base font-bold" style={{ background: '#25D366' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  </div>
                  <span className="text-[10px] text-slate-600 group-hover:text-green-600 font-medium">WhatsApp</span>
                </button>
                <button onClick={() => shareTo('twitter')} className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-slate-50 transition group" title="Share on X / Twitter">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white bg-black">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  </div>
                  <span className="text-[10px] text-slate-600 group-hover:text-black font-medium">Twitter / X</span>
                </button>
                <button onClick={() => shareTo('facebook')} className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-blue-50 transition group" title="Share on Facebook">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white" style={{ background: '#1877F2' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 011.141.195v3.325a8.623 8.623 0 00-.653-.036 26.805 26.805 0 00-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 00-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647z"/></svg>
                  </div>
                  <span className="text-[10px] text-slate-600 group-hover:text-blue-600 font-medium">Facebook</span>
                </button>
                <button onClick={() => shareTo('linkedin')} className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-blue-50 transition group" title="Share on LinkedIn">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white" style={{ background: '#0A66C2' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  </div>
                  <span className="text-[10px] text-slate-600 group-hover:text-blue-700 font-medium">LinkedIn</span>
                </button>
                <button onClick={() => shareTo('telegram')} className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-sky-50 transition group" title="Share on Telegram">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white" style={{ background: '#26A5E4' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                  </div>
                  <span className="text-[10px] text-slate-600 group-hover:text-sky-600 font-medium">Telegram</span>
                </button>
                <button onClick={copyLink} className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-slate-50 transition group" title="Copy Link">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white" style={{ background: '#151f6d' }}>
                    <CopyIcon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] text-slate-600 group-hover:text-bsv-blue font-medium">Copy Link</span>
                </button>
              </div>
            </CardContent>
          </Card>
          {story.ngo && (
            <Card>
              <CardContent className="p-4">
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1 font-semibold">Partner NGO</div>
                <div className="font-display font-bold text-bsv-blue">{story.ngo}</div>
                <Link href="/ngo-network" className="text-xs text-bsv-red hover:underline mt-2 inline-flex items-center">Meet the network <ArrowRight className="w-3 h-3 ml-1" /></Link>
              </CardContent>
            </Card>
          )}
          <Card>
            <CardContent className="p-4">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2 font-semibold">Quick Actions</div>
              <Link href="/reports"><Button variant="ghost" size="sm" className="w-full justify-start"><Activity className="w-4 h-4 mr-2" />View Impact Reports</Button></Link>
              <Link href="/#resources"><Button variant="ghost" size="sm" className="w-full justify-start"><Heart className="w-4 h-4 mr-2" />Download Resources</Button></Link>
              <Link href="/#quiz"><Button variant="ghost" size="sm" className="w-full justify-start"><CheckCircle2 className="w-4 h-4 mr-2" />Take Awareness Quiz</Button></Link>
            </CardContent>
          </Card>
        </aside>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="bg-slate-50 py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <h2 className="font-display font-extrabold text-2xl md:text-3xl text-bsv-blue mb-6">More Impact Stories</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {related.map(s => (
                <Link key={s.id} href={`/impact-stories/${s.id}`}>
                  <Card className="overflow-hidden hover:shadow-2xl transition group cursor-pointer">
                    {s.heroImage && <img src={s.heroImage} alt={s.title} className="w-full h-44 object-cover group-hover:scale-105 transition duration-500" />}
                    <CardContent className="p-5">
                      <Badge className="bg-bsv-red mb-2">{s.category}</Badge>
                      <h3 className="font-display font-bold text-bsv-blue mb-1 line-clamp-2">{s.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{s.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
