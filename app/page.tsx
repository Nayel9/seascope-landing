import { Nav } from '@/components/layout/Nav'
import { Footer } from '@/components/layout/Footer'
import { Hero } from '@/components/sections/Hero'
import { Problem } from '@/components/sections/Problem'
import { Decide } from '@/components/sections/Decide'
import { Prepare } from '@/components/sections/Prepare'
import { Explore } from '@/components/sections/Explore'
import { Navigate } from '@/components/sections/Navigate'
import { Security } from '@/components/sections/Security'
import { Comparison } from '@/components/sections/Comparison'
import { Pricing } from '@/components/sections/Pricing'
import { Story } from '@/components/sections/Story'
import { FAQ } from '@/components/sections/FAQ'
import { FinalCta } from '@/components/sections/FinalCta'
import { FAQ_ITEMS } from '@/lib/faq'

const SEO_DESCRIPTION =
  'Météo marine, prévisions tide et courants, sécurité et mouillage : SeaScope analyse toutes les données pour vous aider à planifier vos sorties en toute sérénité.'

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'SeaScope',
      description: SEO_DESCRIPTION,
      url: 'https://seascope-web.pennarstudio.fr',
      applicationCategory: 'TravelApplication',
      operatingSystem: 'ANDROID',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'EUR',
      },
    },
    {
      '@type': 'FAQPage',
      mainEntity: FAQ_ITEMS.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.a,
        },
      })),
    },
  ],
}

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Nav />
      <main>
        <Hero />
        <Problem />
        <Decide />
        <Prepare />
        <Explore />
        <Navigate />
        <Security />
        <Comparison />
        <Pricing />
        <Story />
        <FAQ />
        <FinalCta />
      </main>
      <Footer />
    </>
  )
}
