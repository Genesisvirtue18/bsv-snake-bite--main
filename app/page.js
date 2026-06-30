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
                    <div className="text-[9px] uppercase tracking-wide text-slate-500 mb-0.5">{t.outreach.activities}</div>
                    <div className="font-display font-bold text-lg" style={{ color: BRAND.deep }}>
                      <AnimatedCounter value={s.campaigns || 0} />
                    </div>
                  </div>
                  <div className="rounded-lg p-2.5" style={{ background: '#FFF0F0' }}>
                    <div className="text-[9px] uppercase tracking-wide text-slate-500 mb-0.5">{t.outreach.workshopsHeld}</div>
                    <div className="font-display font-bold text-lg" style={{ color: '#de2527' }}>
                      <AnimatedCounter value={s.workshops || 0} />
                    </div>
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
            { label: 'Nukkad Natak, Wall Paintings, Bus Branding', href: '/nukkad-natak', desc: 'Community outreach programs' },
            { label: 'Campaign Moments', href: '/nukkad-natak', desc: 'See campaign in action' },
          ]
        },
        {
          title: 'NGO Collaborations',
          items: [
            { label: 'Partner Network Across India', href: '/ngo-network', desc: 'Our NGO partners' },
            { label: 'Real-life Impact Stories', href: '/impact-stories', desc: 'Stories from the field' },
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
            { label: 'Field Stories', href: '/impact-stories', desc: 'Stories from clinicians' },
          ]
        },
        {
          title: 'Training Modules',
          items: [
            { label: 'ASV Protocols', href: '/downloads', desc: 'Clinical education materials' },
            { label: 'Download Library', href: '/downloads', desc: 'All resources in one place' },
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
            { label: 'Comic & Visual Stories', href: '/downloads', desc: 'Engaging visual content' },
            { label: 'Browse Gallery', href: '/gallery', desc: 'Photo gallery' },
          ]
        },
      ]
    },
  }

  const menu = [
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
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">

          {/* Logo — clicking navigates to top */}
          <button
            onClick={() => go('#home')}
            className="flex items-center gap-3 flex-shrink-0 group"
          >
            {/* BSV Logo */}
            <img
              src={settings?.branding?.bsvLogo}
              alt="BSV"
              className="h-10 sm:h-12 w-auto flex-shrink-0"
              draggable={false}
            />

            {/* Campaign Logo */}
            <img
              src="/images/saanplogo.png"
              alt="Saap Ka Vaar"
              className="h-10 sm:h-12 md:h-14 w-auto flex-shrink-0 ml-1 sm:ml-2"
              draggable={false}
            />
          </button>

          {/* Desktop Navigation — no Home button, logo handles it */}
          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 flex-1 justify-center">
            <button onClick={() => go('#video')} className="px-3 py-1.5 text-[13px] font-medium rounded-lg transition-all duration-200 hover:bg-slate-50" style={{ color: BRAND.blue }} onMouseEnter={e => e.currentTarget.style.color = BSV_RED} onMouseLeave={e => e.currentTarget.style.color = BRAND.blue}>
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
                  className={`px-3 py-1.5 text-[13px] font-medium rounded-lg transition-all duration-200 inline-flex items-center gap-1 ${megaOpen === key ? 'bg-slate-50' : 'hover:bg-slate-50'}`}
                  style={{ color: megaOpen === key ? BSV_RED : BRAND.blue }}
                >
                  {megaMenus[key].label}
                  <ChevronRight className={`w-3 h-3 transition-transform duration-200 ${megaOpen === key ? 'rotate-90' : ''}`} />
                </button>
              </div>
            ))}

            <button onClick={() => go('#outreach')} className="px-3 py-1.5 text-[13px] font-medium rounded-lg transition-all duration-200 hover:bg-slate-50" style={{ color: BRAND.blue }} onMouseEnter={e => e.currentTarget.style.color = BSV_RED} onMouseLeave={e => e.currentTarget.style.color = BRAND.blue}>
              {t.nav.outreach}
            </button>
          </nav>

          {/* Right: Mankind logo + Contact + Language — tight and clean */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <img
              src={settings?.branding?.mankindLogo}
              alt="Mankind"
              className="h-8 sm:h-10 w-auto flex-shrink-0"
              draggable={false}
            />

            {/* Divider */}
            <div className="hidden lg:block h-6 w-px bg-slate-200 mx-1" />

            {/* Contact CTA — desktop only */}
            <button
              onClick={() => go('#contact')}
              className="hidden lg:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[13px] font-semibold text-white rounded-lg hover:opacity-90 transition-all duration-200 flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${BSV_RED} 0%, #a81b1d 100%)` }}
            >
              {t.common.contactUs}
            </button>

            {/* Language — globe + short code */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1 transition-all duration-200 rounded-lg px-2 h-8"
                  style={{ color: BRAND.blue }}
                >
                  <Globe className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="text-[12px] font-medium hidden lg:inline">
                    {LANGUAGES.find(l => l.code === lang)?.code?.toUpperCase() || 'EN'}
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
              className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 active:bg-slate-200 transition-all duration-200 flex-shrink-0"
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
                        megaOpen === 'access' ? 'Ensuring snakebite victim gets the right care at the right time.' :
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
  const imageUrl =
    content?.heroImage ||
    content?.heroSlides?.[0]?.desktopImage ||
    content?.heroSlides?.[0]?.mobileImage

  if (!imageUrl) return null

  return (
    <section
      id="home"
      className="relative overflow-hidden pt-14 sm:pt-20 pb-0 sm:pb-6 bg-gradient-to-b from-slate-50 via-white to-slate-50"
    >
      {/* Mobile: full-bleed, no padding, no radius so image text isn't clipped */}
      <div className="sm:container sm:mx-auto sm:px-4 lg:px-8">
        <div className="relative w-full h-[56vw] min-h-[220px] max-h-[320px] sm:h-[360px] sm:max-h-none lg:h-[520px] overflow-hidden rounded-none sm:rounded-[24px]">
          <img
            src={imageUrl}
            alt="BSV Snakebite Awareness Campaign"
            className="w-full h-full object-cover object-left md:object-[center_15%] lg:object-[center_20%]"
            loading="eager"
          />
        </div>
      </div>
    </section>
  )
}

function HeroStatsSection({ content, t }) {
  const stats = DEFAULT_CONTENT.heroStats
  if (!stats.length) return null

  const StatCard = ({ s, i }) => {
    const Icon = ICONS[s.icon] || Heart
    return (
      <motion.div
        key={s.id}
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: i * 0.07, duration: 0.35 }}
        className="stat-pill"
      >
        <div className="stat-pill-icon">
          <Icon className="w-5 h-5" style={{ color: '#0D71B8' }} />
        </div>
        <div className="stat-pill-text">
          <div className="stat-pill-number">
            <AnimatedCounter value={s.value} suffix={s.suffix} />
          </div>
          <div className="stat-pill-label">{s.label}</div>
        </div>
      </motion.div>
    )
  }

  return (
    <section className="stat-section">
      <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
        {/* 2-col on mobile, 5-col on desktop — no sideways scroll */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {stats.map((s, i) => <StatCard key={s.id} s={s} i={i} />)}
        </div>
      </div>
    </section>
  )
}

function MissionSection({ content }) {
  const missionText =
    content?.about?.mission ||
    'To eliminate preventable snakebite deaths in India by 2030 through community awareness, healthcare education, and ensuring access to life-saving hospital treatment at every primary health center.'

  const MissionPillar = ({ icon: Icon, label }) => (
    <div className="flex flex-col items-center justify-center px-3">
      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#EFF5FF] flex items-center justify-center mb-2 shadow-sm border border-[#DCEBFF]">
        <Icon className="w-6 h-6 md:w-7 md:h-7" style={{ color: '#075BD8' }} />
      </div>
      <div className="text-[13px] md:text-[16px] font-semibold text-center" style={{ color: BRAND.navy }}>
        {label}
      </div>
    </div>
  )

  return (
    <section className="section-pad bg-[#F7FAFF]">
      <div className="container mx-auto px-4">
        <div className="relative max-w-6xl mx-auto overflow-hidden rounded-[30px] bg-white border border-[#E7EEF8] shadow-[0_18px_45px_rgba(15,23,42,0.08)] px-6 py-6 md:px-12 md:py-8">




          <div className="pointer-events-none absolute right-28 top-32 hidden md:block w-48 h-48 opacity-50 bg-[radial-gradient(circle,#B7D3FF_2px,transparent_2px)] [background-size:12px_12px]" />

          <div className="flex items-center justify-center mb-3">
            <div className="relative h-px w-24 md:w-44 bg-gradient-to-r from-[#075BD8] to-[#DE2527]">
              <span className="absolute -left-1 -top-[3px] w-2 h-2 rounded-full border border-[#075BD8] bg-white" />
            </div>

            <div className="mx-5 w-14 h-14 md:w-16 md:h-16 rounded-full bg-white shadow-[0_12px_28px_rgba(15,23,42,0.12)] flex items-center justify-center">
              <Activity className="w-7 h-7 md:w-8 md:h-8" style={{ color: '#075BD8' }} />
            </div>

            <div className="relative h-px w-24 md:w-44 bg-gradient-to-r from-[#075BD8] to-[#DE2527]">
              <span className="absolute -right-1 -top-[3px] w-2 h-2 rounded-full border border-[#DE2527] bg-white" />
            </div>
          </div>

          <div className="text-center mb-5">
            <h2 className="font-display text-[24px] md:text-[34px] font-bold tracking-[0.22em]" style={{ color: BRAND.navy }}>
              ABOUT CAMPAIGN
            </h2>
            <div className="mt-3 flex items-center justify-center gap-1">
              <span className="h-[2px] w-14 bg-[#075BD8]" />
              <span className="h-[2px] w-14 bg-[#DE2527]" />
            </div>
          </div>

          <div className="grid md:grid-cols-[1fr_0.95fr] gap-6 md:gap-8 items-center">
            <div className="order-2 md:order-1 relative">
              <div className="w-14 h-14 rounded-full bg-[#FDEBEE] flex items-center justify-center text-[54px] font-black leading-none mb-3" style={{ color: BSV_RED }}>
                “
              </div>

              <p className="font-display text-[18px] md:text-[22px] leading-[1.6] font-semibold max-w-xl" style={{ color: BRAND.navy }}>
                {missionText}
              </p>

              <div className="flex justify-end mt-1 md:mr-3">
                <div className="w-14 h-14 rounded-full bg-[#FDEBEE] flex items-center justify-center text-[54px] font-black leading-none" style={{ color: BSV_RED }}>
                  ”
                </div>
              </div>
            </div>

            <div className="order-1 md:order-2 flex justify-center items-center">
              <img
                src="/images/saanplogo.png"
                alt="Saap Ka Vaar Aspataal Mein Hi Upchaar"
                className="w-full max-w-[260px] md:max-w-[380px] h-auto object-contain"
                draggable={false}
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

function VideoSection({ videos, content, t }) {
  const [active, setActive] = useState(null)
  const published = (videos || []).filter(v => v.published !== false)
  const featured = published.find(v => v.featured) || published[0]
  const others = published.filter(v => v.id !== featured?.id)

  const GANGULY = {
    id: 'ganguly',
    youtubeId: 'jkNMN2AWaM0',
    title: 'Only Hospital Care Fights Snake Bites',
    description: 'Cricketer Sourav Ganguly joins hand with the BSV campaign to urge every Indian to rush to the nearest hospital in case of a snakebite — because only hospital care fights snake bites.',
    category: 'SaanpKaVaarAsptaalMeinHiUpchaar',
    thumbnail: 'https://img.youtube.com/vi/jkNMN2AWaM0/maxresdefault.jpg',
  }

  const ANIMATED_DEFAULTS = [
    'Village Nukkad Tea Stall',
    'A Farmer gets bitten by a snake in a farm',
    'Snake bites a boy playing outside his house',
  ]

  const amitabh = {
    ...(featured || { id: 'amitabh' }),
    title: 'Only Hospital Care Fights Snake Bites',
    description: featured?.description || 'Actor Amitabh Bachchan joins hands with BSV to spread awareness about snakebite prevention, debunk common myths, and encourage timely hospital treatment through this nationwide public awareness campaign.',
    category: 'SaanpKaVaarAsptaalMeinHiUpchaar',
  }

  const celebVideos = [amitabh, GANGULY]

  const CelebCard = ({ v }) => (
    <div>
      <button
        onClick={() => setActive(v)}
        className="relative w-full group overflow-hidden rounded-2xl shadow-lg bg-slate-900 text-left block"
      >
        <div className="aspect-video">
          {v.thumbnail && (
            <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
          )}
        </div>
        <div className="absolute inset-0 bg-black/25" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-all" style={{ background: BSV_RED }}>
            <Play className="w-7 h-7 md:w-9 md:h-9 fill-white text-white ml-1" />
          </div>
        </div>
        <div className="absolute bottom-4 left-4">
          <span className="inline-flex rounded-full px-3 py-1.5 text-[10px] font-bold text-white" style={{ background: BSV_RED }}>
            {v.category}
          </span>
        </div>
      </button>
      <div className="mt-4">
        <h3 className="font-display text-[18px] md:text-[22px] font-bold mb-2" style={{ color: BRAND.navy }}>
          {v.title}
        </h3>
        <div className="w-16 h-0.5 rounded-full mb-2" style={{ background: BRAND.deep }} />
        <p className="text-slate-600 text-[14px] leading-6">{v.description}</p>
      </div>
    </div>
  )

  return (
    <>
      <section id="video" className="section-pad bg-white">
        <div className="max-w-6xl mx-auto px-4">

          {/* Main heading */}
          <div className="text-center mb-8">
            <div
              className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full text-white shadow-md"
              style={{ background: BSV_RED }}
            >
              <Play className="w-5 h-5 fill-current ml-0.5" />
            </div>

            <div className="flex items-center justify-center gap-4">
              <div className="h-px w-12 md:w-24" style={{ background: BSV_RED }} />
              <h2
                className="font-display text-[24px] md:text-[34px] font-bold"
                style={{ color: BRAND.navy }}
              >
                WATCH THE CAMPAIGN
              </h2>
              <div className="h-px w-12 md:w-24" style={{ background: BSV_RED }} />
            </div>
          </div>

          {/* Two celebrity videos — parallel on desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 mb-12">
            {celebVideos.map((v, i) => <CelebCard key={v.id || i} v={v} />)}
          </div>

          {/* Animated / other videos */}
          {others.length > 0 && (
            <div className="border-t border-slate-200 pt-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="inline-block text-[11px] font-bold uppercase tracking-[0.14em] mb-1" style={{ color: BRAND.deep }}>WATCH</span>
                  <h3 className="font-display text-[24px] md:text-[28px] font-bold" style={{ color: BRAND.navy }}>More Videos</h3>
                </div>
                <Link
                  href="/videos"
                  className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white transition hover:scale-[1.02]"
                  style={{ background: `linear-gradient(135deg, ${BRAND.deep}, ${BRAND.navy})` }}
                >
                  Watch More <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
                {others.map((v, i) => (
                  <motion.button
                    key={v.id}
                    onClick={() => setActive(v)}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06, duration: 0.35 }}
                    className="group text-left rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 bg-white border border-slate-100"
                  >
                    <div className="relative aspect-video overflow-hidden bg-slate-900">
                      {v.thumbnail && <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />}
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <div className="w-11 h-11 rounded-full flex items-center justify-center group-hover:scale-110 transition-all" style={{ background: BSV_RED }}>
                          <Play className="w-5 h-5 fill-white text-white ml-0.5" />
                        </div>
                      </div>
                    </div>
                    <div className="p-2.5 sm:p-4">
                      <div className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: BRAND.deep }}>
                        SaanpKaVaarAsptaalMeinHiUpchaar
                      </div>
                      <div className="font-display font-semibold text-[12px] sm:text-[14px] leading-snug line-clamp-2" style={{ color: BRAND.navy }}>
                        {v.title || ANIMATED_DEFAULTS[i] || ''}
                      </div>
                      {v.description && <p className="hidden sm:block text-[12px] text-slate-500 mt-1.5 line-clamp-2">{v.description}</p>}
                    </div>
                  </motion.button>
                ))}
              </div>

              <div className="md:hidden text-center mt-6">
                <Link
                  href="/videos"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white"
                  style={{ background: `linear-gradient(135deg, ${BRAND.deep}, ${BRAND.navy})` }}
                >
                  Watch More <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Video modal */}
      {active && (
        <Dialog open onOpenChange={() => setActive(null)}>
          <DialogContent className="max-w-4xl w-[92vw] max-h-[82vh] overflow-y-auto p-0 bg-black mt-10">
            <DialogHeader className="sr-only">
              <DialogTitle>{active.title}</DialogTitle>
              <DialogDescription>{active.description}</DialogDescription>
            </DialogHeader>

            <div className="aspect-video w-full max-h-[65vh] bg-black">
              {active.youtubeId ? (
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${active.youtubeId}?autoplay=1&rel=0`}
                  title={active.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : active.url ? (
                <video src={active.url} controls autoPlay className="w-full h-full" />
              ) : null}
            </div>

            <div className="p-4 bg-white">
              <div
                className="font-display font-semibold text-lg"
                style={{ color: BRAND.blue }}
              >
                {active.title}
              </div>

              {active.description && (
                <p className="text-sm text-slate-600 mt-1 line-clamp-3">
                  {active.description}
                </p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
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
    <section id="awareness" className="section-pad" style={{ background: '#FFF2F2' }}>
      <div className="max-w-6xl mx-auto px-4">

        <div className="flex flex-col md:flex-row gap-8 md:gap-10 items-center">

          {/* Left info panel */}
          <div className="w-full md:w-48 lg:w-60 xl:w-64 flex-shrink-0">
            <span className="inline-block mb-3 text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: ACCENT }}>
              {t.badges.awareness}
            </span>
            <h2 className="font-display text-[22px] md:text-[22px] lg:text-[26px] font-bold leading-snug mb-3" style={{ color: '#201F5E' }}>
              {t.awareness.title}
            </h2>
            <p className="text-slate-600 text-[13px] leading-relaxed">
              {t.awareness.subtitle}
            </p>
          </div>

          {/* Cards — horizontal scroll on mobile, 3-col grid on desktop */}
          <div className="flex-1 w-full min-w-0">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {cards.map((card, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  onClick={() => go(card.href)}
                  className="bg-white rounded-xl overflow-hidden shadow-md hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-pointer group"
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
                      {t.common.explore} <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
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
        <div className="flex flex-col md:flex-row gap-8 md:gap-10 items-center">
          {/* Left info panel */}
          <div className="w-full md:w-48 lg:w-60 xl:w-64 flex-shrink-0">
            <span className="inline-block mb-3 text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: ACCENT }}>
              {t.badges.access}
            </span>
            <h2 className="font-display text-[22px] md:text-[22px] lg:text-[26px] font-bold leading-snug mb-3" style={{ color: '#201F5E' }}>
              {content?.access?.title || t.access.title}
            </h2>
            <p className="text-slate-600 text-[13px] leading-relaxed">
              {content?.access?.subtitle || t.access.subtitle}
            </p>
          </div>
          {/* Cards */}
          <div className="flex-1 w-full min-w-0">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {cards.map((card, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  onClick={() => go(card.href)}
                  className="bg-white rounded-xl overflow-hidden shadow-md hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-pointer group"
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
                  <div className="p-2.5 sm:p-4">
                    <h3 className="font-display font-semibold text-[12px] sm:text-[14px] leading-snug mb-1 sm:mb-1.5 text-[#201F5E]">{card.title}</h3>
                    <p className="hidden sm:block text-slate-500 text-[12px] leading-relaxed line-clamp-2 mb-3">{card.desc}</p>
                    <div className="flex items-center gap-1 text-[11px] sm:text-[12px] font-semibold" style={{ color: ACCENT }}>
                      {t.common.explore} <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
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
        <div className="flex flex-col md:flex-row gap-8 md:gap-10 items-center">
          {/* Left info panel */}
          <div className="w-full md:w-48 lg:w-60 xl:w-64 flex-shrink-0">
            <span className="inline-block mb-3 text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: ACCENT }}>
              {t.badges.communication}
            </span>
            <h2 className="font-display text-[22px] md:text-[22px] lg:text-[26px] font-bold leading-snug mb-3" style={{ color: '#201F5E' }}>
              {content?.communication?.title || t.communication.title}
            </h2>
            <p className="text-slate-600 text-[13px] leading-relaxed">
              {content?.communication?.subtitle || t.communication.subtitle}
            </p>
          </div>
          {/* Cards */}
          <div className="flex-1 w-full min-w-0">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {cards.map((card, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  onClick={() => go(card.href)}
                  className="bg-white rounded-xl overflow-hidden shadow-md hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-pointer group"
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
                  <div className="p-2.5 sm:p-4">
                    <h3 className="font-display font-semibold text-[12px] sm:text-[14px] leading-snug mb-1 sm:mb-1.5 text-[#201F5E]">{card.title}</h3>
                    <p className="hidden sm:block text-slate-500 text-[12px] leading-relaxed line-clamp-2 mb-3">{card.desc}</p>
                    <div className="flex items-center gap-1 text-[11px] sm:text-[12px] font-semibold" style={{ color: ACCENT }}>
                      {t.common.explore} <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
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
  // Hidden until campaign data is sizeable — re-enable when ready
  return null
}

function StoriesSection({ stories, t }) {
  if (!stories?.length) return null
  return (
    <section id="stories" className="section-pad" style={{ background: '#F0FDFB' }}>
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
    <section id="gallery" className="section-pad" style={{ background: '#FDF8FF' }}>
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
    <section id="myths" className="section-pad" style={{ background: '#FFF7ED' }}>
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
  const ACCENT = BRAND.deep
  return (
    <section id="contact" style={{ background: '#F0F6FF' }} className="section-pad">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-14 items-start">

          {/* Left info panel */}
          <div className="w-full lg:w-64 xl:w-72 flex-shrink-0">
            <span className="inline-block mb-3 text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: ACCENT }}>
              {t.badges.contact}
            </span>
            <h2 className="font-display text-[22px] md:text-[26px] font-bold leading-snug mb-3" style={{ color: '#201F5E' }}>
              {t.contact.title}
            </h2>
            <p className="text-slate-600 text-[13px] leading-relaxed mb-8">
              {t.contact.subtitle}
            </p>

            <div className="space-y-5">
              <div className="flex gap-3 items-start">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${ACCENT}15` }}>
                  <Mail className="w-4.5 h-4.5" style={{ color: ACCENT }} />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{t.contact.email}</div>
                  <a href={`mailto:${email}`} className="text-[13px] font-medium text-slate-700 hover:underline">{email}</a>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${ACCENT}15` }}>
                  <MapPin className="w-4.5 h-4.5" style={{ color: ACCENT }} />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{t.contact.office}</div>
                  <div className="text-[13px] leading-relaxed text-slate-700 whitespace-pre-line">{address}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right — form */}
          <div className="flex-1 w-full">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8">
              <h3 className="font-display font-semibold text-[17px] mb-3" style={{ color: '#201F5E' }}>{t.contact.send}</h3>
              <div className="space-y-4">
                <div>
                  <Label className="text-[12px] font-semibold text-slate-600 mb-1 block">{t.contact.name} *</Label>
                  <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="h-10 text-sm" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[12px] font-semibold text-slate-600 mb-1 block">{t.contact.email} *</Label>
                    <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="h-10 text-sm" />
                  </div>
                  <div>
                    <Label className="text-[12px] font-semibold text-slate-600 mb-1 block">{t.contact.phone} *</Label>
                    <Input type="tel" placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="h-10 text-sm" />
                  </div>
                </div>
                <div>
                  <Label className="text-[12px] font-semibold text-slate-600 mb-1 block">{t.contact.message} *</Label>
                  <Textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} rows={4} className="text-sm resize-none" />
                </div>
                <Button onClick={submit} disabled={submitting} className="w-full text-white h-11 text-sm font-semibold" style={{ background: `linear-gradient(135deg, ${BSV_RED} 0%, #a81b1d 100%)` }}>
                  {submitting ? t.contact.sending : t.contact.sendMessage}
                </Button>
              </div>
            </div>
          </div>

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
              <li><a href="#communication" className="hover:text-white">Brand Advocacy</a></li>
              <li><a href="/impact-stories" className="hover:text-white">{t.nav.stories}</a></li>
              <li><a href="/gallery" className="hover:text-white">{t.nav.gallery}</a></li>
              {/*<li><a href="#resources" className="hover:text-white">{t.nav.resources}</a></li>*/}
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
    <div className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(145deg, #201F5E 0%, #0D3B7A 55%, #0D71B8 100%)' }}>

      {/* Decorative blobs */}
      <div className="absolute top-[-80px] left-[-80px] w-[340px] h-[340px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(222,37,39,0.18) 0%, transparent 70%)' }} />
      <div className="absolute bottom-[-60px] right-[-60px] w-[300px] h-[300px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(14,175,197,0.15) 0%, transparent 70%)' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 65%)' }} />

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 flex flex-col items-center text-center px-8"
      >
        {/* Pulsing ring behind logo */}
        <div className="relative mb-8">
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{ scale: [1, 1.35, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            style={{ background: 'rgba(222,37,39,0.25)', borderRadius: '50%', margin: '-18px' }}
          />
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{ scale: [1, 1.6, 1], opacity: [0.2, 0, 0.2] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
            style={{ background: 'rgba(222,37,39,0.12)', borderRadius: '50%', margin: '-18px' }}
          />
          <motion.img
            src={settings?.branding?.headerLogo}
            alt="BSV × Mankind"
            className="h-20 md:h-24 w-auto relative z-10 drop-shadow-2xl"
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
            draggable={false}
          />
        </div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-white/50 text-[11px] font-semibold uppercase tracking-[0.2em] mb-4"
        >
          {t.common.initiative}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.5 }}
          className="font-display font-bold text-[20px] md:text-[24px] text-white leading-tight"
        >
          Saap Ka Vaar,
        </motion.h1>
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="font-display font-bold text-[20px] md:text-[24px] leading-tight mb-8"
          style={{ color: '#de2527' }}
        >
          Aspataal Mein Hi Upchaar
        </motion.h1>

        {/* Animated loading dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="flex items-center gap-2"
        >
          {[0, 1, 2].map(i => (
            <motion.span
              key={i}
              className="block w-2 h-2 rounded-full"
              style={{ background: '#de2527' }}
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
            />
          ))}
        </motion.div>
      </motion.div>

      {/* Progress bar at bottom */}
      <div className="fixed bottom-0 left-0 right-0 h-[3px] bg-white/10">
        <motion.div
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 3, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="h-full"
          style={{ background: 'linear-gradient(90deg, #de2527 0%, #0EAFC5 100%)' }}
        />
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      <Header lang={lang} setLang={setLang} t={t} settings={settings} />
      <main>
        <Hero content={resolved} t={t} />
        <HeroStatsSection content={resolved} t={t} />
        <MissionSection content={resolved} />
        <VideoSection videos={videos} content={resolved} t={t} />
        <AwarenessSection content={resolved} t={t} />
        <AccessSection content={resolved} t={t} />
        <CommunicationSection content={resolved} t={t} />
        <OutreachSection content={resolved} t={t} />
        {/* <StoriesSection stories={stories} t={t} />
        <GallerySection albums={albums} t={t} /> */}
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
