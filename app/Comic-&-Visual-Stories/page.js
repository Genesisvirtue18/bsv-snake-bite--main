'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Languages,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getDocumentPath } from '@/lib/documentPaths'

const LANGUAGE_OPTIONS = [
  { code: 'all', label: 'All' },
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'mr', label: 'मराठी' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'te', label: 'తెలుగు' },
  { code: 'kn', label: 'ಕನ್ನಡ' },
  { code: 'bn', label: 'বাংলা' },
  { code: 'gu', label: 'ગુજરાતી' },
  { code: 'or', label: 'ଓଡ଼ିଆ' },
]

const LANGUAGE_LABEL_MAP = {
  en: 'English',
  hi: 'Hindi',
  mr: 'Marathi',
  ta: 'Tamil',
  te: 'Telugu',
  kn: 'Kannada',
  bn: 'Bengali',
  gu: 'Gujarati',
  or: 'Odia',
}

const INDIAN_STATES = [
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
]

const PAGE_TEXT = {
  en: {
    home: 'Home',
    title: 'Animated Videos & Comics',
    subtitle: 'Browse comics by language.',
    library: 'Comics in multiple languages',
    selectLanguage: 'Select Language',
    noItems: 'Comics will be available soon',
    noItemsDesc: 'Please check back later for comics.',
    noResult: 'No comics are available in this language yet',
    noResultDesc: 'Please choose another language or check back later.',
    defaultDescription: 'Read this comic.',
    viewDownload: 'View / Read',
    fileNotAdded: 'File Not Added',
  },
  hi: {
    home: 'होम',
    title: 'एनिमेटेड वीडियो और कॉमिक्स',
    subtitle: 'भाषा के अनुसार कॉमिक्स देखें।',
    library: 'कई भाषाओं में कॉमिक्स',
    selectLanguage: 'भाषा चुनें',
    noItems: 'कॉमिक्स जल्द उपलब्ध होंगी',
    noItemsDesc: 'कृपया बाद में फिर देखें।',
    noResult: 'इस भाषा में अभी कोई कॉमिक्स उपलब्ध नहीं है',
    noResultDesc: 'कृपया दूसरी भाषा चुनें या बाद में फिर देखें।',
    defaultDescription: 'यह कॉमिक पढ़ें।',
    viewDownload: 'देखें / पढ़ें',
    fileNotAdded: 'फाइल नहीं जोड़ी गई',
  },
  mr: {
    home: 'होम',
    title: 'अ‍ॅनिमेटेड व्हिडिओ आणि कॉमिक्स',
    subtitle: 'भाषेनुसार कॉमिक्स पहा.',
    library: 'अनेक भाषांतील कॉमिक्स',
    selectLanguage: 'भाषा निवडा',
    noItems: 'कॉमिक्स लवकरच उपलब्ध होणार',
    noItemsDesc: 'कृपया नंतर पुन्हा पहा.',
    noResult: 'या भाषेत अजून कॉमिक्स उपलब्ध नाहीत',
    noResultDesc: 'कृपया दुसरी भाषा निवडा किंवा नंतर पुन्हा पहा.',
    defaultDescription: 'ही कॉमिक वाचा.',
    viewDownload: 'पहा / वाचा',
    fileNotAdded: 'फाइल जोडलेली नाही',
  },
  ta: {
    home: 'முகப்பு',
    title: 'அனிமேஷன் வீடியோக்கள் மற்றும் காமிக்ஸ்',
    subtitle: 'மொழி அடிப்படையில் காமிக்ஸைப் பாருங்கள்.',
    library: 'பல மொழிகளில் காமிக்ஸ்',
    selectLanguage: 'மொழியைத் தேர்ந்தெடுக்கவும்',
    noItems: 'காமிக்ஸ் விரைவில் கிடைக்கும்',
    noItemsDesc: 'பின்னர் மீண்டும் பார்க்கவும்.',
    noResult: 'இந்த மொழியில் இன்னும் காமிக்ஸ் இல்லை',
    noResultDesc: 'வேறு மொழியைத் தேர்ந்தெடுக்கவும் அல்லது பின்னர் மீண்டும் பார்க்கவும்.',
    defaultDescription: 'இந்த காமிக்ஸைப் படிக்கவும்.',
    viewDownload: 'பார்க்க / படிக்க',
    fileNotAdded: 'கோப்பு சேர்க்கப்படவில்லை',
  },
  te: {
    home: 'హోమ్',
    title: 'యానిమేటెడ్ వీడియోలు మరియు కామిక్స్',
    subtitle: 'భాష ఆధారంగా కామిక్స్ చూడండి.',
    library: 'బహుళ భాషల్లో కామిక్స్',
    selectLanguage: 'భాషను ఎంచుకోండి',
    noItems: 'కామిక్స్ త్వరలో అందుబాటులో ఉంటాయి',
    noItemsDesc: 'దయచేసి తర్వాత మళ్లీ చూడండి.',
    noResult: 'ఈ భాషలో ఇంకా కామిక్స్ అందుబాటులో లేవు',
    noResultDesc: 'దయచేసి మరో భాషను ఎంచుకోండి లేదా తర్వాత మళ్లీ చూడండి.',
    defaultDescription: 'ఈ కామిక్స్‌ను చదవండి.',
    viewDownload: 'చూడండి / చదవండి',
    fileNotAdded: 'ఫైల్ జోడించలేదు',
  },
  kn: {
    home: 'ಮುಖಪುಟ',
    title: 'ಅನಿಮೇಟೆಡ್ ವೀಡಿಯೊಗಳು ಮತ್ತು ಕಾಮಿಕ್ಸ್',
    subtitle: 'ಭಾಷೆಯ ಪ್ರಕಾರ ಕಾಮಿಕ್ಸ್‌ಗಳನ್ನು ನೋಡಿ.',
    library: 'ಬಹು ಭಾಷೆಗಳಲ್ಲಿ ಕಾಮಿಕ್ಸ್‌ಗಳು',
    selectLanguage: 'ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ',
    noItems: 'ಕಾಮಿಕ್ಸ್‌ಗಳು ಶೀಘ್ರದಲ್ಲೇ ಲಭ್ಯವಾಗುತ್ತವೆ',
    noItemsDesc: 'ದಯವಿಟ್ಟು ನಂತರ ಮತ್ತೆ ಪರಿಶೀಲಿಸಿ.',
    noResult: 'ಈ ಭಾಷೆಯಲ್ಲಿ ಇನ್ನೂ ಕಾಮಿಕ್ಸ್‌ಗಳು ಲಭ್ಯವಿಲ್ಲ',
    noResultDesc: 'ದಯವಿಟ್ಟು ಬೇರೆ ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ ಅಥವಾ ನಂತರ ಮತ್ತೆ ಪರಿಶೀಲಿಸಿ.',
    defaultDescription: 'ಈ ಕಾಮಿಕ್ಸ್‌ ಓದಿರಿ.',
    viewDownload: 'ನೋಡಿ / ಓದಿ',
    fileNotAdded: 'ಫೈಲ್ ಸೇರಿಸಲಾಗಿಲ್ಲ',
  },
  bn: {
    home: 'হোম',
    title: 'অ্যানিমেটেড ভিডিও এবং কমিক্স',
    subtitle: 'ভাষা অনুযায়ী কমিক্স দেখুন।',
    library: 'বহু ভাষায় কমিক্স',
    selectLanguage: 'ভাষা নির্বাচন করুন',
    noItems: 'কমিক্স শীঘ্রই উপলব্ধ হবে',
    noItemsDesc: 'অনুগ্রহ করে পরে আবার দেখুন।',
    noResult: 'এই ভাষায় এখনও কোনো কমিক্স উপলব্ধ নেই',
    noResultDesc: 'অনুগ্রহ করে অন্য ভাষা নির্বাচন করুন বা পরে আবার দেখুন।',
    defaultDescription: 'এই কমিক্সটি পড়ুন।',
    viewDownload: 'দেখুন / পড়ুন',
    fileNotAdded: 'ফাইল যোগ করা হয়নি',
  },
  gu: {
    home: 'હોમ',
    title: 'એનિમેટેડ વિડિઓઝ અને કોમિક્સ',
    subtitle: 'ભાષા પ્રમાણે કોમિક્સ જુઓ.',
    library: 'બહુ ભાષાઓમાં કોમિક્સ',
    selectLanguage: 'ભાષા પસંદ કરો',
    noItems: 'કોમિક્સ ટૂંક સમયમાં ઉપલબ્ધ થશે',
    noItemsDesc: 'કૃપા કરીને પછી ફરી તપાસો.',
    noResult: 'આ ભાષામાં હજી કોમિક્સ ઉપલબ્ધ નથી',
    noResultDesc: 'કૃપા કરીને બીજી ભાષા પસંદ કરો અથવા પછી ફરી તપાસો.',
    defaultDescription: 'આ કોमिक વાંચો.',
    viewDownload: 'જુઓ / વાંચો',
    fileNotAdded: 'ફાઇલ ઉમેરાઈ નથી',
  },
  or: {
    home: 'ହୋମ',
    title: 'ଆନିମେଟେଡ୍ ଭିଡିଓ ଏବଂ କମିକ୍ସ',
    subtitle: 'ଭାଷା ଅନୁସାରେ କମିକ୍ସ ଦେଖନ୍ତୁ।',
    library: 'ବହୁ ଭାଷାରେ କମିକ୍ସ',
    selectLanguage: 'ଭାଷା ବାଛନ୍ତୁ',
    noItems: 'କମିକ୍ସ ଶୀଘ୍ର ଉପଲବ୍ଧ ହେବ',
    noItemsDesc: 'ଦୟାକରି ପରେ ପୁଣି ଦେଖନ୍ତୁ।',
    noResult: 'ଏହି ଭାଷାରେ ଏପର୍ଯ୍ୟନ୍ତ କମିକ୍ସ ଉପଲବ୍ଧ ନାହିଁ',
    noResultDesc: 'ଦୟାକରି ଅନ୍ୟ ଭାଷା ବାଛନ୍ତୁ କିମ୍ବା ପରେ ପୁଣି ଦେଖନ୍ତୁ।',
    defaultDescription: 'ଏହି କମିକ୍ସ ପଢ଼ନ୍ତୁ।',
    viewDownload: 'ଦେଖନ୍ତୁ / ପଢ଼ନ୍ତୁ',
    fileNotAdded: 'ଫାଇଲ୍ ଯୋଡାଯାଇନାହିଁ',
  },
}

function getLanguageCode(value) {
  const raw = String(value || '').toLowerCase().trim()

  if (!raw) return ''

  const matched = LANGUAGE_OPTIONS.find((language) => {
    const code = String(language.code || '').toLowerCase()
    const label = String(language.label || '').toLowerCase()
    const englishLabel = String(LANGUAGE_LABEL_MAP[language.code] || '').toLowerCase()

    return raw === code || raw === label || raw === englishLabel
  })

  return matched?.code || raw
}

function getLanguageDisplay(value) {
  const code = getLanguageCode(value)

  if (!code || code === 'all') return ''

  return LANGUAGE_LABEL_MAP[code] || value
}

export default function ComicsPage() {
  const [content, setContent] = useState(null)
  const [selectedLanguage, setSelectedLanguage] = useState('all')
  const [selectedMaterial, setSelectedMaterial] = useState(null)
  const [leadSubmitting, setLeadSubmitting] = useState(false)
  const [leadForm, setLeadForm] = useState({
    name: '',
    phone: '',
    email: '',
    state: '',
    profession: '',
  })

  useEffect(() => {
    fetch('/api/content')
      .then((response) => response.json())
      .then((data) => setContent(data))
      .catch(() => setContent(null))
  }, [])

  const items = useMemo(() => {
    const saved = Array.isArray(content?.comics) ? content.comics : []
    return saved.filter((item) => item.published !== false)
  }, [content])

  const filteredItems = useMemo(() => {
    if (selectedLanguage === 'all') return items

    return items.filter((item) => {
      const languageCode = getLanguageCode(item.language)
      return languageCode === selectedLanguage
    })
  }, [items, selectedLanguage])

  const activeLang = selectedLanguage === 'all' ? 'en' : selectedLanguage
  const baseUi = PAGE_TEXT[activeLang] || PAGE_TEXT.en
  const header = content?.pageHeaders?.animatedVideosComics || {}
  const ui = {
    ...baseUi,
    title: header.title || baseUi.title,
    subtitle: header.description || baseUi.subtitle,
  }

  const getFileUrl = (item) => (item?.file?.id ? getDocumentPath('communication', item.file.id) : '')

  const openFile = (item) => {
    const url = getFileUrl(item)

    if (!url || url === '#') return

    if (content?.brochureLeadFormEnabled) {
      setSelectedMaterial(item)
      return
    }

    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const submitLeadForm = async () => {
    const fileUrl = getFileUrl(selectedMaterial)

    if (!fileUrl) return

    if (
      !leadForm.name.trim() ||
      !leadForm.phone.trim() ||
      !leadForm.email.trim() ||
      !leadForm.state.trim() ||
      !leadForm.profession.trim()
    ) {
      alert('Please fill all fields.')
      return
    }

    setLeadSubmitting(true)

    try {
      const response = await fetch('/api/brochure-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...leadForm,
          brochureId: selectedMaterial.id || '',
          brochureTitle: selectedMaterial.title || '',
          brochureUrl: fileUrl,
          language: selectedMaterial.language || '',
        }),
      })

      if (!response.ok) {
        alert('Something went wrong. Please try again.')
        return
      }

      window.open(fileUrl, '_blank', 'noopener,noreferrer')
      setSelectedMaterial(null)
      setLeadForm({
        name: '',
        phone: '',
        email: '',
        state: '',
        profession: '',
      })
    } catch (error) {
      alert('Something went wrong. Please try again.')
    } finally {
      setLeadSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#f8f9ff] to-[#eef3ff]">
      <header className="bg-bsv-blue text-white py-4">
        <div className="container mx-auto px-4 flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" className="text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-1" />
              {ui.home}
            </Button>
          </Link>

          <div>
            <div className="font-display font-extrabold text-xl">{ui.title}</div>
            <div className="text-xs text-white/70">{ui.library}</div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-14">
        <section className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white shadow mb-5">
            <FileText className="w-8 h-8 text-[#201F5E]" />
          </div>

          <h1 className="font-display text-[38px] md:text-[58px] font-extrabold leading-tight text-[#09084f]">
            {ui.title}
          </h1>

          <div className="mx-auto mt-4 mb-6 flex items-center justify-center gap-2">
            <span className="h-[3px] w-16 rounded-full bg-[#5b4af2]" />
            <span className="h-2 w-2 rounded-full bg-[#5b4af2]" />
            <span className="h-[3px] w-16 rounded-full bg-[#201F5E]" />
          </div>

          <p className="text-slate-600 text-base md:text-lg leading-relaxed">{ui.subtitle}</p>
        </section>

        <div className="mb-10">
          <div className="flex items-center justify-center gap-3 mb-5">
            <span className="hidden md:block h-px w-20 bg-[#5b4af2]" />
            <span className="hidden md:block h-2 w-2 rounded-full bg-[#5b4af2]" />

            <div className="flex items-center gap-2 font-display font-bold text-[#09084f] text-lg md:text-xl">
              <Languages className="w-5 h-5" />
              {ui.selectLanguage}
            </div>

            <span className="hidden md:block h-2 w-2 rounded-full bg-[#5b4af2]" />
            <span className="hidden md:block h-px w-20 bg-[#5b4af2]" />
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {LANGUAGE_OPTIONS.map((language) => (
              <button
                key={language.code}
                type="button"
                onClick={() => setSelectedLanguage(language.code)}
                className={[
                  'min-w-[115px] rounded-xl border px-5 py-3 text-sm md:text-base font-semibold transition-all',
                  selectedLanguage === language.code
                    ? 'border-[#201F8F] bg-[#201F8F] text-white shadow-lg shadow-[#201F8F]/20'
                    : 'border-[#d8def0] bg-white/80 text-[#09084f] hover:border-[#201F8F] hover:bg-white',
                ].join(' ')}
              >
                {language.label}
              </button>
            ))}
          </div>
        </div>

        {!items.length && (
          <Card className="max-w-2xl mx-auto border-dashed">
            <CardContent className="p-12 text-center">
              <FileText className="w-16 h-16 mx-auto text-slate-300 mb-4" />
              <h2 className="font-display font-bold text-xl text-[#09084f]">{ui.noItems}</h2>
              <p className="text-slate-500 mt-2">{ui.noItemsDesc}</p>
            </CardContent>
          </Card>
        )}

        {!!items.length && !filteredItems.length && (
          <Card className="max-w-2xl mx-auto border-dashed">
            <CardContent className="p-12 text-center">
              <FileText className="w-16 h-16 mx-auto text-slate-300 mb-4" />
              <h2 className="font-display font-bold text-xl text-[#09084f]">{ui.noResult}</h2>
              <p className="text-slate-500 mt-2">{ui.noResultDesc}</p>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item, index) => {
            const languageDisplay = getLanguageDisplay(item.language)
            const disabled = !getFileUrl(item) || getFileUrl(item) === '#'

            return (
              <Card
                key={item.id || index}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
              >
                <CardContent className="p-0">
                  <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.title || ui.title}
                        className="w-full h-full object-cover transition duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <ImageIcon className="w-16 h-16" />
                      </div>
                    )}

                    {!!languageDisplay && (
                      <div className="absolute left-3 top-3 flex gap-2 flex-wrap">
                        <Badge className="border-0 bg-[#de2527]">{languageDisplay}</Badge>
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <h2 className="font-display font-extrabold text-xl text-[#09084f] line-clamp-2">
                      {item.title || 'Untitled Comic'}
                    </h2>

                    <p className="text-sm text-slate-600 leading-relaxed mt-3 min-h-[64px] line-clamp-3">
                      {item.description || ui.defaultDescription}
                    </p>

                    {disabled ? (
                      <Button
                        disabled
                        className="mt-5 w-full h-11 rounded-lg bg-slate-300 text-white font-bold disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        {ui.fileNotAdded}
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        onClick={() => openFile(item)}
                        className="mt-5 w-full h-11 rounded-lg bg-gradient-to-r from-[#de2527] to-[#a81b1d] text-white font-bold"
                      >
                        {ui.viewDownload}
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </main>

      <Dialog
        open={!!selectedMaterial}
        onOpenChange={(open) => {
          if (!open) setSelectedMaterial(null)
        }}
      >
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl text-[#09084f]">Download Comic</DialogTitle>
            <DialogDescription>Please fill in your details to access the comic.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input
                value={leadForm.name}
                onChange={(event) => setLeadForm({ ...leadForm, name: event.target.value })}
                placeholder="Enter your name"
              />
            </div>

            <div>
              <Label>Phone Number</Label>
              <Input
                value={leadForm.phone}
                onChange={(event) => setLeadForm({ ...leadForm, phone: event.target.value })}
                placeholder="Enter your phone number"
              />
            </div>

            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={leadForm.email}
                onChange={(event) => setLeadForm({ ...leadForm, email: event.target.value })}
                placeholder="Enter your email"
              />
            </div>

            <div>
              <Label>State</Label>
              <Select
                value={leadForm.state}
                onValueChange={(value) => setLeadForm({ ...leadForm, state: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your state" />
                </SelectTrigger>

                <SelectContent className="max-h-72">
                  {INDIAN_STATES.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Profession</Label>
              <Input
                value={leadForm.profession}
                onChange={(event) => setLeadForm({ ...leadForm, profession: event.target.value })}
                placeholder="Enter your profession"
              />
            </div>

            <Button
              type="button"
              disabled={leadSubmitting}
              onClick={submitLeadForm}
              className="w-full h-11 rounded-lg bg-gradient-to-r from-[#de2527] to-[#a81b1d] text-white font-bold"
            >
              {leadSubmitting ? 'Submitting...' : 'Submit & Read'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
