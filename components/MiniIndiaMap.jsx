'use client'
import IndiaMap from '@svg-maps/india'
import { useId } from 'react'

const india = IndiaMap.default || IndiaMap

// Map our state codes (uppercase) to SVG location ids (lowercase)
const CODE_MAP = {
  MH: 'mh', KA: 'ka', TN: 'tn', AP: 'ap', TG: 'tg', MP: 'mp',
  OD: 'or', OR: 'or', WB: 'wb', GJ: 'gj', RJ: 'rj', UP: 'up',
  BR: 'br', JH: 'jh', CT: 'ct', CG: 'ct', KL: 'kl', GA: 'ga',
  HR: 'hr', PB: 'pb', HP: 'hp', UK: 'ut', UT: 'ut', JK: 'jk',
  DL: 'dl', SK: 'sk', AS: 'as', AR: 'ar', NL: 'nl', MN: 'mn',
  MZ: 'mz', TR: 'tr', ML: 'ml',
}

export default function MiniIndiaMap({ activeCode, size = 'md', tone = 'gradient' }) {
  const uid = useId().replace(/[:]/g, '')
  const target = CODE_MAP[(activeCode || '').toUpperCase()] || (activeCode || '').toLowerCase()
  const dims = { sm: 60, md: 88, lg: 140 }[size] || 88

  return (
    <svg
      viewBox={india.viewBox}
      width={dims}
      height={dims}
      xmlns="http://www.w3.org/2000/svg"
      aria-label={`India map highlighting ${activeCode}`}
      className="block"
    >
      <defs>
        <linearGradient id={`grad-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#de2527" />
          <stop offset="100%" stopColor="#151f6d" />
        </linearGradient>
        <filter id={`glow-${uid}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* All non-active states: muted grey */}
      {india.locations.map((loc) => {
        if (loc.id === target) return null
        return (
          <path
            key={loc.id}
            d={loc.path}
            fill="#e2e8f0"
            stroke="#cbd5e1"
            strokeWidth="0.6"
          />
        )
      })}

      {/* Active state on top with gradient + glow */}
      {india.locations
        .filter((l) => l.id === target)
        .map((loc) => (
          <g key={loc.id} className="active-state-group" filter={`url(#glow-${uid})`}>
            <path
              d={loc.path}
              fill={tone === 'gradient' ? `url(#grad-${uid})` : '#de2527'}
              stroke="#ffffff"
              strokeWidth="1.2"
              style={{ transformOrigin: 'center', transformBox: 'fill-box' }}
            />
          </g>
        ))}
    </svg>
  )
}
