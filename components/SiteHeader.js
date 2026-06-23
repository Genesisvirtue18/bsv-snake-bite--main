'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LANGUAGES } from '@/lib/translations'
import { motion } from 'framer-motion'
import {
  Globe,
  Menu,
  X,
  Phone,
  ChevronRight,
} from 'lucide-react'

const BRAND = {
  blue: '#201F5E',
  red: '#0EAFC5',
  deep: '#0D71B8',
  navy: '#201F5E',
}

export default function SiteHeader({ lang, setLang, t, settings }) {
  const [open, setOpen] = useState(false)
  const [megaOpen, setMegaOpen] = useState(null)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const go = (href) => {
    setMegaOpen(null)
    setOpen(false)

    if (href.startsWith('#')) {
      window.location.href = '/' + href
    } else {
      window.location.href = href
    }
  }

  const megaMenus = {
    awareness: {
      label: t.nav.awareness,
      groups: [
        {
          title: 'On-Ground Activations',
          items: [
            { label: 'Nukkad Natak, Wall Paintings, Bus Branding', href: '/#awareness', desc: 'Community outreach programs' },
            { label: 'Campaign Moments', href: '/#gallery', desc: 'See campaign in action' },
          ],
        },
        {
          title: 'NGO Collaborations',
          items: [
            { label: 'Partner Network Across India', href: '/ngo-network', desc: 'Our NGO partners' },
            { label: 'Real-life Impact Stories', href: '/#stories', desc: 'Stories from the field' },
          ],
        },
        {
          title: 'Mass & Digital Media',
          items: [
            { label: 'Campaign Films & Interviews', href: '/#video', desc: 'Watch our videos' },
            { label: 'Bust the Myths', href: '/#myths', desc: 'Myth vs Fact' },
          ],
        },
      ],
    },

    access: {
      label: t.nav.access,
      groups: [
        {
          title: 'Workshops & Training',
          items: [
            { label: 'Clinician Training Programs', href: '/#access', desc: 'Hands-on training for clinicians' },
            { label: 'State-wise Campaign Reach', href: '/#outreach', desc: 'Our outreach across India' },
          ],
        },
        {
          title: 'Clinician Engagement',
          items: [
            { label: 'Beyond Monsoons Program', href: '/#access', desc: 'Venom to Vial initiative' },
            { label: 'Field Stories', href: '/#stories', desc: 'Stories from clinicians' },
          ],
        },
        {
          title: 'Training Modules',
          items: [
            { label: 'ASV Protocols', href: '/downloads', desc: 'Clinical education materials' },
            { label: 'Download Library', href: '/downloads', desc: 'All resources in one place' },
          ],
        },
      ],
    },

    communication: {
      label: t.nav.communication,
      groups: [
        {
          title: 'Print Materials',
          items: [
            { label: 'Posters & Brochures', href: '/downloads', desc: 'Multilingual print materials' },
            { label: 'All Downloads', href: '/downloads', desc: 'Complete resource library' },
          ],
        },
        {
          title: 'Video Content',
          items: [
            { label: 'Awareness Videos', href: '/#video', desc: 'Vox pops, myth-busting reels' },
            { label: 'Watch the Campaign', href: '/#video', desc: 'Campaign in action' },
          ],
        },
        {
          title: 'Visual Stories',
          items: [
            { label: 'Comic & Visual Stories', href: '/#gallery', desc: 'Engaging visual content' },
            { label: 'Browse Gallery', href: '/#gallery', desc: 'Photo gallery' },
          ],
        },
      ],
    },
  }

  const menu = [
    { id: 'home', label: t.nav.home, href: '/' },
    { id: 'video', label: t.nav.watch, href: '/#video' },
    { id: 'awareness', label: t.nav.awareness, href: '/#awareness' },
    { id: 'access', label: t.nav.access, href: '/#access' },
    { id: 'communication', label: t.nav.communication, href: '/#communication' },
    { id: 'outreach', label: t.nav.outreach, href: '/#outreach' },
    { id: 'downloads', label: 'All Downloads', href: '/downloads' },
    { id: 'contact', label: t.nav.contact, href: '/#contact' },
  ]

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[9999] bg-white transition-all duration-300 ${
        scrolled ? 'border-b shadow-lg' : 'border-b border-slate-100 shadow-sm'
      }`}
      onMouseLeave={() => setMegaOpen(null)}
    >
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <button
            onClick={() => go('/')}
            className="flex items-center gap-2 sm:gap-3 flex-shrink-0"
          >
            <img
              src={settings?.branding?.bsvLogo}
              alt="BSV"
              className="h-8 sm:h-12 md:h-14 w-auto flex-shrink-0"
              draggable={false}
            />

            <div className="text-[9px] sm:text-[11px] font-semibold leading-snug text-left whitespace-nowrap text-[#201F5E]">
              Saap Ka Vaar,<br />Aspataal Mein Hi Upchaar
            </div>
          </button>

          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 flex-1 justify-center">
            <button onClick={() => go('/')} className="px-3 py-2 text-sm font-medium rounded-lg hover:bg-cyan-50 text-[#201F5E]">
              {t.nav.home}
            </button>

            <button onClick={() => go('/#video')} className="px-3 py-2 text-sm font-medium rounded-lg hover:bg-cyan-50 text-[#201F5E]">
              {t.nav.watch}
            </button>

            {['awareness', 'access', 'communication'].map((key) => (
              <div
                key={key}
                className="relative"
                onMouseEnter={() => setMegaOpen(key)}
              >
                <button
                  className={`px-3 py-2 text-sm font-medium rounded-lg inline-flex items-center gap-1 ${
                    megaOpen === key ? 'bg-cyan-50' : 'hover:bg-cyan-50'
                  }`}
                  style={{ color: megaOpen === key ? BRAND.red : BRAND.blue }}
                >
                  {megaMenus[key].label}
                  <ChevronRight className={`w-3.5 h-3.5 ${megaOpen === key ? 'rotate-90' : ''}`} />
                </button>
              </div>
            ))}

            <button onClick={() => go('/#outreach')} className="px-3 py-2 text-sm font-medium rounded-lg hover:bg-cyan-50 text-[#201F5E]">
              {t.nav.outreach}
            </button>
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 flex-shrink-0">
            <img
              src={settings?.branding?.mankindLogo}
              alt="Mankind"
              className="h-7 sm:h-9 md:h-11 w-auto flex-shrink-0"
              draggable={false}
            />

            <button
              onClick={() => go('/#contact')}
              className="hidden lg:inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white rounded-lg shadow-md"
              style={{ background: BRAND.deep }}
            >
              <Phone className="w-3.5 h-3.5" />
              Contact Us
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 rounded-xl px-2 lg:px-3"
                  style={{ borderColor: BRAND.blue + '40', color: BRAND.blue }}
                >
                  <Globe className="w-4 h-4" />
                  <span className="hidden lg:inline text-sm font-medium">
                    {LANGUAGES.find((l) => l.code === lang)?.native}
                  </span>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="max-h-80 overflow-y-auto rounded-xl z-[9999]">
                {LANGUAGES.map((l) => (
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

            <button
              className="lg:hidden p-2 rounded-xl hover:bg-slate-100"
              onClick={() => setOpen(!open)}
              aria-label="Open menu"
            >
              {open ? <X className="w-5 h-5 text-[#201F5E]" /> : <Menu className="w-5 h-5 text-[#201F5E]" />}
            </button>
          </div>
        </div>

        {megaOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="hidden lg:block absolute left-0 right-0 top-full bg-white border-t shadow-2xl rounded-b-2xl z-[99999]"
          >
            <div className="container mx-auto px-4 py-8">
              <div className="grid grid-cols-4 gap-8">
                <div className="col-span-1 rounded-2xl p-6 text-white" style={{ background: `linear-gradient(145deg, ${BRAND.blue}, ${BRAND.red})` }}>
                  <div className="text-xs uppercase tracking-wider opacity-80 mb-3 font-semibold">
                    {megaMenus[megaOpen].label}
                  </div>

                  <div className="font-display font-bold text-2xl mb-3 leading-tight">
                    {megaOpen === 'awareness'
                      ? 'Creating Informed Communities'
                      : megaOpen === 'access'
                        ? 'Bridging the Gap'
                        : 'Spreading the Message'}
                  </div>

                  <div className="text-sm text-white/85 leading-relaxed">
                    Snakebite awareness and treatment education across India.
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
                          <button
                            onClick={() => go(it.href)}
                            className="w-full text-left group p-2 rounded-xl hover:bg-cyan-50"
                          >
                            <div className="font-display font-semibold text-sm text-[#201F5E] group-hover:text-[#0EAFC5]">
                              {it.label}
                            </div>
                            <div className="text-xs text-slate-400 group-hover:text-slate-600">
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

        {open && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:hidden absolute left-0 right-0 top-full border-t border-white/10 shadow-2xl rounded-b-2xl z-[99999] max-h-[80vh] overflow-y-auto"
            style={{ background: BRAND.blue }}
          >
            <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
              {menu.map((item, i) => (
                <button
                  key={item.id}
                  onClick={() => go(item.href)}
                  className={`w-full text-left py-3.5 px-3 rounded-xl text-sm font-medium text-white hover:bg-white/10 flex items-center justify-between ${
                    i > 0 ? 'border-t border-white/10 mt-1' : ''
                  }`}
                >
                  <span>{item.label}</span>
                  <ChevronRight className="w-4 h-4 text-white/50" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </header>
  )
}