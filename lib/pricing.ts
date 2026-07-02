// SOURCE UNIQUE des tarifs de la landing.
// Miroir de seaScope/lib/paywall/offerings.ts — recopier ici si les prix changent.
export type Period = 'P1M' | 'P1Y' | 'P4M_NON_RENEWING'
export interface Product { id: string; role: 'monthly' | 'annual' | 'season'; period: Period; priceEUR: number }

export const PRODUCTS = {
  premiumMonthly:     { id: 'seascope_premium_monthly',      role: 'monthly', period: 'P1M', priceEUR: 5.99 },
  premiumAnnual:      { id: 'seascope_premium_annual',       role: 'annual',  period: 'P1Y', priceEUR: 39.99 },
  premiumPlusMonthly: { id: 'seascope_premium_plus_monthly', role: 'monthly', period: 'P1M', priceEUR: 9.99 },
  premiumPlusAnnual:  { id: 'seascope_premium_plus_annual',  role: 'annual',  period: 'P1Y', priceEUR: 69.99 },
  premiumPlusSeason:  { id: 'seascope_premium_plus_season',  role: 'season',  period: 'P4M_NON_RENEWING', priceEUR: 24.99 },
} as const satisfies Record<string, Product>

export interface OfferingPackage { role: 'monthly' | 'annual' | 'season'; product: Product; highlighted: boolean; badge?: string }
export const OFFERINGS = {
  premium: {
    title: 'Premium',
    packages: [
      { role: 'annual',  product: PRODUCTS.premiumAnnual,  highlighted: true,  badge: 'Économisez 44 %' },
      { role: 'monthly', product: PRODUCTS.premiumMonthly, highlighted: false },
    ],
  },
  premiumPlus: {
    title: 'Premium+',
    packages: [
      { role: 'annual',  product: PRODUCTS.premiumPlusAnnual,  highlighted: true,  badge: 'Économisez 42 %' },
      { role: 'season',  product: PRODUCTS.premiumPlusSeason,  highlighted: false, badge: 'Pass saison · 4 mois' },
      { role: 'monthly', product: PRODUCTS.premiumPlusMonthly, highlighted: false },
    ],
  },
} as const

export function monthlyEquivalentEUR(p: Product): number | null {
  if (p.period === 'P1Y') return Math.round((p.priceEUR / 12) * 100) / 100
  if (p.period === 'P1M') return p.priceEUR
  return null
}
export function formatEUR(n: number): string {
  return `${n.toFixed(2).replace('.', ',')} €`
}
