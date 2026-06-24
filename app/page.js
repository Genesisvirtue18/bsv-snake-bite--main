'use client'
/* eslint-disable react-hooks/set-state-in-effect, react-hooks/immutability */

import { DEFAULT_CONTENT } from '@/lib/defaultContent'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Heart, GraduationCap, MapPin, Users, Megaphone, Building2, Stethoscope, Globe, Menu, X, Phone, Mail, ChevronRight, Lightbulb, Shield, ShieldAlert, Sparkles, Play, ArrowRight, BookOpen, Video, ImageIcon, Search, FileText, Activity, TrendingUp, Award, CheckCircle2 } from 'lucide-react'
import { LANGUAGES, getT } from '@/lib/translations'
import AnimatedCounter from '@/components/AnimatedCounter'
import MiniIndiaMap from '@/components/MiniIndiaMap'
import QuizSection from '@/components/QuizSection'
import Link from 'next/link'

const ICONS = { Heart, GraduationCap, MapPin, Users, Megaphone, Building2, Stethoscope }
const DEFAULT_BRAND = {
  blue: '#201F5E',   // dark-navy — headings, primary text
  red: '#0EAFC5',    // primary-cyan — accents, CTAs (replaces red throughout)
  cyan: '#0EAFC5',   // primary-cyan
  deep: '#0D71B8',   // deep-blue
  medium: '#4C96C9', // medium-blue
  aqua: '#8BD1DE',   // light-aqua
  navy: '#201F5E',   // dark-navy
  white: '#ffffff',
  surface: '#f0f8ff',
  heading: '#201F5E',
  text: '#334155',
}
let BRAND = { ...DEFAULT_BRAND }
const BSV_RED = '#de2527'  // BSV brand red — used for accents, awareness, urgency

/* =============================================================
   STYLIZED INDIA STATE GRID — each card has a mini India map
   with the active state highlighted in campaign gradient
   ============================================================= */
function StatesGrid({ states = [], t }) {
  const active = states.filter(s => s.enabled !== false)
  const maxLives = Math.max(1, ...active.map(s => s.beneficiaries || 0))
  const totals = active.reduce((acc, s) => ({
    lives: acc.lives + (s.beneficiaries || 0),
    campaigns: acc.campaigns + (s.campaigns || 0),
    workshops: acc.workshops + (s.workshops || 0),
  }), { lives: 0, campaigns: 0, workshops: 0 })

  return (
    <div className="space-y-8">
      {/* State cards with mini India map */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {active.map((s, i) => {
          const pct = Math.min(100, Math.round(((s.beneficiaries || 0) / maxLives) * 100))
          return (
            <motion.div
              key={s.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              whileHover={{ y: -6 }}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-2xl transition-all duration-300"
            >
              {/* Top accent bar */}
              <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${BRAND.red} 0%, ${BRAND.blue} 100%)` }} />

              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: BRAND.red }} />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: BRAND.red }} />
                      </span>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{t.outreach.active}</span>
                    </div>
                    <h3 className="font-display text-lg font-semibold mt-1" style={{ color: BRAND.blue }}>{s.name}</h3>
                  </div>
                  {/* Mini India map with this state highlighted */}
                  <div className="ml-2 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-2">
                    <MiniIndiaMap activeCode={s.code} size="md" />
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="rounded-lg p-2.5" style={{ background: '#EFF6FF' }}>
                    <div className="text-[9px] uppercase tracking-wide text-slate-500 mb-0.5">Activities Conducted</div>
                    <div className="font-display font-bold text-lg" style={{ color: BRAND.deep }}>
                      <AnimatedCounter value={s.campaigns || 0} />
                    </div>
                  </div>
                  <div className="rounded-lg p-2.5" style={{ background: '#FFF0F0' }}>
                    <div className="text-[9px] uppercase tracking-wide text-slate-500 mb-0.5">Workshops Held</div>
                    <div className="font-display font-bold text-lg" style={{ color: '#de2527' }}>
                      <AnimatedCounter value={s.workshops || 0} />
                    </div>
                  </div>
                </div>

                {/* Progress vs largest state */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span className="uppercase tracking-wide">{t.outreach.reach}</span>
                    <span className="font-semibold" style={{ color: BRAND.blue }}>{pct}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${pct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2, delay: i * 0.05 }}
                      className="h-full rounded-full"
                      style={{ background: `linear-gradient(90deg, ${BRAND.blue} 0%, ${BRAND.red} 100%)` }}
                    />
                  </div>
                </div>
              </div>

              {/* Hover ribbon */}
              <div className="absolute -bottom-px left-0 right-0 h-0 group-hover:h-1 transition-all duration-300" style={{ background: BRAND.red }} />
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

function Header({ lang, setLang, t, settings }) {
  const [open, setOpen] = useState(false)
  const [megaOpen, setMegaOpen] = useState(null)
  const [megaLeft, setMegaLeft] = useState(0)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const megaMenus = {
    awareness: {
      label: t.nav.awareness,
      groups: [
        {
          title: 'On-Ground Activations',
          items: [
            { label: 'Nukkad Natak, Wall Paintings, Bus Branding', href: '#awareness', desc: 'Community outreach programs' },
            { label: 'Campaign Moments', href: '#gallery', desc: 'See campaign in action' },
          ]
        },
        {
          title: 'NGO Collaborations',
          items: [
            { label: 'Partner Network Across India', href: '/ngo-network', desc: 'Our NGO partners' },
            { label: 'Real-life Impact Stories', href: '#stories', desc: 'Stories from the field' },
          ]
        },
        {
          title: 'Mass & Digital Media',
          items: [
            { label: 'Campaign Films & Interviews', href: '#video', desc: 'Watch our videos' },
            { label: 'Bust the Myths', href: '#myths', desc: 'Myth vs Fact' },
          ]
        },
      ]
    },
    access: {
      label: t.nav.access,
      groups: [
        {
          title: 'Workshops & Training',
          items: [
            { label: 'Clinician Training Programs', href: '#access', desc: 'Hands-on training for clinicians, RMPs, ASHAs' },
            { label: 'State-wise Campaign Reach', href: '#outreach', desc: 'Our outreach across India' },
          ]
        },
        {
          title: 'Clinician Engagement',
          items: [
            { label: 'Beyond Monsoons Program', href: '#access', desc: 'Venom to Vial initiative' },
            { label: 'Field Stories', href: '#stories', desc: 'Stories from clinicians' },
          ]
        },
        {
          title: 'Training Modules',
          items: [
            { label: 'ASV Protocols', href: '#resources', desc: 'Clinical education materials' },
            { label: 'Download Library', href: '#resources', desc: 'All resources in one place' },
          ]
        },
      ]
    },
    communication: {
      label: t.nav.communication,
      groups: [
        {
          title: 'Print Materials',
          items: [
            { label: 'Posters & Brochures', href: '/downloads', desc: 'Multilingual print materials' },
            { label: 'All Downloads', href: '/downloads', desc: 'Complete resource library' },
          ]
        },
        {
          title: 'Video Content',
          items: [
            { label: 'Awareness Videos', href: '#video', desc: 'Vox pops, myth-busting reels' },
            { label: 'Watch the Campaign', href: '#video', desc: 'Campaign in action' },
          ]
        },
        {
          title: 'Visual Stories',
          items: [
            { label: 'Comic & Visual Stories', href: '#gallery', desc: 'Engaging visual content' },
            { label: 'Browse Gallery', href: '#gallery', desc: 'Photo gallery' },
          ]
        },
      ]
    },
  }

  const menu = [
    { id: 'home', label: t.nav.home, href: '#home' },
    { id: 'video', label: t.nav.watch, href: '#video' },
    { id: 'awareness', label: t.nav.awareness, href: '#awareness' },
    { id: 'access', label: t.nav.access, href: '#access' },
    { id: 'communication', label: t.nav.communication, href: '#communication' },
    { id: 'outreach', label: t.nav.outreach, href: '#outreach' },
    { id: 'contact', label: t.nav.contact, href: '#contact' },
  ]

  const go = (href) => {
    setMegaOpen(null)
    setOpen(false)
    if (href.startsWith('#')) {
      const id = href.slice(1)
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    } else if (typeof window !== 'undefined') {
      window.location.href = href
    }
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[9999] bg-white transition-all duration-300 ${scrolled
        ? 'border-b shadow-lg'
        : 'border-b border-slate-100 shadow-sm'
        }`}
      style={{ borderColor: scrolled ? BRAND.blue + '22' : undefined }}
      onMouseLeave={() => setMegaOpen(null)}
    >
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-16 sm:h-20">

          {/* Logo + Tagline */}
          <button
            onClick={() => go('#home')}
            className="flex items-center gap-2 sm:gap-3 flex-shrink-0"
            style={{ transform: open ? 'scale(0.95)' : 'scale(1)' }}
          >
            <img
              src={settings?.branding?.bsvLogo}
              alt="BSV"
              className="h-8 sm:h-12 md:h-14 w-auto flex-shrink-0"
              draggable={false}
            />
            <div className="flex-shrink-0">
              <div className="text-[9px] sm:text-[11px] font-semibold leading-snug text-left whitespace-nowrap" style={{ color: BRAND.blue }}>
                Saap Ka Vaar,<br />Aspataal Mein Hi Upchaar
              </div>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 flex-1 justify-center">
            <button onClick={() => go('#home')} className="px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-cyan-50" style={{ color: BRAND.blue }} onMouseEnter={e => e.currentTarget.style.color = BSV_RED} onMouseLeave={e => e.currentTarget.style.color = BRAND.blue}>
              {t.nav.home}
            </button>
            <button onClick={() => go('#video')} className="px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-cyan-50" style={{ color: BRAND.blue }} onMouseEnter={e => e.currentTarget.style.color = BSV_RED} onMouseLeave={e => e.currentTarget.style.color = BRAND.blue}>
              {t.nav.watch}
            </button>

            {['awareness', 'access', 'communication'].map(key => (
              <div
                key={key}
                className="relative"
                onMouseEnter={(e) => {
                  setMegaOpen(key)
                  setMegaLeft(e.currentTarget.getBoundingClientRect().left)
                }}
              >
                <button
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 inline-flex items-center gap-1 ${megaOpen === key ? 'bg-cyan-50' : 'hover:bg-cyan-50'}`}
                  style={{ color: megaOpen === key ? BSV_RED : BRAND.blue }}
                >
                  {megaMenus[key].label}
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${megaOpen === key ? 'rotate-90' : ''}`} />
                </button>
              </div>
            ))}

            <button onClick={() => go('#outreach')} className="px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-cyan-50" style={{ color: BRAND.blue }} onMouseEnter={e => e.currentTarget.style.color = BSV_RED} onMouseLeave={e => e.currentTarget.style.color = BRAND.blue}>
              {t.nav.outreach}
            </button>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 flex-shrink-0">
            <img
              src={settings?.branding?.mankindLogo}
              alt="Mankind"
              className="h-7 sm:h-9 md:h-11 w-auto flex-shrink-0"
              draggable={false}
            />

            {/* Contact CTA — desktop only */}
            <button
              onClick={() => go('#contact')}
              className="hidden lg:inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white rounded-lg shadow-md hover:opacity-90 hover:-translate-y-0.5 transition-all duration-200 flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${BSV_RED} 0%, #a81b1d 100%)` }}
            >
              <Phone className="w-3.5 h-3.5" />
              Contact Us
            </button>

            {/* Language selector — globe icon only on mobile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 transition-all duration-200 rounded-xl px-2 lg:px-3"
                  style={{ borderColor: BRAND.blue + '40', color: BRAND.blue }}
                >
                  <Globe className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden lg:inline text-sm font-medium">
                    {LANGUAGES.find(l => l.code === lang)?.native}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="max-h-80 overflow-y-auto rounded-xl shadow-xl border-slate-200/80 z-[9999]">
                {LANGUAGES.map(l => (
                  <DropdownMenuItem
                    key={l.code}
                    onClick={() => setLang(l.code)}
                    className={`${lang === l.code ? 'bg-cyan-50 font-semibold text-[#0EAFC5]' : ''} cursor-pointer`}
                  >
                    {l.native}
                    <span className="text-slate-400 ml-2 text-xs">({l.label})</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Hamburger — mobile/tablet only */}
            <button
              className="lg:hidden p-2 rounded-xl hover:bg-slate-100 active:bg-slate-200 transition-all duration-200 flex-shrink-0"
              onClick={() => setOpen(!open)}
              aria-label="Open menu"
            >
              <motion.div
                animate={{ rotate: open ? 90 : 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
              >
                {open
                  ? <X className="w-5 h-5" style={{ color: BRAND.navy }} />
                  : <Menu className="w-5 h-5" style={{ color: BRAND.navy }} />}
              </motion.div>
            </button>
          </div>
        </div>

        {/* Mega Menu Panel - Desktop */}
        {megaOpen && megaMenus[megaOpen] && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="hidden lg:block absolute left-0 right-0 top-full bg-white backdrop-blur-lg border-t shadow-2xl rounded-b-2xl z-[99999]"
            style={{ borderColor: BRAND.blue + '22' }}
            onMouseEnter={() => setMegaOpen(megaOpen)}
          >
            <div className="container mx-auto px-4 py-8">
              <div className="grid grid-cols-4 gap-8">
                <div className="col-span-1 rounded-2xl p-6 text-white relative overflow-hidden" style={{ background: `linear-gradient(145deg, ${BRAND.navy}, ${BSV_RED})` }}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                  <div className="relative z-10">
                    <div className="text-xs uppercase tracking-wider opacity-80 mb-3 font-semibold">
                      {t.badges?.[megaOpen] || megaMenus[megaOpen].label}
                    </div>
                    <div className="font-display font-bold text-2xl mb-3 leading-tight">
                      {megaOpen === 'awareness' ? 'Creating Informed Communities' :
                        megaOpen === 'access' ? 'Bridging the Gap' :
                          'Spreading the Message'}
                    </div>
                    <div className="text-sm text-white/85 leading-relaxed">
                      {megaOpen === 'awareness' ? 'Through education, outreach, and action — turning fear into facts.' :
                        megaOpen === 'access' ? 'Ensuring every snakebite victim gets the right care at the right time.' :
                          'Using every medium to reach every corner of India.'}
                    </div>
                    <button onClick={() => go(`#${megaOpen}`)} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold hover:underline underline-offset-2 transition-all group">
                      Learn More
                      <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </div>

                {megaMenus[megaOpen].groups.map((g, gi) => (
                  <div key={gi} className="col-span-1">
                    <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-4 border-b border-slate-100 pb-3">
                      {g.title}
                    </div>
                    <ul className="space-y-3">
                      {g.items.map((it, ii) => (
                        <li key={ii}>
                          <button onClick={() => go(it.href)} className="w-full text-left group p-2 rounded-xl hover:bg-cyan-50 transition-all duration-200">
                            <div className="font-display font-semibold text-sm group-hover:text-[#0EAFC5] transition-colors" style={{ color: BRAND.blue }}>
                              {it.label}
                            </div>
                            <div className="text-xs text-slate-400 group-hover:text-slate-600 transition-colors leading-relaxed">
                              {it.desc}
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Mobile Menu - Solid Background, Items Clearly Visible */}
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="lg:hidden absolute left-0 right-0 top-full border-t border-white/10 shadow-2xl rounded-b-2xl z-[99999] max-h-[80vh] overflow-y-auto"
            style={{ background: BRAND.blue }}
          >
            <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
              <div className="flex justify-center mb-2">
                <div className="w-12 h-1 bg-white/30 rounded-full" />
              </div>

              {menu.map((item, i) => (
                <motion.button
                  key={item.id}
                  onClick={() => go(item.href)}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.2 }}
                  className={`w-full text-left py-3.5 sm:py-3 px-3 rounded-xl text-sm font-medium text-white hover:bg-white/10 hover:text-white active:bg-white/20 transition-all duration-200 flex items-center justify-between group ${i > 0 ? 'border-t border-white/10 mt-1 pt-3.5 sm:pt-3' : ''
                    }`}
                >
                  <span>{item.label}</span>
                  <ChevronRight className="w-4 h-4 text-white/50 group-hover:text-white group-hover:translate-x-0.5 transition-all duration-200" />
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </header>
  )
}

function Hero({ content, t }) {
  const stats = content?.heroStats || []

  const slides = Array.isArray(content?.heroSlides)
    ? content.heroSlides
      .filter(slide => (slide?.desktopImage || slide?.mobileImage) && slide.active !== false)
      .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0))
    : []

  const sliderRef = useRef(null)
  const [activeSlide, setActiveSlide] = useState(0)

  const scrollToSlide = (index) => {
    if (!sliderRef.current) return

    const slider = sliderRef.current
    const card = slider.querySelector('[data-hero-card]')
    if (!card) return

    const gap = 20
    const left = index * (card.offsetWidth + gap)

    slider.scrollTo({
      left,
      behavior: 'smooth',
    })

    setActiveSlide(index)
  }

  const scrollHero = (direction) => {
    if (!slides.length) return

    const nextIndex =
      direction === 'next'
        ? Math.min(activeSlide + 1, slides.length - 1)
        : Math.max(activeSlide - 1, 0)

    scrollToSlide(nextIndex)
  }

  if (!slides.length) return null

  return (
    <section
      id="home"
      className="relative overflow-hidden pt-20 sm:pt-24 pb-4 sm:pb-6 bg-gradient-to-b from-slate-50 via-white to-slate-50"
    >
      <div className="container mx-auto px-3 sm:px-4 lg:px-8">
        <div className="relative">

          {/* Desktop Left Arrow */}
          {slides.length > 1 && (
            <button
              type="button"
              onClick={() => scrollHero('prev')}
              className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white shadow-lg text-2xl font-bold items-center justify-center"
              style={{ color: BRAND.blue }}
            >
              ‹
            </button>
          )}

          <div
            ref={sliderRef}
            className="overflow-x-auto no-scrollbar scroll-smooth pb-4"
          >
            <div className="flex gap-4 sm:gap-5 w-max">
              {slides.map((slide, i) => (
                <div
                  key={slide.id || i}
                  data-hero-card
                  className="relative w-[82vw] sm:w-[46vw] lg:w-[47vw] h-[260px] sm:h-[320px] lg:h-[360px] overflow-hidden rounded-[1.5rem] shadow-none bg-white flex-shrink-0"
                >
                  <picture>
                    <source
                      media="(max-width: 768px)"
                      srcSet={slide.mobileImage || slide.desktopImage}
                    />

                    <img
                      src={slide.desktopImage || slide.mobileImage}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </picture>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop Right Arrow */}
          {slides.length > 1 && (
            <button
              type="button"
              onClick={() => scrollHero('next')}
              className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white shadow-lg text-2xl font-bold items-center justify-center"
              style={{ color: BRAND.blue }}
            >
              ›
            </button>
          )}

          {/* Dots */}
          {slides.length > 1 && (
            <div className="hidden md:flex justify-center gap-2 mt-4">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => scrollToSlide(i)}
                  className={`h-2 rounded-full transition-all ${i === activeSlide
                    ? 'w-8 bg-bsv-red'
                    : 'w-2 bg-slate-300'
                    }`}
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </section>
  )
}

function HeroStatsSection({ content, t }) {
  const stats = DEFAULT_CONTENT.heroStats
  if (!stats.length) return null

  const iconMap = {
    Heart: { bg: '#FFF0F0', color: '#E0525A' },
    MapPin: { bg: '#EFF6FF', color: BRAND.deep },
    Stethoscope: { bg: '#F0FDF4', color: '#16A34A' },
    Building2: { bg: '#FFF7ED', color: '#EA7B2C' },
    Users: { bg: '#F5F3FF', color: '#7C3AED' },
  }

  return (
    <section className="bg-white border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-10">

        {/* Mobile: horizontal scroll */}
        <div className="md:hidden overflow-x-auto no-scrollbar scroll-snap-x">
          <div className="flex gap-3 w-max pb-2">
            {stats.map((s, i) => {
              const Icon = ICONS[s.icon] || Heart
              const colors = iconMap[s.icon] || { bg: '#EFF6FF', color: BRAND.deep }
              return (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07, duration: 0.35 }}
                  className="flex-shrink-0 w-[120px] snap-start rounded-xl px-3 py-4"
                  style={{ border: '1px solid #e2e8f0', borderTop: `3px solid ${colors.color}`, background: `linear-gradient(to bottom, ${colors.bg}, #ffffff)` }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2.5" style={{ background: `${colors.color}18` }}>
                    <Icon className="w-4 h-4" style={{ color: colors.color }} />
                  </div>
                  <div className="font-display font-bold text-[16px] leading-none mb-1" style={{ color: '#201F5E' }}>
                    <AnimatedCounter value={s.value} suffix={s.suffix} />
                  </div>
                  <div className="text-[9px] text-slate-500 font-medium leading-snug">{s.label}</div>
                </motion.div>
              )
            })}
          </div>
          <div className="flex justify-center gap-1.5 mt-3">
            {stats.map((_, i) => <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-300" />)}
          </div>
        </div>

        {/* Desktop 5-col grid */}
        <div className="hidden md:grid md:grid-cols-5 gap-4">
          {stats.map((s, i) => {
            const Icon = ICONS[s.icon] || Heart
            const colors = iconMap[s.icon] || { bg: '#EFF6FF', color: BRAND.deep }
            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="rounded-xl px-4 py-5 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300"
                style={{ border: '1px solid #e2e8f0', borderTop: `3px solid ${colors.color}`, background: `linear-gradient(to bottom, ${colors.bg}, #ffffff)` }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `${colors.color}18` }}>
                  <Icon className="w-5 h-5" style={{ color: colors.color }} />
                </div>
                <div className="font-display font-bold text-[22px] leading-none mb-1.5" style={{ color: '#201F5E' }}>
                  <AnimatedCounter value={s.value} suffix={s.suffix} />
                </div>
                <div className="text-[11px] text-slate-500 font-medium leading-snug">{s.label}</div>
              </motion.div>
            )
          })}
        </div>

        {/* Quote block */}
        <div className="mt-8">
          <div className="relative rounded-xl px-8 md:px-12 py-6 text-center overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #EFF8FF 0%, #F0FDF4 100%)', border: '1px solid #BFDBFE' }}>
            <span className="absolute top-2 left-4 text-5xl font-serif leading-none select-none opacity-15" style={{ color: BRAND.deep }}>"</span>
            <span className="absolute bottom-0 right-4 text-5xl font-serif leading-none select-none opacity-15" style={{ color: BRAND.deep }}>"</span>
            <p className="relative text-[14px] md:text-[15px] leading-relaxed font-medium max-w-2xl mx-auto" style={{ color: '#201F5E' }}>
              Driving awareness by dispelling long-term standing myths and educating rural populations on evidence-based snakebite first aid and treatment.
            </p>
            <div className="mt-3 flex items-center justify-center gap-2">
              <div className="h-px w-8 rounded" style={{ background: BRAND.deep }} />
              <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: BRAND.deep }}>BSV Campaign Mission</span>
              <div className="h-px w-8 rounded" style={{ background: BRAND.deep }} />
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}

function VideoSection({ videos, t }) {
  const [active, setActive] = useState(null)
  const published = (videos || []).filter(v => v.published !== false)
  const featured = published.find(v => v.featured) || published[0]
  const others = published.filter(v => v.id !== featured?.id).slice(0, 6)

  if (!featured) return null

  return (
    <section id="video" className="section-pad bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-6">
          <span className="inline-block mb-2 text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: BRAND.deep }}>{t.badges.watch}</span>
          <h2 className="font-display text-[22px] md:text-[28px] font-bold mb-3 leading-tight" style={{ color: BRAND.navy }}>{t.video.title}</h2>
        </div>

        <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
          {/* Featured video */}
          <button onClick={() => setActive(featured)} className="group relative aspect-video rounded-2xl overflow-hidden shadow-2xl bg-slate-900">
            {featured.thumbnail && <img src={featured.thumbnail} alt={featured.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition bg-white/90 backdrop-blur-sm">
                <Play className="w-7 h-7 md:w-9 md:h-9 fill-current ml-1" style={{ color: BRAND.navy }} />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-6 text-left text-white">
              <Badge className="border-0 mb-2" style={{ background: BRAND.deep }}>{featured.category || t.video.featured}</Badge>
              <h3 className="font-display text-xl md:text-3xl font-semibold drop-shadow-md">{featured.title}</h3>
              {featured.description && <p className="text-sm md:text-base text-white/85 mt-1 line-clamp-2 max-w-2xl">{featured.description}</p>}
            </div>
          </button>

          {/* Side list */}
          <div className="space-y-3">
            <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">{t.video.more}</div>
            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {others.length === 0 && <div className="text-sm text-slate-500">{t.video.soon}</div>}
              {others.map(v => (
                <button key={v.id} onClick={() => setActive(v)} className="group w-full flex gap-3 p-2 rounded-xl hover:bg-slate-50 transition text-left">
                  <div className="relative flex-shrink-0 w-28 h-20 rounded-lg overflow-hidden bg-slate-200">
                    {v.thumbnail && <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />}
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <Play className="w-6 h-6 text-white fill-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-medium text-sm line-clamp-2" style={{ color: BRAND.blue }}>{v.title}</div>
                    <div className="text-xs text-slate-500 mt-1">{v.category || 'Campaign'}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Watch More button */}
        <div className="text-center mt-5">
          <a
            href="https://www.youtube.com/@bsvindia/videos"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
            style={{ background: BRAND.deep }}
          >
            {t.video.watchMore || 'Watch More'}
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {active && (
          <Dialog open onOpenChange={() => setActive(null)}>
            <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black">
              <DialogHeader className="sr-only"><DialogTitle>{active.title}</DialogTitle><DialogDescription>{active.description}</DialogDescription></DialogHeader>
              <div className="aspect-video w-full">
                {active.youtubeId ? (
                  <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${active.youtubeId}?autoplay=1&rel=0`} title={active.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                ) : active.url ? (
                  <video src={active.url} controls autoPlay className="w-full h-full" />
                ) : null}
              </div>
              <div className="p-4 bg-white">
                <div className="font-display font-semibold text-lg" style={{ color: BRAND.blue }}>{active.title}</div>
                {active.description && <p className="text-sm text-slate-600 mt-1 line-clamp-3">{active.description}</p>}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </section>
  )
}

function SectionHeader({ badge, title, subtitle, accent }) {
  const accentColor = accent || BRAND.deep
  return (
    <div className="text-center mb-10">
      <span className="inline-block mb-2 text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: accentColor }}>{badge}</span>
      <h2 className="font-display text-[22px] md:text-[28px] font-bold mb-3 leading-tight" style={{ color: BRAND.navy }}>{title}</h2>
      {subtitle && <p className="text-slate-500 text-sm md:text-base max-w-xl mx-auto font-normal leading-relaxed">{subtitle}</p>}
    </div>
  )
}

function PillarCard({ icon: Icon, title, desc, reverseGradient, href }) {
  const bg = reverseGradient ? `linear-gradient(135deg, ${BRAND.deep}, ${BRAND.navy})` : `linear-gradient(135deg, ${BRAND.navy}, ${BRAND.deep})`
  const onClick = () => {
    if (!href) return
    if (href.startsWith('#')) document.getElementById(href.slice(1))?.scrollIntoView({ behavior: 'smooth' })
    else if (typeof window !== 'undefined') window.location.href = href
  }
  return (
    <Card onClick={onClick} className="border-0 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition group cursor-pointer relative overflow-hidden">
      {/* Hover gradient accent */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500" style={{ background: `linear-gradient(135deg, ${BRAND.blue}05, ${BRAND.red}10)` }} />
      <CardContent className="p-6 relative">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition" style={{ background: bg }}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <h3 className="font-display font-semibold text-xl mb-2 transition group-hover:text-[#0EAFC5]" style={{ color: BRAND.blue }}>{title}</h3>
        <p className="text-slate-600 text-sm leading-relaxed font-normal">{desc}</p>
        <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition duration-300" style={{ color: BRAND.red }}>
          Explore <ArrowRight className="w-3 h-3" />
        </div>
      </CardContent>
    </Card>
  )
}

function PictorialCard({ image, label, title, desc, href, badge, accent, objectFit }) {
  const accentColor = accent || BRAND.deep
  const fit = objectFit || 'cover'
  const onClick = () => {
    if (!href) return
    if (href.startsWith('#')) document.getElementById(href.slice(1))?.scrollIntoView({ behavior: 'smooth' })
    else if (typeof window !== 'undefined') window.location.href = href
  }
  return (
    <div
      onClick={onClick}
      className="group cursor-pointer rounded-xl overflow-hidden bg-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
      style={{ border: '1px solid #e2e8f0', borderTop: `3px solid ${accentColor}` }}
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden bg-slate-50 flex items-center justify-center">
        {image
          ? <img src={image} alt={title} className={`w-full h-full transition-transform duration-500 ${fit === 'contain' ? 'object-contain p-3 group-hover:scale-105' : 'object-cover group-hover:scale-105'}`} />
          : <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${BRAND.navy}, ${accentColor})` }} />
        }
      </div>

      {/* Card body — Coursera style */}
      <div className="p-4">
        <h3 className="font-display font-semibold text-[15px] leading-snug mb-1.5 group-hover:underline underline-offset-2 decoration-slate-300" style={{ color: BRAND.navy }}>{title}</h3>
        <p className="text-slate-500 text-[13px] leading-relaxed line-clamp-2 mb-3">{desc}</p>
        <div className="flex items-center gap-1 text-[13px] font-semibold group-hover:translate-x-0.5 transition-transform" style={{ color: accentColor }}>
          Explore <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200" />
        </div>
      </div>
    </div>
  )
}

function AwarenessSection({ content, t }) {
  const cards = content?.awareness?.items || []
  const ACCENT = '#de2527'
  const DEFAULT_LABELS = ['7 States', 'Digital Reach', 'NGO Network']

  const go = (href) => {
    if (!href) return
    if (href.startsWith('#')) document.getElementById(href.slice(1))?.scrollIntoView({ behavior: 'smooth' })
    else if (typeof window !== 'undefined') window.location.href = href
  }

  return (
    <section id="awareness" className="section-pad" style={{ background: 'linear-gradient(135deg, #EEF5FF 0%, #DBEAFE 100%)' }}>
      <div className="max-w-6xl mx-auto px-4">

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 items-center">

          {/* Left info panel */}
          <div className="w-full lg:w-60 xl:w-64 flex-shrink-0">
            <span className="inline-block mb-3 text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: ACCENT }}>
              {t.badges.awareness}
            </span>
            <h2 className="font-display text-[22px] md:text-[26px] font-bold leading-snug mb-3" style={{ color: '#201F5E' }}>
              {t.awareness.title}
            </h2>
            <p className="text-slate-600 text-[13px] leading-relaxed">
              {t.awareness.subtitle}
            </p>
          </div>

          {/* Cards — horizontal scroll on mobile, 3-col grid on desktop */}
          <div className="flex-1 w-full min-w-0 overflow-x-auto no-scrollbar lg:overflow-visible">
            <div className="flex gap-4 lg:grid lg:grid-cols-3 lg:gap-4 pb-3 lg:pb-0 w-max lg:w-full">
              {cards.map((card, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  onClick={() => go(card.href)}
                  className="w-60 md:w-64 lg:w-auto flex-shrink-0 lg:flex-shrink bg-white rounded-xl overflow-hidden shadow-md hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-pointer group"
                >
                  {/* Full-visible image */}
                  <div className="relative overflow-hidden" style={{ aspectRatio: '4/3', background: '#0f172a' }}>
                    {card.image
                      ? <img src={card.image} alt={card.title} className="w-full h-full object-contain group-hover:scale-[1.03] transition-transform duration-500" />
                      : <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #201F5Ecc, #de252744)' }}>
                          <Sparkles className="w-12 h-12 text-white/30" />
                        </div>
                    }
                    {/* Bottom label ribbon — always uses DEFAULT_LABELS, not card title */}
                    <div className="absolute bottom-0 left-0 right-0 px-3 py-2" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)' }}>
                      <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/85">
                        {DEFAULT_LABELS[i]}
                      </span>
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="p-4">
                    <h3 className="font-display font-semibold text-[14px] leading-snug mb-1.5 text-[#201F5E]">
                      {card.title}
                    </h3>
                    <p className="text-slate-500 text-[12px] leading-relaxed line-clamp-2 mb-3">{card.desc}</p>
                    <div className="flex items-center gap-1 text-[12px] font-semibold" style={{ color: ACCENT }}>
                      Explore <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

function AccessSection({ content, t }) {
  const cards = content?.access?.items || []
  const ACCENT = '#16A34A'
  const DEFAULT_LABELS = ['Training', 'KOL Program', 'Workshop']
  const go = (href) => {
    if (!href) return
    if (href.startsWith('#')) document.getElementById(href.slice(1))?.scrollIntoView({ behavior: 'smooth' })
    else if (typeof window !== 'undefined') window.location.href = href
  }
  if (!cards.length) return null
  return (
    <section id="access" style={{ background: '#F0FDF4' }} className="section-pad">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 items-center">
          {/* Left info panel */}
          <div className="w-full lg:w-60 xl:w-64 flex-shrink-0">
            <span className="inline-block mb-3 text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: ACCENT }}>
              {t.badges.access}
            </span>
            <h2 className="font-display text-[22px] md:text-[26px] font-bold leading-snug mb-3" style={{ color: '#201F5E' }}>
              {content?.access?.title || t.access.title}
            </h2>
            <p className="text-slate-600 text-[13px] leading-relaxed">
              {content?.access?.subtitle || t.access.subtitle}
            </p>
          </div>
          {/* Cards */}
          <div className="flex-1 w-full min-w-0 overflow-x-auto no-scrollbar lg:overflow-visible">
            <div className="flex gap-4 lg:grid lg:grid-cols-3 lg:gap-4 pb-3 lg:pb-0 w-max lg:w-full">
              {cards.map((card, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  onClick={() => go(card.href)}
                  className="w-60 md:w-64 lg:w-auto flex-shrink-0 lg:flex-shrink bg-white rounded-xl overflow-hidden shadow-md hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-pointer group"
                >
                  <div className="relative overflow-hidden" style={{ aspectRatio: '4/3', background: '#0f172a' }}>
                    {card.image
                      ? <img src={card.image} alt={card.title} className="w-full h-full object-contain group-hover:scale-[1.03] transition-transform duration-500" />
                      : <div className="w-full h-full flex items-center justify-center"><Sparkles className="w-12 h-12 text-white/20" /></div>
                    }
                    <div className="absolute bottom-0 left-0 right-0 px-3 py-2" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)' }}>
                      <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/85">{DEFAULT_LABELS[i]}</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-display font-semibold text-[14px] leading-snug mb-1.5 text-[#201F5E]">{card.title}</h3>
                    <p className="text-slate-500 text-[12px] leading-relaxed line-clamp-2 mb-3">{card.desc}</p>
                    <div className="flex items-center gap-1 text-[12px] font-semibold" style={{ color: ACCENT }}>
                      Explore <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function CommunicationSection({ content, t }) {
  const cards = content?.communication?.items || []
  const fits = ['contain', 'cover', 'contain']
  const ACCENT = '#7C3AED'
  const DEFAULT_LABELS = ['Print Media', 'Video', 'Visual Stories']
  const go = (href) => {
    if (!href) return
    if (href.startsWith('#')) document.getElementById(href.slice(1))?.scrollIntoView({ behavior: 'smooth' })
    else if (typeof window !== 'undefined') window.location.href = href
  }
  if (!cards.length) return null
  return (
    <section id="communication" style={{ background: '#F5F3FF' }} className="section-pad">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 items-center">
          {/* Left info panel */}
          <div className="w-full lg:w-60 xl:w-64 flex-shrink-0">
            <span className="inline-block mb-3 text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: ACCENT }}>
              {t.badges.communication}
            </span>
            <h2 className="font-display text-[22px] md:text-[26px] font-bold leading-snug mb-3" style={{ color: '#201F5E' }}>
              {content?.communication?.title || t.communication.title}
            </h2>
            <p className="text-slate-600 text-[13px] leading-relaxed">
              {content?.communication?.subtitle || t.communication.subtitle}
            </p>
          </div>
          {/* Cards */}
          <div className="flex-1 w-full min-w-0 overflow-x-auto no-scrollbar lg:overflow-visible">
            <div className="flex gap-4 lg:grid lg:grid-cols-3 lg:gap-4 pb-3 lg:pb-0 w-max lg:w-full">
              {cards.map((card, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  onClick={() => go(card.href)}
                  className="w-60 md:w-64 lg:w-auto flex-shrink-0 lg:flex-shrink bg-white rounded-xl overflow-hidden shadow-md hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-pointer group"
                >
                  <div className="relative overflow-hidden" style={{ aspectRatio: '4/3', background: '#0f172a' }}>
                    {card.image
                      ? <img src={card.image} alt={card.title} className={`w-full h-full transition-transform duration-500 group-hover:scale-[1.03] ${fits[i] === 'contain' ? 'object-contain' : 'object-cover'}`} />
                      : <div className="w-full h-full flex items-center justify-center"><Sparkles className="w-12 h-12 text-white/20" /></div>
                    }
                    <div className="absolute bottom-0 left-0 right-0 px-3 py-2" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)' }}>
                      <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/85">{DEFAULT_LABELS[i]}</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-display font-semibold text-[14px] leading-snug mb-1.5 text-[#201F5E]">{card.title}</h3>
                    <p className="text-slate-500 text-[12px] leading-relaxed line-clamp-2 mb-3">{card.desc}</p>
                    <div className="flex items-center gap-1 text-[12px] font-semibold" style={{ color: ACCENT }}>
                      Explore <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function OutreachSection({ content, t }) {
  const states = (content?.states || []).map(s => ({
    name: s.name,
    code: s.code,
    campaigns: s.sessions,
    beneficiaries: s.lives,
    workshops: Math.round((s.sessions || 0) / 3),
    enabled: true,
  }))
  return (
    <section id="outreach" className="section-pad bg-gradient-to-b from-white to-slate-50">
      <div className="container mx-auto px-4">
        <SectionHeader badge={t.badges.outreach} title={t.outreach.title} subtitle={t.outreach.subtitle} />
        <StatesGrid states={states} t={t} />
      </div>
    </section>
  )
}

function StoriesSection({ stories, t }) {
  if (!stories?.length) return null
  return (
    <section id="stories" className="section-pad bg-white">
      <div className="container mx-auto px-4">
        <SectionHeader badge={t.badges.stories} title={t.stories.title} subtitle={t.stories.subtitle} />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.filter(s => s.published !== false).slice(0, 6).map(s => (
            <Link key={s.id} href={`/impact-stories/${s.id}`}>
              <Card className="overflow-hidden group cursor-pointer h-full hover:-translate-y-2 transition duration-300 border-0 shadow-lg hover:shadow-2xl">
                <div className="relative h-72 overflow-hidden bg-slate-100">
                  {s.heroImage && <img src={s.heroImage} alt={s.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <Badge className="mb-2 border-0" style={{ background: BRAND.deep }}>{s.category}</Badge>
                    <h3 className="font-display font-semibold text-xl drop-shadow-lg line-clamp-2">{s.title}</h3>
                    {s.state && <p className="text-xs text-white/80 mt-1"><MapPin className="w-3 h-3 inline mr-1" />{s.state}</p>}
                  </div>
                </div>
                <CardContent className="p-4">
                  <p className="text-sm text-slate-600 line-clamp-2">{s.description}</p>
                  <div className="mt-2 inline-flex items-center text-sm font-semibold group-hover:translate-x-1 transition" style={{ color: BRAND.deep }}>{t.stories.readMore}</div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link href="/impact-stories"><Button variant="outline" className="border-[#201F5E] text-[#201F5E]">{t.stories.viewAll} <ArrowRight className="w-4 h-4 ml-1" /></Button></Link>
        </div>
      </div>
    </section>
  )
}

function GallerySection({ albums, t }) {
  const [filter, setFilter] = useState('all')
  const [q, setQ] = useState('')
  const [lightbox, setLightbox] = useState(null)
  const published = (albums || []).filter(a => a.published !== false)
  const categories = ['all', ...new Set(published.map(a => a.category).filter(Boolean))]
  const filtered = published.filter(a => (filter === 'all' || a.category === filter) && (!q || `${a.title} ${a.description}`.toLowerCase().includes(q.toLowerCase())))
  if (!published.length) return null
  return (
    <section id="gallery" className="section-pad bg-slate-50">
      <div className="container mx-auto px-4">
        <SectionHeader badge={t.badges.gallery} title={t.gallery.title} subtitle={t.gallery.subtitle} />
        <div className="flex flex-wrap gap-2 mb-6 items-center">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <Input placeholder={t.gallery.search} value={q} onChange={e => setQ(e.target.value)} className="pl-9" autoComplete="off" />
          </div>
          {categories.map(c => (
            <Button key={c} size="sm" variant={filter === c ? 'default' : 'outline'} onClick={() => setFilter(c)} className={filter === c ? '' : ''} style={filter === c ? { background: BRAND.blue } : undefined}>
              {c === 'all' ? t.gallery.all : c}
            </Button>
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map(a => (
            <button key={a.id} onClick={() => setLightbox(a)} className="group relative aspect-square overflow-hidden rounded-xl shadow-md hover:shadow-2xl transition">
              {a.coverImage && <img src={a.coverImage} alt={a.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 text-white text-left">
                <Badge className="text-xs mb-1 border-0" style={{ background: BRAND.red }}>{a.category}</Badge>
                <div className="font-semibold text-sm drop-shadow-md line-clamp-2">{a.title}</div>
                <div className="text-xs text-white/80">{a.images?.length || 0} {t.gallery.photos}</div>
              </div>
            </button>
          ))}
        </div>
        {lightbox && (
          <Dialog open onOpenChange={() => setLightbox(null)}>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>{lightbox.title}</DialogTitle><DialogDescription>{lightbox.description}</DialogDescription></DialogHeader>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {(lightbox.images || []).map((img, i) => <img key={i} src={img} alt="" className="w-full h-48 object-cover rounded-lg" />)}
                {!lightbox.images?.length && lightbox.coverImage && <img src={lightbox.coverImage} alt="" className="w-full h-96 object-cover rounded-lg col-span-full" />}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </section>
  )
}

function MythsSection({ content, t }) {
  const [expanded, setExpanded] = useState(null)
  const myths = content?.myths || []

  const CATEGORIES = [
    {
      label: 'Physical Actions',
      icon: ShieldAlert,
      color: BSV_RED,
      thumb: 'https://images.unsplash.com/photo-1603714228681-b399854b8f80?w=120&q=80&fit=crop',
      ids: [1, 4],
    },
    {
      label: 'Traditional Healing',
      icon: Lightbulb,
      color: BRAND.deep,
      thumb: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=120&q=80&fit=crop',
      ids: [2, 3],
    },
    {
      label: 'Snake Facts & First Aid',
      icon: Shield,
      color: '#059669',
      thumb: 'https://images.unsplash.com/photo-1518467437099-b2f8b7b71d8f?w=120&q=80&fit=crop',
      ids: [5, 6],
    },
  ]

  return (
    <section id="myths" className="section-pad" style={{ background: '#F0F8FF' }}>
      <div className="container mx-auto px-4">
        <SectionHeader badge={t.badges.myths} title={t.myths.title} subtitle={t.myths.subtitle} accent={BSV_RED} />
        <div className="grid md:grid-cols-3 gap-6">
          {CATEGORIES.map((cat) => {
            const CatIcon = cat.icon
            const catMyths = myths.filter(m => cat.ids.includes(m.id))
            return (
              <div key={cat.label} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {/* Category header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: cat.color + '18' }}>
                      <CatIcon className="w-4 h-4" style={{ color: cat.color }} />
                    </div>
                    <span className="font-bold text-base" style={{ color: BRAND.blue }}>{cat.label}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </div>

                {/* Myth items */}
                <div className="divide-y divide-slate-100">
                  {catMyths.map((m) => {
                    const isOpen = expanded === m.id
                    return (
                      <div
                        key={m.id}
                        className="cursor-pointer hover:bg-slate-50 transition-colors duration-150"
                        onClick={() => setExpanded(isOpen ? null : m.id)}
                      >
                        {/* Row */}
                        <div className="flex gap-3 p-4">
                          <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100">
                            {m.image && (
                              <img src={m.image} alt={m.myth} className="w-full h-full object-cover" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: BRAND.red }}>
                                {t.myths.myth}
                              </span>
                            </div>
                            <p className="font-semibold text-sm leading-snug line-clamp-2" style={{ color: BRAND.blue }}>
                              &ldquo;{m.myth}&rdquo;
                            </p>
                            <div className="flex items-center gap-1 mt-1.5 text-xs font-medium" style={{ color: isOpen ? '#059669' : BRAND.red }}>
                              {isOpen ? <><CheckCircle2 className="w-3 h-3" /> Hide fact</> : <><ChevronRight className="w-3 h-3" /> {t.myths.tap}</>}
                            </div>
                          </div>
                        </div>

                        {/* Expanded fact */}
                        {isOpen && (
                          <div className="mx-4 mb-4 p-3 rounded-xl bg-green-50 border border-green-100">
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <Lightbulb className="w-3.5 h-3.5 text-green-600" />
                              <span className="text-[10px] font-bold text-green-700 uppercase tracking-wide">{t.myths.fact}</span>
                            </div>
                            <p className="text-sm text-green-900 leading-relaxed">{m.fact}</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function LeadForm({ open, onOpenChange, resource, lang }) {
  const [form, setForm] = useState({ name: '', phone: '', city: '' })
  const [submitting, setSubmitting] = useState(false)
  const submit = async () => {
    if (!form.name || !form.phone || !form.city) { toast.error('All fields required'); return }
    setSubmitting(true)
    try {
      await fetch('/api/leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, email: '', resourceId: resource?.id, resourceTitle: resource?.title, language: lang, source: 'resource_download', purpose: 'Resource Download' }) })
      toast.success('Download starting...')
      if (resource?.file && resource.file !== '#') {
        const a = document.createElement('a'); a.href = resource.file; a.download = resource.title; a.target = '_blank'; document.body.appendChild(a); a.click(); document.body.removeChild(a)
      }
      onOpenChange(false); setForm({ name: '', phone: '', city: '' })
    } catch { toast.error('Error') }
    setSubmitting(false)
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl" style={{ color: BRAND.blue }}>Download &ldquo;{resource?.title}&rdquo;</DialogTitle>
          <DialogDescription>Quick details — file downloads immediately after submit.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div><Label>Full Name *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
          <div><Label>Phone Number *</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
          <div><Label>City *</Label><Input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} /></div>
        </div>
        <Button onClick={submit} disabled={submitting} className="w-full text-white" style={{ background: BRAND.red }}>{submitting ? 'Processing...' : 'Download Now'}</Button>
      </DialogContent>
    </Dialog>
  )
}

function ResourcesSection({ content, lang, t }) {
  const [filter, setFilter] = useState('All')
  const [leadOpen, setLeadOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const categories = useMemo(() => [t.resources.all, ...new Set(content?.resources?.map(r => r.category) || [])], [content, t])
  const filtered = filter === t.resources.all || filter === 'All' ? (content?.resources || []) : (content?.resources || []).filter(r => r.category === filter)
  return (
    <section id="resources" className="section-pad bg-slate-50">
      <div className="container mx-auto px-4">
        <SectionHeader badge={t.badges.resources} title={t.resources.title} subtitle={t.resources.subtitle} />
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map(c => (
            <Button key={c} variant={filter === c ? 'default' : 'outline'} size="sm" onClick={() => setFilter(c)} style={filter === c ? { background: BRAND.blue } : undefined}>{c}</Button>
          ))}
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(r => (
            <Card key={r.id} className="group overflow-hidden hover:shadow-2xl transition hover:-translate-y-1">
              <div className="aspect-video bg-slate-200 relative overflow-hidden">
                {r.preview && <img src={r.preview} alt={r.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />}
                <Badge className="absolute top-3 left-3 border-0" style={{ background: BRAND.red }}>{r.category}</Badge>
              </div>
              <CardContent className="p-5">
                <h3 className="font-display font-semibold mb-1" style={{ color: BRAND.blue }}>{r.title}</h3>
                <p className="text-sm text-slate-600 mb-4 line-clamp-2">{r.desc}</p>
                <Button size="sm" className="w-full text-white" style={{ background: BRAND.blue }} onClick={() => { setSelected(r); setLeadOpen(true) }}>{t.resources.download}</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <LeadForm open={leadOpen} onOpenChange={setLeadOpen} resource={selected} lang={lang} t={t} />
    </section>
  )
}

const CONTACT_ADDRESS = 'BSV (A Mankind Group Company)\n3rd Floor, Liberty Tower, Plot No. K-10, Behind Reliable Plaza, Kalwa Industrial Estate, Airoli, Navi Mumbai, Thane 400708'
const CONTACT_EMAIL = 'campaign@bsvindia.com'

function ContactSection({ content, t }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [submitting, setSubmitting] = useState(false)
  const submit = async () => {
    if (!form.name || !form.email || !form.phone || !form.message) { toast.error('Please fill all required fields including Phone Number'); return }
    setSubmitting(true)
    try {
      const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (res.ok) { toast.success('Message sent! We will respond within 24 hours.'); setForm({ name: '', email: '', phone: '', message: '' }) }
    } catch { toast.error('Error') }
    setSubmitting(false)
  }
  const email = content?.contact?.email || CONTACT_EMAIL
  const address = CONTACT_ADDRESS
  return (
    <section id="contact" className="section-pad bg-white">
      <div className="container mx-auto px-4">
        <SectionHeader badge={t.badges.contact} title={t.contact.title} subtitle={t.contact.subtitle} />
        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Info panel — email + address only */}
          <Card className="border-0 shadow-xl">
            <CardContent className="p-8 space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${BRAND.deep}18` }}>
                  <Mail className="w-5 h-5" style={{ color: BRAND.deep }} />
                </div>
                <div>
                  <div className="font-display font-semibold mb-0.5" style={{ color: BRAND.navy }}>{t.contact.email}</div>
                  <a href={`mailto:${email}`} className="text-slate-600 hover:underline text-sm">{email}</a>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${BRAND.deep}18` }}>
                  <MapPin className="w-5 h-5" style={{ color: BRAND.deep }} />
                </div>
                <div>
                  <div className="font-display font-semibold mb-1" style={{ color: BRAND.navy }}>{t.contact.office}</div>
                  <div className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{address}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact form */}
          <Card className="border-0 shadow-xl">
            <CardContent className="p-8 space-y-4">
              <h3 className="font-display font-semibold text-xl" style={{ color: BRAND.navy }}>{t.contact.send}</h3>
              <div><Label>{t.contact.name} *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>{t.contact.email} *</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
              <div><Label>{t.contact.phone} *</Label><Input type="tel" placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
              <div><Label>{t.contact.message} *</Label><Textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} rows={4} /></div>
              <Button onClick={submit} disabled={submitting} className="w-full text-white" style={{ background: `linear-gradient(135deg, ${BSV_RED} 0%, #a81b1d 100%)` }}>{submitting ? t.contact.sending : t.contact.sendMessage}</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

function Footer({ content, t, settings }) {
  const f = content?.footer || {}
  return (
    <footer className="text-white" style={{ background: `linear-gradient(135deg, ${BRAND.navy} 0%, ${BRAND.deep} 100%)` }}>
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="font-display font-semibold text-xl mb-2">BSV Campaign</div>
            <div className="text-sm text-white/70 mb-4">{f.tagline || 'Saap Ka Vaar, Aspataal Mein Hi Upchaar'}</div>
            {settings?.branding?.footerLogo && (
              <img
                src={settings.branding.footerLogo}
                alt="BSV Mankind"
                className="bg-white p-2 rounded-lg max-w-[200px]"
              />
            )}
          </div>
          <div>
            <div className="font-display font-semibold mb-3">{t.footer.quickLinks}</div>
            <ul className="space-y-2 text-sm text-white/80">
              <li><a href="#awareness" className="hover:text-white">{t.nav.awareness}</a></li>
              <li><a href="#access" className="hover:text-white">{t.nav.access}</a></li>
              <li><a href="#communication" className="hover:text-white">{t.nav.communication}</a></li>
              <li><a href="#stories" className="hover:text-white">{t.nav.stories}</a></li>
              <li><a href="#gallery" className="hover:text-white">{t.nav.gallery}</a></li>
              <li><a href="#resources" className="hover:text-white">{t.nav.resources}</a></li>
            </ul>
          </div>
          <div>
            <div className="font-display font-semibold mb-3">{t.footer.contact}</div>
            <ul className="space-y-2 text-sm text-white/80">
              <li>{content?.contact?.email}</li>
              <li>{content?.contact?.phone}</li>
              <li>Mumbai, India</li>
            </ul>
          </div>
        </div>
        {/* Disclaimer + PV Statement */}
        <div className="border-t border-white/10 pt-6 mb-6 space-y-4">
          <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <p className="text-[11px] text-white/60 leading-relaxed">
              <span className="font-semibold text-white/80 uppercase tracking-wide text-[10px] mr-1">Disclaimer:</span>
              This is issued in public interest by Bharat Serums and Vaccines Limited and Mankind Pharma Limited. Information appearing on this material is for general awareness only. Nothing contained in this material constitutes medical advice. Please consult your doctor for medical advice or any questions or concern you may have regarding your condition.
            </p>
          </div>
          <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <p className="text-[11px] text-white/60 leading-relaxed">
              <span className="font-semibold text-white/80 uppercase tracking-wide text-[10px] mr-1">Pharmacovigilance:</span>
              To Report Suspected Adverse Reaction, Contact Bharat Serums and Vaccines Ltd. at{' '}
              <a href="mailto:pv@bsvgroup.com" className="text-white/80 underline hover:text-white">pv@bsvgroup.com</a>
              {' '}or visit the website{' '}
              <a href="https://www.bsvgroup.com/adverse/" target="_blank" rel="noopener noreferrer" className="text-white/80 underline hover:text-white">bsvgroup.com/adverse</a>
            </p>
          </div>
        </div>

        <div className="border-t border-white/10 pt-5 flex flex-wrap items-center justify-between gap-4 text-xs text-white/50">
          <div>{f.copyright || '© 2025 Bharat Serums and Vaccines Ltd. All rights reserved.'}</div>
          <div><a href="/admin" className="hover:text-white/80">{t.footer.admin}</a></div>
        </div>
      </div>
    </footer>
  )
}

function App() {
  const [lang, setLang] = useState('en')
  const [content, setContent] = useState(null)
  const [stories, setStories] = useState([])
  const [albums, setAlbums] = useState([])
  const [videos, setVideos] = useState([])
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)

  // Apply dynamic brand colors from settings.branding.colors
  useEffect(() => {
    const c = settings?.branding?.colors
    if (!c) return
    // Merge only the admin-configurable fields — preserve the full DEFAULT_BRAND structure
    BRAND = {
      ...DEFAULT_BRAND,
      blue: c.primary || DEFAULT_BRAND.blue,
      navy: c.primary || DEFAULT_BRAND.navy,
      heading: c.headingColor || DEFAULT_BRAND.heading,
      text: c.textColor || DEFAULT_BRAND.text,
      white: c.background || DEFAULT_BRAND.white,
      surface: c.surface || DEFAULT_BRAND.surface,
    }
    if (typeof document !== 'undefined') {
      const root = document.documentElement
      root.style.setProperty('--brand-primary', BRAND.blue)
      root.style.setProperty('--brand-accent', BRAND.cyan)
      root.style.setProperty('--brand-bg', BRAND.white)
      root.style.setProperty('--brand-surface', BRAND.surface)
      root.style.setProperty('--brand-heading', BRAND.heading)
      root.style.setProperty('--brand-text', BRAND.text)
    }
  }, [settings])

  const rawT = getT(lang)

  const resolved = (() => {
    if (!content) return null
    if (lang === 'en' || !content.translations?.[lang]) return content
    // Use translations regardless of approval status (since admin can refresh as needed)
    const trans = content.translations[lang]
    const merge = (base, tv) => {
      if (tv === undefined || tv === null) return base
      if (typeof base === 'string') return typeof tv === 'string' ? tv : base
      if (Array.isArray(base)) return base.map((item, i) => tv[i] !== undefined ? merge(item, tv[i]) : item)
      if (typeof base === 'object' && base !== null) {
        const out = { ...base }
        Object.keys(base).forEach(k => { if (tv[k] !== undefined) out[k] = merge(base[k], tv[k]) })
        return out
      }
      return base
    }
    return merge(content, trans)
  })()

  // Merge CMS sectionText overrides into t so section titles/subtitles/items are CMS-driven
  const st = resolved?.sectionText || DEFAULT_CONTENT.sectionText
  const t = {
    ...rawT,
    access: { ...rawT.access, ...(st?.access || {}) },
    communication: { ...rawT.communication, ...(st?.communication || {}) },
  }

  useEffect(() => {
    if (typeof window === 'undefined') return
    const saved = localStorage.getItem('bsv_lang')
    let next = null
    if (saved && LANGUAGES.find(l => l.code === saved)) next = saved
    else { const browser = navigator.language?.split('-')[0]; if (LANGUAGES.find(l => l.code === browser)) next = browser }
    if (next) setLang(next)
    fetch('/api/content').then(r => r.json()).then(d => { setContent(d); setLoading(false) }).catch(() => setLoading(false))
    fetch('/api/impact-stories').then(r => r.ok ? r.json() : []).then(d => setStories(Array.isArray(d) ? d : [])).catch(() => { })
    fetch('/api/gallery').then(r => r.ok ? r.json() : []).then(d => setAlbums(Array.isArray(d) ? d : [])).catch(() => { })
    fetch('/api/videos').then(r => r.ok ? r.json() : []).then(d => setVideos(Array.isArray(d) ? d : [])).catch(() => { })
    fetch('/api/settings').then(r => r.ok ? r.json() : null).then(d => d && setSettings(d)).catch(() => { })
  }, [])

  useEffect(() => { if (typeof window !== 'undefined') localStorage.setItem('bsv_lang', lang) }, [lang])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center" style={{ color: BRAND.blue }}>
        <div className="flex items-center gap-3">
          <img
            src={settings?.branding?.headerLogo}
            alt="BSV Mankind"
            className="h-24 md:h-28 w-auto mx-auto mb-4"
          />
        </div>

        <div className="font-display font-semibold text-xl">
          Saap Ka Vaar, Aspataal Mein Hi Upchaar
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      <Header lang={lang} setLang={setLang} t={t} settings={settings} />
      <main>
        <Hero content={resolved} t={t} />
        <HeroStatsSection content={resolved} t={t} />
        <VideoSection videos={videos} t={t} />
        <AwarenessSection content={resolved} t={t} />
        <AccessSection content={resolved} t={t} />
        <CommunicationSection content={resolved} t={t} />
        <OutreachSection content={resolved} t={t} />
        <StoriesSection stories={stories} t={t} />
        <GallerySection albums={albums} t={t} />
        <MythsSection content={resolved} t={t} />
        <QuizSection t={t} lang={lang} />
        {/* <ResourcesSection content={resolved} lang={lang} t={t} /> */}
        <ContactSection content={resolved} t={t} />
      </main>
      <Footer content={resolved} t={t} settings={settings} />
    </div>
  )
}

export default App