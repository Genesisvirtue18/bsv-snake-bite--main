'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Drama, X, ChevronLeft, ChevronRight,
  ArrowRight, Image as ImageIcon, MapPin, ChevronUp, Plus,
  ArrowLeft
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getT } from '@/lib/translations'

// Gallery Lightbox Component
function GalleryLightbox({ images, currentIndex, onClose, onPrev, onNext, cityName, stateName }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onPrev()
      if (e.key === 'ArrowRight') onNext()
    }
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [onClose, onPrev, onNext])

  return (
    <div
      className="fixed inset-0 z-[999] bg-black/95 backdrop-blur-xl flex items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute top-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-b from-black/50 to-transparent flex justify-between items-start">
        <div>
          <h3 className="text-white font-bold text-lg md:text-xl">{cityName}, {stateName}</h3>
          <p className="text-white/60 text-sm">Nukkad Natak Gallery</p>
        </div>
        <button
          onClick={onClose}
          className="text-white/70 hover:text-white transition p-2 hover:bg-white/10 rounded-full"
          aria-label="Close gallery"
        >
          <X className="w-6 h-6 md:w-7 md:h-7" />
        </button>
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); onPrev() }}
        className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-[1002] bg-white/90 text-black shadow-xl p-2.5 md:p-3 rounded-full"
        aria-label="Previous image"
      >
        <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
      </button>

      <button
        onClick={(e) => { e.stopPropagation(); onNext() }}
        className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-[1002] bg-white/90 text-black shadow-xl p-2.5 md:p-3 rounded-full"
        aria-label="Next image"
      >
        <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
      </button>

      <div
        className="relative w-[92vw] max-w-5xl h-[70vh] md:h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {images[currentIndex] && (
          <img
            src={images[currentIndex]}
            alt={`${cityName} Nukkad Natak`}
            className="w-full h-full object-contain rounded-lg"
            onError={(e) => {
              e.currentTarget.src = '/images/placeholder-gallery.jpg'
            }}
          />
        )}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm px-3 py-1.5 md:px-4 md:py-2 rounded-full text-white/80 text-xs md:text-sm">
          {currentIndex + 1} / {images.length}
        </div>
      </div>
    </div>
  )
}

// Main Component
export default function NukkadNatakPage() {
  const [lang, setLang] = useState('en')
  const [settings, setSettings] = useState(null)
  const [content, setContent] = useState(null)
  const [selectedCity, setSelectedCity] = useState(null)
  const [selectedState, setSelectedState] = useState(null)
  const [galleryImages, setGalleryImages] = useState([])
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [hoveredCity, setHoveredCity] = useState(null)
  const [visibleCities, setVisibleCities] = useState({})

  const t = getT(lang)

  // Fetch settings and content
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [settingsRes, contentRes] = await Promise.all([
          fetch('/api/settings'),
          fetch('/api/content')
        ])

        if (settingsRes.ok) {
          const data = await settingsRes.json()
          setSettings(data)
        }

        if (contentRes.ok) {
          const data = await contentRes.json()
          setContent(data)
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
      }
    }
    fetchData()
  }, [])

  // Get Nukkad Natak data from CMS only - NO FALLBACK
  const nukkadData = content?.nukkadNatak || null

  // Initialize visible cities (3 per state) - only if data exists
  useEffect(() => {
    if (nukkadData?.states) {
      const initialVisible = {}
      nukkadData.states.forEach(stateData => {
        initialVisible[stateData.state] = 3
      })
      setVisibleCities(initialVisible)
    }
  }, [nukkadData])

  // Save language preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('bsv_lang', lang)
    }
  }, [lang])

  const openGallery = (city, state) => {
    setSelectedCity(city)
    setSelectedState(state)
    setGalleryImages(city.gallery || [])
    setLightboxIndex(0)
    setIsLightboxOpen(true)
  }

  const closeGallery = () => {
    setIsLightboxOpen(false)
    setSelectedCity(null)
    setSelectedState(null)
    setGalleryImages([])
  }

  const nextImage = useCallback(() => {
    setLightboxIndex((prev) => (prev + 1) % galleryImages.length)
  }, [galleryImages.length])

  const prevImage = useCallback(() => {
    setLightboxIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length)
  }, [galleryImages.length])

  const showMoreCities = (stateName) => {
    setVisibleCities(prev => ({
      ...prev,
      [stateName]: (prev[stateName] || 3) + 3
    }))
  }

  const showLessCities = (stateName) => {
    setVisibleCities(prev => ({
      ...prev,
      [stateName]: 3
    }))
  }

  const BRAND = {
    blue: '#201F5E',
    cyan: '#0EAFC5',
    deep: '#0D71B8',
    red: '#de2527'
  }

  // If no data from CMS, show nothing (empty page)
  if (!nukkadData || !nukkadData.states || nukkadData.states.length === 0) {
    return null
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Home Button - Fixed Position */}
      <header className="bg-bsv-blue text-white py-4">
        <div className="container mx-auto px-4 flex items-center gap-3">
          <Link href="/">
            <Button
              variant="ghost"
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Home
            </Button>
          </Link>

          <div>
            <div className="font-display font-extrabold text-xl">
              Nukkad Natak
            </div>
            <div className="text-xs text-white/70">
              Community Awareness Through Street Plays
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
              <Drama className="w-8 h-8" style={{ color: BRAND.blue }} />
            </div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4" style={{ color: BRAND.blue }}>
              {nukkadData?.heading || 'Nukkad Natak'}
            </h1>

            <p className="text-slate-600 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              {nukkadData?.subheading || ''}
            </p>
          </div>
        </section>

        {/* States & Cities Grid */}
        <section className="py-16 bg-slate-50">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-center mb-10" style={{ color: BRAND.blue }}>
              States We've Covered
            </h2>

            <div className="space-y-8">
              {nukkadData.states.map((stateData, idx) => {
                const visibleCount = visibleCities[stateData.state] || 3
                const totalCities = stateData.cities.length
                const visibleCitiesList = stateData.cities.slice(0, visibleCount)
                const hasMore = visibleCount < totalCities

                return (
                  <div key={idx} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100">
                    {/* State Header */}
                    <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
                      <MapPin className="w-5 h-5" style={{ color: BRAND.red }} />
                      <h3 className="font-display font-bold text-xl" style={{ color: BRAND.blue }}>
                        {stateData.state}
                      </h3>
                      <Badge className="ml-2" style={{ background: BRAND.cyan }}>
                        {totalCities} Cities
                      </Badge>
                    </div>

                    {/* Cities Grid */}
                    <div className="p-6">
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {visibleCitiesList.map((city, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05, duration: 0.3 }}
                            onClick={() => openGallery(city, stateData.state)}
                            onMouseEnter={() => setHoveredCity(i)}
                            onMouseLeave={() => setHoveredCity(null)}
                            className="group bg-slate-50 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
                            style={{
                              transform: hoveredCity === i ? 'translateY(-4px)' : 'translateY(0)',
                            }}
                          >
                            {/* Image */}
                            <div className="relative h-48 overflow-hidden bg-slate-200">
                              <img
                                src={city.image}
                                alt={city.name}
                                className="w-full h-full object-cover transition duration-500"
                                style={{
                                  transform: hoveredCity === i ? 'scale(1.05)' : 'scale(1)',
                                }}
                                onError={(e) => {
                                  e.currentTarget.src = '/images/placeholder-city.jpg'
                                }}
                              />

                              {/* City Name Badge */}
                              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm border border-white/10">
                                <MapPin className="w-3 h-3 text-white" />
                                <span className="text-white text-xs font-medium">{city.name}</span>
                              </div>

                              {/* Gallery Icon on Hover */}
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-xl">
                                  <ImageIcon className="w-6 h-6" style={{ color: BRAND.blue }} />
                                </div>
                              </div>
                            </div>

                            {/* Content */}
                            <div className="p-4">
                              <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">
                                {city.desc}
                              </p>

                              <div className="mt-3 pt-3 border-t border-slate-200">
                                <div className="flex items-center gap-1 text-sm font-semibold" style={{ color: BRAND.red }}>
                                  Explore →
                                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      {/* Show More / Show Less Button */}
                      {totalCities > 3 && (
                        <div className="text-center mt-6">
                          {hasMore ? (
                            <Button
                              onClick={() => showMoreCities(stateData.state)}
                              variant="outline"
                              className="gap-2"
                              style={{ borderColor: BRAND.blue, color: BRAND.blue }}
                            >
                              <Plus className="w-4 h-4" />
                              Show More ({totalCities - visibleCount} more)
                            </Button>
                          ) : (
                            <Button
                              onClick={() => showLessCities(stateData.state)}
                              variant="outline"
                              className="gap-2"
                              style={{ borderColor: BRAND.blue, color: BRAND.blue }}
                            >
                              <ChevronUp className="w-4 h-4" />
                              Show Less
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      </main>

      {/* Gallery Lightbox */}
      {isLightboxOpen && galleryImages.length > 0 && (
        <GalleryLightbox
          images={galleryImages}
          currentIndex={lightboxIndex}
          onClose={closeGallery}
          onPrev={prevImage}
          onNext={nextImage}
          cityName={selectedCity?.name}
          stateName={selectedState}
        />
      )}
    </div>
  )
}