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

const PAGE_TEXT = {
  en: {
    home: 'Home',
    title: 'Posters & Brochures',
    subtitle: 'Browse awareness posters and brochures by language.',
    library: 'Awareness resources in multiple languages',
    selectLanguage: 'Select Language',
    noItems: 'Awareness materials will be available soon',
    noItemsDesc: 'Please check back later for posters and brochures.',
    noResult: 'No materials are available in this language yet',
    noResultDesc: 'Please choose another language or check back later.',
    defaultDescription: 'Download campaign print material.',
    viewDownload: 'View / Download',
    fileNotAdded: 'File Not Added',
  },
  hi: {
    home: 'होम',
    title: 'पोस्टर और ब्रॉशर',
    subtitle: 'भाषा के अनुसार जागरूकता पोस्टर और ब्रॉशर देखें।',
    library: 'कई भाषाओं में जागरूकता सामग्री',
    selectLanguage: 'भाषा चुनें',
    noItems: 'जागरूकता सामग्री जल्द उपलब्ध होगी',
    noItemsDesc: 'पोस्टर और ब्रॉशर के लिए कृपया बाद में फिर देखें।',
    noResult: 'अभी इस भाषा में कोई सामग्री उपलब्ध नहीं है',
    noResultDesc: 'कृपया अन्य भाषा चुनें या बाद में फिर देखें।',
    defaultDescription: 'अभियान की प्रिंट सामग्री डाउनलोड करें।',
    viewDownload: 'देखें / डाउनलोड',
    fileNotAdded: 'फाइल नहीं जोड़ी गई',
  },
  mr: {
    home: 'होम',
    title: 'पोस्टर्स आणि ब्रोशर्स',
    subtitle: 'भाषेनुसार जागरूकता पोस्टर्स आणि ब्रोशर्स पहा.',
    library: 'अनेक भाषांतील जागरूकता सामग्री',
    selectLanguage: 'भाषा निवडा',
    noItems: 'जागरूकता सामग्री लवकरच उपलब्ध होईल',
    noItemsDesc: 'पोस्टर्स आणि ब्रोशर्ससाठी कृपया नंतर पुन्हा पहा.',
    noResult: 'या भाषेत अजून कोणतीही सामग्री उपलब्ध नाही',
    noResultDesc: 'कृपया दुसरी भाषा निवडा किंवा नंतर पुन्हा पहा.',
    defaultDescription: 'कॅम्पेनची प्रिंट सामग्री डाउनलोड करा.',
    viewDownload: 'पहा / डाउनलोड',
    fileNotAdded: 'फाइल जोडलेली नाही',
  },
  ta: {
    home: 'முகப்பு',
    title: 'போஸ்டர்கள் & புரோஷர்கள்',
    subtitle: 'மொழி அடிப்படையில் விழிப்புணர்வு போஸ்டர்கள் மற்றும் புரோஷர்களைப் பாருங்கள்.',
    library: 'பல மொழிகளில் விழிப்புணர்வு பொருட்கள்',
    selectLanguage: 'மொழியைத் தேர்ந்தெடுக்கவும்',
    noItems: 'விழிப்புணர்வு பொருட்கள் விரைவில் கிடைக்கும்',
    noItemsDesc: 'போஸ்டர்கள் மற்றும் புரோஷர்களுக்காக பின்னர் மீண்டும் பார்க்கவும்.',
    noResult: 'இந்த மொழியில் இன்னும் பொருட்கள் இல்லை',
    noResultDesc: 'வேறு மொழியைத் தேர்ந்தெடுக்கவும் அல்லது பின்னர் மீண்டும் பார்க்கவும்.',
    defaultDescription: 'பிரச்சார அச்சு பொருளைப் பதிவிறக்கவும்.',
    viewDownload: 'பார்க்க / பதிவிறக்கு',
    fileNotAdded: 'கோப்பு சேர்க்கப்படவில்லை',
  },
  te: {
    home: 'హోమ్',
    title: 'పోస్టర్లు & బ్రోచర్లు',
    subtitle: 'భాష ఆధారంగా అవగాహన పోస్టర్లు మరియు బ్రోచర్లు చూడండి.',
    library: 'బహుళ భాషల్లో అవగాహన మెటీరియల్స్',
    selectLanguage: 'భాషను ఎంచుకోండి',
    noItems: 'అవగాహన మెటీరియల్స్ త్వరలో అందుబాటులో ఉంటాయి',
    noItemsDesc: 'పోస్టర్లు మరియు బ్రోచర్ల కోసం దయచేసి తర్వాత మళ్లీ చూడండి.',
    noResult: 'ఈ భాషలో ఇంకా మెటీరియల్స్ అందుబాటులో లేవు',
    noResultDesc: 'దయచేసి మరో భాషను ఎంచుకోండి లేదా తర్వాత మళ్లీ చూడండి.',
    defaultDescription: 'క్యాంపెయిన్ ప్రింట్ మెటీరియల్‌ను డౌన్‌లోడ్ చేయండి.',
    viewDownload: 'చూడండి / డౌన్‌లోడ్',
    fileNotAdded: 'ఫైల్ జోడించలేదు',
  },
  kn: {
    home: 'ಮುಖಪುಟ',
    title: 'ಪೋಸ್ಟರ್‌ಗಳು & ಬ್ರೋಶರ್‌ಗಳು',
    subtitle: 'ಭಾಷೆಯ ಪ್ರಕಾರ ಜಾಗೃತಿ ಪೋಸ್ಟರ್‌ಗಳು ಮತ್ತು ಬ್ರೋಶರ್‌ಗಳನ್ನು ನೋಡಿ.',
    library: 'ಬಹು ಭಾಷೆಗಳಲ್ಲಿ ಜಾಗೃತಿ ಸಾಮಗ್ರಿಗಳು',
    selectLanguage: 'ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ',
    noItems: 'ಜಾಗೃತಿ ಸಾಮಗ್ರಿಗಳು ಶೀಘ್ರದಲ್ಲೇ ಲಭ್ಯವಾಗುತ್ತವೆ',
    noItemsDesc: 'ಪೋಸ್ಟರ್‌ಗಳು ಮತ್ತು ಬ್ರೋಶರ್‌ಗಳಿಗಾಗಿ ದಯವಿಟ್ಟು ನಂತರ ಮತ್ತೆ ಪರಿಶೀಲಿಸಿ.',
    noResult: 'ಈ ಭಾಷೆಯಲ್ಲಿ ಇನ್ನೂ ಸಾಮಗ್ರಿಗಳು ಲಭ್ಯವಿಲ್ಲ',
    noResultDesc: 'ದಯವಿಟ್ಟು ಬೇರೆ ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ ಅಥವಾ ನಂತರ ಮತ್ತೆ ಪರಿಶೀಲಿಸಿ.',
    defaultDescription: 'ಕ್ಯಾಂಪೇನ್ ಪ್ರಿಂಟ್ ಮೆಟೀರಿಯಲ್ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ.',
    viewDownload: 'ನೋಡಿ / ಡೌನ್‌ಲೋಡ್',
    fileNotAdded: 'ಫೈಲ್ ಸೇರಿಸಲಾಗಿಲ್ಲ',
  },
  bn: {
    home: 'হোম',
    title: 'পোস্টার ও ব্রোশার',
    subtitle: 'ভাষা অনুযায়ী সচেতনতা পোস্টার ও ব্রোশার দেখুন।',
    library: 'বহু ভাষায় সচেতনতামূলক উপকরণ',
    selectLanguage: 'ভাষা নির্বাচন করুন',
    noItems: 'সচেতনতামূলক উপকরণ শীঘ্রই উপলব্ধ হবে',
    noItemsDesc: 'পোস্টার ও ব্রোশারের জন্য অনুগ্রহ করে পরে আবার দেখুন।',
    noResult: 'এই ভাষায় এখনও কোনো উপকরণ উপলব্ধ নেই',
    noResultDesc: 'অনুগ্রহ করে অন্য ভাষা নির্বাচন করুন বা পরে আবার দেখুন।',
    defaultDescription: 'ক্যাম্পেইনের প্রিন্ট মেটেরিয়াল ডাউনলোড করুন.',
    viewDownload: 'দেখুন / ডাউনলোড',
    fileNotAdded: 'ফাইল যোগ করা হয়নি',
  },
  gu: {
    home: 'હોમ',
    title: 'પોસ્ટર્સ અને બ્રોશર્સ',
    subtitle: 'ભાષા પ્રમાણે જાગૃતિ પોસ્ટર્સ અને બ્રોશર્સ જુઓ.',
    library: 'બહુ ભાષાઓમાં જાગૃતિ સામગ્રી',
    selectLanguage: 'ભાષા પસંદ કરો',
    noItems: 'જાગૃતિ સામગ્રી ટૂંક સમયમાં ઉપલબ્ધ થશે',
    noItemsDesc: 'પોસ્ટર્સ અને બ્રોશર્સ માટે કૃપા કરીને પછી ફરી તપાસો.',
    noResult: 'આ ભાષામાં હજી કોઈ સામગ્રી ઉપલબ્ધ નથી',
    noResultDesc: 'કૃપા કરીને બીજી ભાષા પસંદ કરો અથવા પછી ફરી તપાસો.',
    defaultDescription: 'કેમ્પેઇન પ્રિન્ટ મટિરિયલ ડાઉનલોડ કરો.',
    viewDownload: 'જુઓ / ડાઉનલોડ',
    fileNotAdded: 'ફાઇલ ઉમેરાઈ નથી',
  },
  or: {
    home: 'ହୋମ',
    title: 'ପୋଷ୍ଟର ଏବଂ ବ୍ରୋଶର',
    subtitle: 'ଭାଷା ଅନୁସାରେ ସଚେତନତା ପୋଷ୍ଟର ଏବଂ ବ୍ରୋଶର ଦେଖନ୍ତୁ।',
    library: 'ବହୁ ଭାଷାରେ ସଚେତନତା ସାମଗ୍ରୀ',
    selectLanguage: 'ଭାଷା ବାଛନ୍ତୁ',
    noItems: 'ସଚେତନତା ସାମଗ୍ରୀ ଶୀଘ୍ର ଉପଲବ୍ଧ ହେବ',
    noItemsDesc: 'ପୋଷ୍ଟର ଏବଂ ବ୍ରୋଶର ପାଇଁ ଦୟାକରି ପରେ ପୁଣି ଦେଖନ୍ତୁ।',
    noResult: 'ଏହି ଭାଷାରେ ଏପର୍ଯ୍ୟନ୍ତ କୌଣସି ସାମଗ୍ରୀ ଉପଲବ୍ଧ ନାହିଁ',
    noResultDesc: 'ଦୟାକରି ଅନ୍ୟ ଭାଷା ବାଛନ୍ତୁ କିମ୍ବା ପରେ ପୁଣି ଦେଖନ୍ତୁ।',
    defaultDescription: 'କ୍ୟାମ୍ପେନ୍ ପ୍ରିଣ୍ଟ ସାମଗ୍ରୀ ଡାଉନଲୋଡ୍ କରନ୍ତୁ।',
    viewDownload: 'ଦେଖନ୍ତୁ / ଡାଉନଲୋଡ୍',
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

export default function BrochuresPage() {
  const [content, setContent] = useState(null)
  const [selectedLanguage, setSelectedLanguage] = useState('all')

  useEffect(() => {
    fetch('/api/content')
      .then((r) => r.json())
      .then((d) => setContent(d))
      .catch(() => setContent(null))
  }, [])

  const items = useMemo(() => {
    const saved = Array.isArray(content?.printMaterials)
      ? content.printMaterials
      : []

    return saved
      .filter((item) => item.published !== false)
      .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0))
  }, [content])

  const filteredItems = useMemo(() => {
    if (selectedLanguage === 'all') return items

    return items.filter((item) => {
      const languageCode = getLanguageCode(item.language)
      return languageCode === selectedLanguage
    })
  }, [items, selectedLanguage])

  const activeLang = selectedLanguage === 'all' ? 'en' : selectedLanguage
  const ui = PAGE_TEXT[activeLang] || PAGE_TEXT.en

  const openFile = (item) => {
    const url = item?.fileUrl

    if (!url || url === '#') return

    window.open(url, '_blank', 'noopener,noreferrer')
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
            <div className="font-display font-extrabold text-xl">
              {ui.title}
            </div>
            <div className="text-xs text-white/70">
              {ui.library}
            </div>
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

          <p className="text-slate-600 text-base md:text-lg leading-relaxed">
            {ui.subtitle}
          </p>
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
              <h2 className="font-display font-bold text-xl text-[#09084f]">
                {ui.noItems}
              </h2>
              <p className="text-slate-500 mt-2">
                {ui.noItemsDesc}
              </p>
            </CardContent>
          </Card>
        )}

        {!!items.length && !filteredItems.length && (
          <Card className="max-w-2xl mx-auto border-dashed">
            <CardContent className="p-12 text-center">
              <FileText className="w-16 h-16 mx-auto text-slate-300 mb-4" />
              <h2 className="font-display font-bold text-xl text-[#09084f]">
                {ui.noResult}
              </h2>
              <p className="text-slate-500 mt-2">
                {ui.noResultDesc}
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item, index) => {
            const languageDisplay = getLanguageDisplay(item.language)
            const disabled = !item.fileUrl || item.fileUrl === '#'

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
                        <Badge className="border-0 bg-[#de2527]">
                          {languageDisplay}
                        </Badge>
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <h2 className="font-display font-extrabold text-xl text-[#09084f] line-clamp-2">
                      {item.title || 'Untitled Material'}
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
    </div>
  )
}
