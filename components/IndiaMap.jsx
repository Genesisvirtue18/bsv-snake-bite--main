'use client'
import { useState } from 'react'

// Simplified India map with 7 highlighted states (approximate paths for MVP)
const STATE_PATHS = {
  MH: 'M 145 295 L 175 285 L 215 290 L 245 305 L 250 340 L 230 365 L 195 370 L 165 360 L 140 340 Z',
  KA: 'M 175 370 L 215 365 L 240 380 L 245 420 L 220 445 L 185 445 L 165 425 L 160 395 Z',
  TN: 'M 220 445 L 250 440 L 275 460 L 280 495 L 260 520 L 235 520 L 215 495 L 215 465 Z',
  AP: 'M 245 365 L 285 365 L 305 385 L 310 425 L 285 450 L 255 445 L 245 420 Z',
  TG: 'M 235 320 L 275 320 L 295 345 L 290 370 L 260 375 L 240 360 Z',
  MP: 'M 175 220 L 240 215 L 280 225 L 290 265 L 270 290 L 230 295 L 195 285 L 170 265 Z',
  OD: 'M 305 280 L 350 275 L 375 295 L 380 330 L 360 350 L 325 350 L 305 325 Z',
}

const STATE_LABELS = {
  MH: { x: 195, y: 330, name: 'Maharashtra' },
  KA: { x: 200, y: 410, name: 'Karnataka' },
  TN: { x: 245, y: 490, name: 'Tamil Nadu' },
  AP: { x: 275, y: 410, name: 'Andhra Pradesh' },
  TG: { x: 265, y: 350, name: 'Telangana' },
  MP: { x: 230, y: 260, name: 'Madhya Pradesh' },
  OD: { x: 340, y: 315, name: 'Odisha' },
}

// Outline of India (rough)
const INDIA_OUTLINE = 'M 180 80 L 220 70 L 270 75 L 320 90 L 360 130 L 380 170 L 395 220 L 400 270 L 390 320 L 375 360 L 350 400 L 310 450 L 280 510 L 250 540 L 220 525 L 200 490 L 175 450 L 155 410 L 140 360 L 130 310 L 125 260 L 130 210 L 145 160 L 165 115 Z'

export default function IndiaMap({ states = [], onStateClick }) {
  const [hovered, setHovered] = useState(null)
  const stateMap = Object.fromEntries(states.map(s => [s.code, s]))

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <svg viewBox="100 50 320 510" className="w-full h-auto drop-shadow-2xl">
        <defs>
          <linearGradient id="indiaGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <path d={INDIA_OUTLINE} fill="url(#indiaGrad)" stroke="#cbd5e1" strokeWidth="1.5" />
        {Object.entries(STATE_PATHS).map(([code, d]) => {
          const data = stateMap[code]
          const fill = data?.color || '#151f6d'
          const isHover = hovered === code
          return (
            <g key={code}>
              <path
                d={d}
                fill={fill}
                fillOpacity={isHover ? 1 : 0.85}
                stroke="#fff"
                strokeWidth="1.5"
                className="state-path"
                onMouseEnter={() => setHovered(code)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => onStateClick?.(data)}
                filter={isHover ? 'url(#glow)' : ''}
              />
              <circle cx={STATE_LABELS[code].x} cy={STATE_LABELS[code].y} r="4" fill="#fff" />
              <circle cx={STATE_LABELS[code].x} cy={STATE_LABELS[code].y} r="2" fill={fill} />
            </g>
          )
        })}
      </svg>
      {hovered && (
        <div className="absolute top-4 right-4 bg-white rounded-xl shadow-2xl p-4 border-l-4 border-bsv-red max-w-xs">
          <h4 className="font-display font-bold text-bsv-blue text-lg">{STATE_LABELS[hovered]?.name}</h4>
          {stateMap[hovered] && (
            <div className="mt-2 space-y-1 text-sm">
              <p><span className="text-muted-foreground">Lives Impacted:</span> <span className="font-bold text-bsv-red">{stateMap[hovered].lives.toLocaleString()}+</span></p>
              <p><span className="text-muted-foreground">Villages:</span> <span className="font-bold">{stateMap[hovered].villages}</span></p>
              <p><span className="text-muted-foreground">Sessions:</span> <span className="font-bold">{stateMap[hovered].sessions}</span></p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
