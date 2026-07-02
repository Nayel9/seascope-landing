import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'

const SEO_TITLE = "SeaScope — l’assistant de décision des plaisanciers"
const SEO_DESCRIPTION =
  'Météo marine, prévisions de marée et de courants, sécurité et mouillage : SeaScope analyse toutes les données pour vous aider à planifier vos sorties en toute sérénité.'
const SEO_URL = 'https://seascope-web.pennarstudio.fr'
const SEO_OG_IMAGE = '/og.png'

export const metadata: Metadata = {
  metadataBase: new URL(SEO_URL),
  title: SEO_TITLE,
  description: SEO_DESCRIPTION,
  openGraph: {
    title: SEO_TITLE,
    description: SEO_DESCRIPTION,
    url: SEO_URL,
    siteName: 'SeaScope',
    locale: 'fr_FR',
    type: 'website',
    images: [
      {
        url: SEO_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: 'SeaScope — l’assistant de décision des plaisanciers',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SEO_TITLE,
    description: SEO_DESCRIPTION,
    images: [SEO_OG_IMAGE],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="bg-ss-bg text-ss-fg antialiased min-h-screen overflow-x-hidden">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
