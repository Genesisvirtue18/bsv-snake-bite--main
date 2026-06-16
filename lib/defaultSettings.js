// Default Global Settings - editable from Admin → Settings
export const DEFAULT_SETTINGS = {
  branding: {
    websiteName: 'BSV Snakebite Awareness Campaign',
    campaignName: 'Saap Ka Vaar, Aspataal Mein Hi Upchaar',
    tagline: 'India\u2019s National Snakebite Awareness Initiative',
    headerLogo: '',
    footerLogo: '',
    favicon: '',
    appleTouchIcon: '',
    socialSharingImage: '',
    mobileLogo: '',
    darkLogo: '',
    lightLogo: '',
    colors: {
      primary: '#151f6d',     // Primary brand blue
      accent: '#de2527',      // Accent red
      background: '#ffffff',  // Page background
      surface: '#f8fafc',     // Section alt-bg (slate-50)
      headingColor: '#151f6d',
      textColor: '#334155',
    },
  },
  seoHome: {
    metaTitle: 'BSV Snakebite Awareness | Saap Ka Vaar, Aspataal Mein Hi Upchaar',
    metaDescription: 'India\u2019s National Snakebite Awareness Initiative by BSV. Saving lives through awareness, access, and immediate hospital treatment.',
    metaKeywords: 'snakebite awareness, BSV, Bharat Serums Vaccines, ASVS, anti-snake venom, India, hospital treatment',
    canonicalUrl: '',
    robots: 'index, follow',
    ogTitle: 'Saap Ka Vaar, Aspataal Mein Hi Upchaar',
    ogDescription: 'Saving Lives From Snakebite Across India',
    ogImage: '',
    twitterTitle: 'BSV Snakebite Awareness',
    twitterDescription: 'Saving lives across India through awareness and timely hospital treatment',
    twitterImage: '',
    twitterCardType: 'summary_large_image',
  },
  perPage: {
    home: { slug: '/', metaTitle: '', metaDescription: '', ogTitle: '', ogDescription: '', ogImage: '', schemaType: 'WebSite' },
    about: { slug: '/#about', metaTitle: 'About the Campaign', metaDescription: 'Learn about India\u2019s snakebite burden and BSV\u2019s commitment.', ogImage: '', schemaType: 'AboutPage' },
    impact_stories: { slug: '/impact-stories', metaTitle: 'Impact Stories', metaDescription: 'Real stories of lives saved through snakebite awareness across India.', ogImage: '', schemaType: 'CollectionPage' },
    reports: { slug: '/reports', metaTitle: 'Reports & Publications', metaDescription: 'Annual reports, research findings, and campaign assessments.', ogImage: '', schemaType: 'CollectionPage' },
    ngo_network: { slug: '/ngo-network', metaTitle: 'NGO Network', metaDescription: 'Our partner NGOs working across rural India.', ogImage: '', schemaType: 'CollectionPage' },
    volunteer: { slug: '/volunteer', metaTitle: 'Volunteer Program', metaDescription: 'Join the BSV snakebite awareness movement.', ogImage: '', schemaType: 'WebPage' },
    contact: { slug: '/#contact', metaTitle: 'Contact Us', metaDescription: 'Get in touch with BSV.', ogImage: '', schemaType: 'ContactPage' },
  },
  contact: {
    email: 'campaign@bsvindia.com',
    phone: '+91 22 6664 8000',
    address: 'BSV Bharat Serums & Vaccines Ltd., Plot No. 16, Veera Industrial Estate, Andheri (W), Mumbai 400053, India',
    googleMapsUrl: 'https://maps.google.com/?q=Andheri+West+Mumbai',
    whatsappNumber: '+919999999999',
    helplineNumber: '108',
  },
  social: {
    youtube: 'https://youtube.com',
    facebook: 'https://facebook.com',
    instagram: 'https://instagram.com',
    linkedin: 'https://linkedin.com',
    twitter: 'https://twitter.com',
    whatsapp: '',
  },
  tracking: {
    googleAnalyticsId: '',
    googleTagManagerId: '',
    metaPixelId: '',
    linkedinInsightTag: '',
    microsoftClarityId: '',
    googleSearchConsoleVerification: '',
    bingVerification: '',
    facebookDomainVerification: '',
    hotjarId: '',
  },
  advanced: {
    sitemapEnabled: true,
    sitemapAdditionalUrls: [],
    robotsTxt: 'User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n\nSitemap: /sitemap.xml',
    customHeadScripts: '',
    customBodyScripts: '',
    enableSchema: true,
  },
  translations: {}, // per-language overrides for branding/SEO
  translationStatus: {},
}
