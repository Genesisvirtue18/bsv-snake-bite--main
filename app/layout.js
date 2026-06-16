import './globals.css'
import { Providers } from './providers'
import { Toaster } from '@/components/ui/sonner'
import { MongoClient } from 'mongodb'
import { DEFAULT_SETTINGS } from '@/lib/defaultSettings'

let _client
async function fetchSettings() {
  try {
    if (!_client) {
      _client = new MongoClient(process.env.MONGO_URL)
      await _client.connect()
    }
    const db = _client.db(process.env.DB_NAME || 'bsv_snakebite_campaign')
    const doc = await db.collection('site_settings').findOne({ id: 'main' })
    return doc?.data || DEFAULT_SETTINGS
  } catch (e) { return DEFAULT_SETTINGS }
}

export async function generateMetadata() {
  const s = await fetchSettings()
  const icons = {}
  if (s.branding?.favicon) icons.icon = s.branding.favicon
  if (s.branding?.appleTouchIcon) icons.apple = s.branding.appleTouchIcon
  return {
    title: s.seoHome?.metaTitle || s.branding?.websiteName || 'BSV Snakebite Awareness',
    description: s.seoHome?.metaDescription,
    keywords: s.seoHome?.metaKeywords,
    ...(Object.keys(icons).length ? { icons } : {}),
    openGraph: {
      title: s.seoHome?.ogTitle || s.branding?.campaignName,
      description: s.seoHome?.ogDescription,
      images: s.seoHome?.ogImage ? [s.seoHome.ogImage] : (s.branding?.socialSharingImage ? [s.branding.socialSharingImage] : []),
      type: 'website',
    },
    twitter: {
      card: s.seoHome?.twitterCardType || 'summary_large_image',
      title: s.seoHome?.twitterTitle,
      description: s.seoHome?.twitterDescription,
      images: s.seoHome?.twitterImage ? [s.seoHome.twitterImage] : [],
    },
    robots: s.seoHome?.robots || 'index, follow',
    other: {
      ...(s.tracking?.googleSearchConsoleVerification ? { 'google-site-verification': s.tracking.googleSearchConsoleVerification } : {}),
      ...(s.tracking?.facebookDomainVerification ? { 'facebook-domain-verification': s.tracking.facebookDomainVerification } : {}),
    },
  }
}

export default async function RootLayout({ children }) {
  const settings = await fetchSettings()
  const t = settings.tracking || {}
  const a = settings.advanced || {}
  // Build organization + breadcrumb schema
  const orgSchema = a.enableSchema ? {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: settings.branding?.websiteName,
    url: process.env.NEXT_PUBLIC_BASE_URL,
    logo: settings.branding?.headerLogo,
    sameAs: Object.values(settings.social || {}).filter(Boolean),
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: settings.contact?.phone,
      email: settings.contact?.email,
      contactType: 'customer service',
    },
  } : null
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {t.googleTagManagerId && (
          <script dangerouslySetInnerHTML={{__html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${t.googleTagManagerId}');`}} />
        )}
        {t.googleAnalyticsId && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${t.googleAnalyticsId}`} />
            <script dangerouslySetInnerHTML={{__html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${t.googleAnalyticsId}');`}} />
          </>
        )}
        {t.metaPixelId && (
          <script dangerouslySetInnerHTML={{__html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${t.metaPixelId}');fbq('track','PageView');`}} />
        )}
        {t.microsoftClarityId && (
          <script dangerouslySetInnerHTML={{__html: `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y)})(window,document,"clarity","script","${t.microsoftClarityId}");`}} />
        )}
        {t.linkedinInsightTag && (
          <script dangerouslySetInnerHTML={{__html: `_linkedin_partner_id="${t.linkedinInsightTag}";window._linkedin_data_partner_ids=window._linkedin_data_partner_ids||[];window._linkedin_data_partner_ids.push(_linkedin_partner_id);(function(l){if(!l){window.lintrk=function(a,b){window.lintrk.q.push([a,b])};window.lintrk.q=[]}var s=document.getElementsByTagName("script")[0];var b=document.createElement("script");b.type="text/javascript";b.async=true;b.src="https://snap.licdn.com/li.lms-analytics/insight.min.js";s.parentNode.insertBefore(b,s)})(window.lintrk);`}} />
        )}
        {t.hotjarId && (
          <script dangerouslySetInnerHTML={{__html: `(function(h,o,t,j,a,r){h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};h._hjSettings={hjid:${t.hotjarId},hjsv:6};a=o.getElementsByTagName('head')[0];r=o.createElement('script');r.async=1;r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;a.appendChild(r)})(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');`}} />
        )}
        {orgSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(orgSchema)}} />}
        {a.customHeadScripts && <script dangerouslySetInnerHTML={{__html: a.customHeadScripts}} />}
        <script dangerouslySetInnerHTML={{__html:'window.addEventListener("error",function(e){if(e.error instanceof DOMException&&e.error.name==="DataCloneError"&&e.message&&e.message.includes("PerformanceServerTiming")){e.stopImmediatePropagation();e.preventDefault()}},true);'}} />
      </head>
      <body className="font-sans antialiased">
        {t.googleTagManagerId && (
          <noscript dangerouslySetInnerHTML={{__html: `<iframe src="https://www.googletagmanager.com/ns.html?id=${t.googleTagManagerId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`}} />
        )}
        <Providers>{children}</Providers>
        <Toaster position="top-right" richColors />
        {a.customBodyScripts && <script dangerouslySetInnerHTML={{__html: a.customBodyScripts}} />}
      </body>
    </html>
  )
}
