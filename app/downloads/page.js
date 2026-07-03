'use client'

import { useEffect, useMemo, useState } from 'react'
import { DEFAULT_CONTENT } from '@/lib/defaultContent'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, BookOpen, Download, ExternalLink, FileText, Languages, Play } from 'lucide-react'
import Link from 'next/link'

const LANGUAGE_OPTIONS = [
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

const DEFAULT_DOWNLOAD_MATERIALS = [
    {
        id: 'animated-videos',
        title: 'Animated Videos',
        type: 'videos',
        description: 'Short awareness videos that educate and spread life-saving information.',
        image: '',
        buttonText: 'Watch Videos',
        links: {
            en: '',
            hi: '',
            mr: '',
            ta: '',
            te: '',
            kn: '',
            bn: '',
            gu: '',
            or: '',
        },
    },
    {
        id: 'comics',
        title: 'Comics',
        type: 'comics',
        description: 'Informative comics for all age groups to understand snakebite prevention and care.',
        image: '',
        buttonText: 'Download Comics',
        links: {
            en: '',
            hi: '',
            mr: '',
            ta: '',
            te: '',
            kn: '',
            bn: '',
            gu: '',
            or: '',
        },
    },
    {
        id: 'brochure',
        title: 'Our Brochure',
        type: 'brochure',
        description: 'Detailed brochure on snakebite awareness, first-aid and treatment information.',
        image: '',
        buttonText: 'Download Brochure',
        links: {
            en: '',
            hi: '',
            mr: '',
            ta: '',
            te: '',
            kn: '',
            bn: '',
            gu: '',
            or: '',
        },
    },
]

const PAGE_TEXT = {
    en: {
        home: 'Home',
        downloads: 'Downloads',
        resourceLibrary: 'Resource library',
        title: 'Resource Library',
        subtitle: 'Download animated videos, comics, and our brochure\nin your preferred language.',
        chooseLanguage: 'Choose Language',
        missingLink: 'link not added yet',
    },
    hi: {
        home: 'होम',
        downloads: 'डाउनलोड्स',
        resourceLibrary: 'संसाधन लाइब्रेरी',
        title: 'संसाधन लाइब्रेरी',
        subtitle: 'एनिमेटेड वीडियो, कॉमिक्स और हमारी ब्रॉशर\nअपनी पसंदीदा भाषा में डाउनलोड करें।',
        chooseLanguage: 'भाषा चुनें',
        missingLink: 'लिंक अभी नहीं जोड़ा गया है',
    },
    mr: {
        home: 'होम',
        downloads: 'डाउनलोड्स',
        resourceLibrary: 'संसाधन लायब्ररी',
        title: 'संसाधन लायब्ररी',
        subtitle: 'अ‍ॅनिमेटेड व्हिडिओ, कॉमिक्स आणि आमचे ब्रोशर\nआपल्या पसंतीच्या भाषेत डाउनलोड करा.',
        chooseLanguage: 'भाषा निवडा',
        missingLink: 'लिंक अजून जोडलेली नाही',
    },
    ta: {
        home: 'முகப்பு',
        downloads: 'பதிவிறக்கங்கள்',
        resourceLibrary: 'வள நூலகம்',
        title: 'வள நூலகம்',
        subtitle: 'அனிமேஷன் வீடியோக்கள், காமிக்ஸ் மற்றும் எங்கள் புரோஷரை\nஉங்கள் விருப்ப மொழியில் பதிவிறக்குங்கள்.',
        chooseLanguage: 'மொழியைத் தேர்ந்தெடுக்கவும்',
        missingLink: 'இணைப்பு இன்னும் சேர்க்கப்படவில்லை',
    },
    te: {
        home: 'హోమ్',
        downloads: 'డౌన్‌లోడ్స్',
        resourceLibrary: 'వనరుల లైబ్రరీ',
        title: 'వనరుల లైబ్రరీ',
        subtitle: 'యానిమేటెడ్ వీడియోలు, కామిక్స్ మరియు మా బ్రోచర్‌ను\nమీకు ఇష్టమైన భాషలో డౌన్‌లోడ్ చేసుకోండి.',
        chooseLanguage: 'భాషను ఎంచుకోండి',
        missingLink: 'లింక్ ఇంకా జోడించలేదు',
    },
    kn: {
        home: 'ಮುಖಪುಟ',
        downloads: 'ಡೌನ್‌ಲೋಡ್‌ಗಳು',
        resourceLibrary: 'ಸಂಪನ್ಮೂಲ ಗ್ರಂಥಾಲಯ',
        title: 'ಸಂಪನ್ಮೂಲ ಗ್ರಂಥಾಲಯ',
        subtitle: 'ಅನಿಮೇಟೆಡ್ ವೀಡಿಯೊಗಳು, ಕಾಮಿಕ್ಸ್ ಮತ್ತು ನಮ್ಮ ಬ್ರೋಶರ್ ಅನ್ನು\nನಿಮ್ಮ ಇಷ್ಟದ ಭಾಷೆಯಲ್ಲಿ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ.',
        chooseLanguage: 'ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ',
        missingLink: 'ಲಿಂಕ್ ಇನ್ನೂ ಸೇರಿಸಲಾಗಿಲ್ಲ',
    },
    bn: {
        home: 'হোম',
        downloads: 'ডাউনলোডস',
        resourceLibrary: 'রিসোর্স লাইব্রেরি',
        title: 'রিসোর্স লাইব্রেরি',
        subtitle: 'অ্যানিমেটেড ভিডিও, কমিক্স এবং আমাদের ব্রোশার\nআপনার পছন্দের ভাষায় ডাউনলোড করুন।',
        chooseLanguage: 'ভাষা নির্বাচন করুন',
        missingLink: 'লিংক এখনও যোগ করা হয়নি',
    },
    gu: {
        home: 'હોમ',
        downloads: 'ડાઉનલોડ્સ',
        resourceLibrary: 'સંસાધન લાઇબ્રેરી',
        title: 'સંસાધન લાઇબ્રેરી',
        subtitle: 'એનિમેટેડ વિડિઓઝ, કોમિક્સ અને અમારી બ્રોશર\nતમારી પસંદગીની ભાષામાં ડાઉનલોડ કરો.',
        chooseLanguage: 'ભાષા પસંદ કરો',
        missingLink: 'લિંક હજી ઉમેરાઈ નથી',
    },
    or: {
        home: 'ହୋମ',
        downloads: 'ଡାଉନଲୋଡ୍ସ',
        resourceLibrary: 'ସମ୍ବଳ ଲାଇବ୍ରେରୀ',
        title: 'ସମ୍ବଳ ଲାଇବ୍ରେରୀ',
        subtitle: 'ଆନିମେଟେଡ୍ ଭିଡିଓ, କମିକ୍ସ ଏବଂ ଆମ ବ୍ରୋଶରକୁ\nଆପଣଙ୍କ ପସନ୍ଦର ଭାଷାରେ ଡାଉନଲୋଡ୍ କରନ୍ତୁ।',
        chooseLanguage: 'ଭାଷା ବାଛନ୍ତୁ',
        missingLink: 'ଲିଙ୍କ ଏପର୍ଯ୍ୟନ୍ତ ଯୋଡାଯାଇନାହିଁ',
    },
}

const MATERIAL_TEXT = {
    'animated-videos': {
        en: {
            title: 'Animated Videos',
            description: 'Short awareness videos that educate and spread life-saving information.',
            buttonText: 'Watch Videos',
        },
        hi: {
            title: 'एनिमेटेड वीडियो',
            description: 'जागरूकता बढ़ाने वाले छोटे वीडियो जो जीवन बचाने वाली जानकारी देते हैं।',
            buttonText: 'वीडियो देखें',
        },
        mr: {
            title: 'अ‍ॅनिमेटेड व्हिडिओ',
            description: 'जागरूकता वाढवणारे छोटे व्हिडिओ जे जीवनरक्षक माहिती देतात.',
            buttonText: 'व्हिडिओ पहा',
        },
        ta: {
            title: 'அனிமேஷன் வீடியோக்கள்',
            description: 'உயிர் காக்கும் தகவலை எளிதாக விளக்கும் குறும் விழிப்புணர்வு வீடியோக்கள்.',
            buttonText: 'வீடியோக்களைப் பார்க்கவும்',
        },
        te: {
            title: 'యానిమేటెడ్ వీడియోలు',
            description: 'ప్రాణాలను కాపాడే సమాచారాన్ని అందించే చిన్న అవగాహన వీడియోలు.',
            buttonText: 'వీడియోలు చూడండి',
        },
        kn: {
            title: 'ಅನಿಮೇಟೆಡ್ ವೀಡಿಯೊಗಳು',
            description: 'ಜೀವ ಉಳಿಸುವ ಮಾಹಿತಿಯನ್ನು ತಿಳಿಸುವ ಚಿಕ್ಕ ಜಾಗೃತಿ ವೀಡಿಯೊಗಳು.',
            buttonText: 'ವೀಡಿಯೊಗಳನ್ನು ನೋಡಿ',
        },
        bn: {
            title: 'অ্যানিমেটেড ভিডিও',
            description: 'জীবনরক্ষাকারী তথ্য ছড়িয়ে দেওয়ার জন্য ছোট সচেতনতামূলক ভিডিও।',
            buttonText: 'ভিডিও দেখুন',
        },
        gu: {
            title: 'એનિમેટેડ વિડિઓઝ',
            description: 'જીવન બચાવતી માહિતી આપતા ટૂંકા જાગૃતિ વિડિઓઝ.',
            buttonText: 'વિડિઓ જુઓ',
        },
        or: {
            title: 'ଆନିମେଟେଡ୍ ଭିଡିଓ',
            description: 'ଜୀବନ ରକ୍ଷାକାରୀ ସୂଚନା ଦେଉଥିବା ଛୋଟ ସଚେତନତା ଭିଡିଓ।',
            buttonText: 'ଭିଡିଓ ଦେଖନ୍ତୁ',
        },
    },

    comics: {
        en: {
            title: 'Comics',
            description: 'Informative comics for all age groups to understand snakebite prevention and care.',
            buttonText: 'Download Comics',
        },
        hi: {
            title: 'कॉमिक्स',
            description: 'सांप के काटने से बचाव और देखभाल समझाने वाली आसान कॉमिक्स।',
            buttonText: 'कॉमिक्स डाउनलोड करें',
        },
        mr: {
            title: 'कॉमिक्स',
            description: 'सर्पदंश प्रतिबंध आणि काळजी समजण्यासाठी सर्व वयोगटांसाठी माहितीपूर्ण कॉमिक्स.',
            buttonText: 'कॉमिक्स डाउनलोड करा',
        },
        ta: {
            title: 'காமிக்ஸ்',
            description: 'பாம்பு கடி தடுப்பு மற்றும் பராமரிப்பை எளிதாக விளக்கும் தகவல் காமிக்ஸ்.',
            buttonText: 'காமிக்ஸ் பதிவிறக்கவும்',
        },
        te: {
            title: 'కామిక్స్',
            description: 'పాము కాటు నివారణ మరియు సంరక్షణను అర్థం చేసుకునేందుకు సమాచారాత్మక కామిక్స్.',
            buttonText: 'కామిక్స్ డౌన్‌లోడ్ చేయండి',
        },
        kn: {
            title: 'ಕಾಮಿಕ್ಸ್',
            description: 'ಹಾವು ಕಚ್ಚುವಿಕೆ ತಡೆಗಟ್ಟುವಿಕೆ ಮತ್ತು ಆರೈಕೆಯನ್ನು ತಿಳಿಸುವ ಮಾಹಿತಿ ಕಾಮಿಕ್ಸ್.',
            buttonText: 'ಕಾಮಿಕ್ಸ್ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ',
        },
        bn: {
            title: 'কমিক্স',
            description: 'সাপের কামড় প্রতিরোধ ও যত্ন বোঝাতে সব বয়সের জন্য তথ্যপূর্ণ কমিক্স।',
            buttonText: 'কমিক্স ডাউনলোড করুন',
        },
        gu: {
            title: 'કોમિક્સ',
            description: 'સર્પદંશથી બચાવ અને કાળજી સમજવા માટે માહિતીપ્રદ કોમિક્સ.',
            buttonText: 'કોમિક્સ ડાઉનલોડ કરો',
        },
        or: {
            title: 'କମିକ୍ସ',
            description: 'ସାପ କାମୁଡ଼ା ପ୍ରତିରୋଧ ଏବଂ ଯତ୍ନ ବୁଝାଇବା ପାଇଁ ସୂଚନାମୂଳକ କମିକ୍ସ।',
            buttonText: 'କମିକ୍ସ ଡାଉନଲୋଡ୍ କରନ୍ତୁ',
        },
    },

    brochure: {
        en: {
            title: 'Our Brochure',
            description: 'Detailed brochure on snakebite awareness, first-aid and treatment information.',
            buttonText: 'Download Brochure',
        },
        hi: {
            title: 'हमारी ब्रॉशर',
            description: 'सांप के काटने की जागरूकता, प्राथमिक उपचार और इलाज की जानकारी वाली ब्रॉशर।',
            buttonText: 'ब्रॉशर डाउनलोड करें',
        },
        mr: {
            title: 'आमचे ब्रोशर',
            description: 'सर्पदंश जागरूकता, प्राथमिक उपचार आणि उपचार माहिती असलेले सविस्तर ब्रोशर.',
            buttonText: 'ब्रोशर डाउनलोड करा',
        },
        ta: {
            title: 'எங்கள் புரோஷர்',
            description: 'பாம்பு கடி விழிப்புணர்வு, முதலுதவி மற்றும் சிகிச்சை தகவல்கள் கொண்ட விரிவான புரோஷர்.',
            buttonText: 'புரோஷர் பதிவிறக்கவும்',
        },
        te: {
            title: 'మా బ్రోచర్',
            description: 'పాము కాటు అవగాహన, ప్రథమ చికిత్స మరియు చికిత్స సమాచారంతో కూడిన బ్రోచర్.',
            buttonText: 'బ్రోచర్ డౌన్‌లోడ్ చేయండి',
        },
        kn: {
            title: 'ನಮ್ಮ ಬ್ರೋಶರ್',
            description: 'ಹಾವು ಕಚ್ಚುವಿಕೆ ಜಾಗೃತಿ, ಪ್ರಥಮ ಚಿಕಿತ್ಸೆ ಮತ್ತು ಚಿಕಿತ್ಸೆ ಮಾಹಿತಿಯಿರುವ ವಿವರವಾದ ಬ್ರೋಶರ್.',
            buttonText: 'ಬ್ರೋಶರ್ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ',
        },
        bn: {
            title: 'আমাদের ব্রোশার',
            description: 'সাপের কামড় সম্পর্কে সচেতনতা, প্রাথমিক চিকিৎসা ও চিকিৎসা তথ্যসহ বিস্তারিত ব্রোশার।',
            buttonText: 'ব্রোশার ডাউনলোড করুন',
        },
        gu: {
            title: 'અમારી બ્રોશર',
            description: 'સર્પદંશ જાગૃતિ, પ્રાથમિક સારવાર અને સારવારની માહિતી ધરાવતી વિગતવાર બ્રોશર.',
            buttonText: 'બ્રોશર ડાઉનલોડ કરો',
        },
        or: {
            title: 'ଆମ ବ୍ରୋଶର',
            description: 'ସାପ କାମୁଡ଼ା ସଚେତନତା, ପ୍ରଥମିକ ଚିକିତ୍ସା ଏବଂ ଚିକିତ୍ସା ସୂଚନା ଥିବା ବିସ୍ତୃତ ବ୍ରୋଶର।',
            buttonText: 'ବ୍ରୋଶର ଡାଉନଲୋଡ୍ କରନ୍ତୁ',
        },
    },
}

function getIcon(type) {
    if (type === 'videos') return Play
    if (type === 'comics') return BookOpen
    return FileText
}

function getAccent(type) {
    if (type === 'videos') return 'from-[#3f37c9] to-[#201F5E]'
    if (type === 'comics') return 'from-[#2f8f2f] to-[#217221]'
    return 'from-[#ff6b22] to-[#e84b12]'
}

export default function DownloadsPage() {
    const [lang, setLang] = useState('en')
    const [content, setContent] = useState(null)

    useEffect(() => {
        fetch('/api/content')
            .then((r) => r.json())
            .then((d) => setContent(d))
            .catch(console.error)
    }, [])

    const materials = useMemo(() => {
        const saved = content?.downloadMaterials

        if (Array.isArray(saved) && saved.length) {
            return DEFAULT_DOWNLOAD_MATERIALS.map((item) => {
                const found = saved.find((m) => m.id === item.id)
                return {
                    ...item,
                    ...(found || {}),
                    links: {
                        ...(item.links || {}),
                        ...(found?.links || {}),
                    },
                }
            })
        }

        return DEFAULT_DOWNLOAD_MATERIALS
    }, [content])

    const selectedLanguage = LANGUAGE_OPTIONS.find((l) => l.code === lang)?.label || 'English'
    const ui = PAGE_TEXT[lang] || PAGE_TEXT.en

    return (
        <>
            <header className="bg-bsv-blue text-white py-4">
                <div className="container mx-auto px-4 flex items-center gap-3">
                    <Link href="/">
                        <Button variant="ghost" className="text-white hover:bg-white/10">
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            {ui.home}
                        </Button>
                    </Link>

                    <div>
                        <div className="font-display font-extrabold text-xl">{ui.downloads}</div>
                        <div className="text-xs text-white/70">{ui.resourceLibrary}</div>
                    </div>
                </div>
            </header>

            <main className="min-h-screen overflow-hidden bg-gradient-to-br from-white via-[#f8f9ff] to-[#eef3ff] pt-16 pb-20">
                <section className="container mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-12">
                        <h1 className="font-display text-[42px] md:text-[58px] font-extrabold leading-tight text-[#09084f]">
                            {ui.title}
                        </h1>

                        <div className="mx-auto mt-4 mb-6 flex items-center justify-center gap-2">
                            <span className="h-[3px] w-16 rounded-full bg-[#5b4af2]" />
                            <span className="h-2 w-2 rounded-full bg-[#5b4af2]" />
                        </div>

                        <p className="text-slate-600 text-base md:text-xl leading-relaxed whitespace-pre-line">
                            {ui.subtitle}
                        </p>
                    </div>

                    <div className="mb-9">
                        <div className="flex items-center justify-center gap-3 mb-5">
                            <span className="hidden md:block h-px w-20 bg-[#5b4af2]" />
                            <span className="hidden md:block h-2 w-2 rounded-full bg-[#5b4af2]" />

                            <div className="flex items-center gap-2 font-display font-bold text-[#09084f] text-lg md:text-xl">
                                <Languages className="w-5 h-5" />
                                {ui.chooseLanguage}
                            </div>

                            <span className="hidden md:block h-2 w-2 rounded-full bg-[#5b4af2]" />
                            <span className="hidden md:block h-px w-20 bg-[#5b4af2]" />
                        </div>

                        <div className="flex flex-wrap justify-center gap-3">
                            {LANGUAGE_OPTIONS.map((language) => (
                                <button
                                    key={language.code}
                                    type="button"
                                    onClick={() => setLang(language.code)}
                                    className={[
                                        'min-w-[115px] rounded-xl border px-5 py-3 text-sm md:text-base font-semibold transition-all',
                                        lang === language.code
                                            ? 'border-[#201F8F] bg-[#201F8F] text-white shadow-lg shadow-[#201F8F]/20'
                                            : 'border-[#d8def0] bg-white/80 text-[#09084f] hover:border-[#201F8F] hover:bg-white',
                                    ].join(' ')}
                                >
                                    {language.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
                        {materials.map((item) => {
                            const translated = MATERIAL_TEXT[item.id]?.[lang] || MATERIAL_TEXT[item.id]?.en || {}
                            const Icon = getIcon(item.type)
                            const link = item.links?.[lang] || ''
                            const accent = getAccent(item.type)
                            const disabled = !link || link === '#'

                            return (
                                <Card
                                    key={item.id}
                                    className="group overflow-visible rounded-2xl border border-slate-200 bg-white/95 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                                >
                                    <CardContent className="p-4 md:p-5">
                                        <div className="relative">
                                            <div className="aspect-[16/10] overflow-hidden rounded-xl bg-slate-100">
                                                {item.image ? (
                                                    <img
                                                        src={item.image}
                                                        alt={translated.title || item.title}
                                                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400">
                                                        <Icon className="w-14 h-14" />
                                                    </div>
                                                )}
                                            </div>

                                            <div className={`absolute -top-7 left-1/2 -translate-x-1/2 h-16 w-16 rounded-full bg-gradient-to-br ${accent} border-4 border-white shadow-xl flex items-center justify-center`}>
                                                <Icon className="w-8 h-8 text-white" />
                                            </div>
                                        </div>

                                        <div className="pt-7 text-center">
                                            <h2 className="font-display text-2xl font-extrabold text-[#09084f]">
                                                {translated.title || item.title}
                                            </h2>

                                            <div
                                                className={[
                                                    'mx-auto mt-3 mb-4 h-[3px] w-10 rounded-full',
                                                    item.type === 'videos'
                                                        ? 'bg-[#5b4af2]'
                                                        : item.type === 'comics'
                                                            ? 'bg-[#359b36]'
                                                            : 'bg-[#ff6b22]',
                                                ].join(' ')}
                                            />

                                            <p className="mx-auto min-h-[72px] max-w-sm text-sm md:text-base leading-relaxed text-slate-600">
                                                {translated.description || item.description}
                                            </p>

                                            <Button
                                                disabled={disabled}
                                                onClick={() => {
                                                    if (!disabled) window.open(link, '_blank', 'noopener,noreferrer')
                                                }}
                                                className={`mt-5 w-full rounded-lg bg-gradient-to-r ${accent} text-white h-12 text-base font-bold disabled:cursor-not-allowed disabled:opacity-50`}
                                            >
                                                <ExternalLink className="w-5 h-5 mr-2" />
                                                {translated.buttonText || item.buttonText}
                                            </Button>

                                            {disabled && (
                                                <p className="mt-3 text-xs text-slate-400">
                                                    Available Soon
                                                </p>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                </section>
            </main>
        </>
    )
}