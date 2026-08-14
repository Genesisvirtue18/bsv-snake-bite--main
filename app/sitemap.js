const SITE_URL = 'https://snakebite-info.bsvgroup.com'

const PUBLIC_ROUTES = [
  '',
  '/brochures',
  '/Comic-%26-Visual-Stories',
  '/gallery',
  '/impact-stories',
  '/kol-program',
  '/mankind-agritech-collaboration',
  '/mass-media',
  '/meetings-with-policy-makers',
  '/ngo-network',
  '/onground',
  '/privacy-policy',
  '/terms-of-use',
  '/training',
  '/videos',
]

export default function sitemap() {
  return PUBLIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route}`,
    changeFrequency: route === '' ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : 0.7,
  }))
}
