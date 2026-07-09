'use client'

import { useEffect, useRef } from 'react'

const LANG_KEY = 'bsv_lang'

const SKIP_SELECTOR = [
  'script',
  'style',
  'noscript',
  'svg',
  'canvas',
  'img',
  'video',
  'iframe',
  'input',
  'textarea',
  'select',
  'option',
  'code',
  'pre',
  '[contenteditable="true"]',
  '[data-no-translate]',
  '[data-no-dom-translate]',
  '.notranslate',
].join(',')

function cleanText(text) {
  return String(text || '').replace(/\s+/g, ' ').trim()
}

function isEnglishText(text) {
  const t = cleanText(text)

  if (!t) return false
  if (t.length < 2) return false
  if (t.length > 450) return false
  if (!/[A-Za-z]/.test(t)) return false

  if (/^https?:\/\//i.test(t)) return false
  if (/^[\w.-]+@[\w.-]+\.\w+$/i.test(t)) return false
  if (/^[\d\s+().,-]+$/.test(t)) return false
  if (/^[#@]/.test(t)) return false

  return true
}

function isHidden(el) {
  if (!el || el.nodeType !== 1) return false

  const style = window.getComputedStyle(el)

  return (
    style.display === 'none' ||
    style.visibility === 'hidden' ||
    style.opacity === '0'
  )
}

export default function GlobalAutoTranslator() {
  const originalsRef = useRef(new WeakMap())
  const cacheRef = useRef(new Map())
  const timerRef = useRef(null)
  const runningRef = useRef(false)

  useEffect(() => {
    

    if (typeof window === 'undefined') return
    if (window.location.pathname.startsWith('/admin')) return

    const getLang = () => {
      return String(localStorage.getItem(LANG_KEY) || 'en').toLowerCase()
    }

    const getTextNodes = () => {
      const nodes = []

      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT
      )

      let node

      while ((node = walker.nextNode())) {
        const parent = node.parentElement

        if (!parent) continue
        if (parent.closest(SKIP_SELECTOR)) continue
        if (isHidden(parent)) continue

        if (!originalsRef.current.has(node)) {
          originalsRef.current.set(node, node.nodeValue)
        }

        const original = originalsRef.current.get(node)
        const text = cleanText(original)

        if (isEnglishText(text)) {
          nodes.push({
            node,
            original,
            text,
          })
        }
      }

      return nodes
    }

    const translateNow = async () => {
      if (runningRef.current) return

      const lang = getLang()


      const nodes = getTextNodes()

      

      if (lang === 'en') {
        nodes.forEach(({ node, original }) => {
          node.nodeValue = original
        })
        return
      }

      const uniqueTexts = [...new Set(nodes.map((item) => item.text))]

      const missingTexts = uniqueTexts.filter((text) => {
        return !cacheRef.current.has(`${lang}::${text}`)
      })

      

      if (missingTexts.length) {
        runningRef.current = true

        try {
          const response = await fetch('/api/dom-translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              targetLang: lang,
              texts: missingTexts,
            }),
          })

          

          const data = await response.json()
          const translations = data.translations || {}

          Object.entries(translations).forEach(([source, translated]) => {
            if (translated) {
              cacheRef.current.set(`${lang}::${source}`, translated)
            }
          })
        } catch (error) {
          console.error('DOM translate error:', error)
        } finally {
          runningRef.current = false
        }
      }

      nodes.forEach(({ node, original, text }) => {
        const translated = cacheRef.current.get(`${lang}::${text}`)

        if (!translated) return

        const leading = String(original).match(/^\s*/)?.[0] || ''
        const trailing = String(original).match(/\s*$/)?.[0] || ''

        node.nodeValue = `${leading}${translated}${trailing}`
      })
    }

    const schedule = () => {
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(translateNow, 800)
    }

    schedule()

    const observer = new MutationObserver(() => {
      schedule()
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })

    const interval = setInterval(schedule, 2500)

    window.addEventListener('bsv-language-change', schedule)
    window.addEventListener('popstate', schedule)

    return () => {
      clearTimeout(timerRef.current)
      clearInterval(interval)
      observer.disconnect()
      window.removeEventListener('bsv-language-change', schedule)
      window.removeEventListener('popstate', schedule)
    }
  }, [])

  return null
}