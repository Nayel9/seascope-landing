import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SeaScope — Décidez quand sortir, sachez quand rentrer.',
  description:
    'SeaScope est un copilote décisionnel pour navigation côtière. Fenêtres météo, heure de retour, recommandations adaptées à votre façon de naviguer. Beta fermée — Été 2026.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="bg-ss-bg text-ss-fg antialiased min-h-screen overflow-x-hidden">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
