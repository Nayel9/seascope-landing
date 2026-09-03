import assert from 'node:assert/strict'
import { PRODUCTS, OFFERINGS, monthlyEquivalentEUR, formatEUR } from '../lib/pricing.ts'

// 5 produits, valeurs miroir de seaScope/lib/paywall/offerings.ts
assert.equal(PRODUCTS.premiumMonthly.priceEUR, 5.99)
assert.equal(PRODUCTS.premiumAnnual.priceEUR, 39.99)
assert.equal(PRODUCTS.premiumPlusMonthly.priceEUR, 9.99)
assert.equal(PRODUCTS.premiumPlusAnnual.priceEUR, 69.99)
assert.equal(PRODUCTS.premiumPlusSeason.priceEUR, 24.99)
assert.equal(PRODUCTS.premiumPlusSeason.period, 'P4M_NON_RENEWING')

// offerings : annuel mis en avant + badges
const premAnnual = OFFERINGS.premium.packages.find(p => p.role === 'annual')!
assert.equal(premAnnual.highlighted, true)
assert.equal(premAnnual.badge, 'Économisez 44 %')
assert.equal(OFFERINGS.premiumPlus.packages.find(p => p.role === 'annual')!.badge, 'Économisez 42 %')
assert.equal(OFFERINGS.premiumPlus.packages.find(p => p.role === 'season')!.badge, 'Pass saison · 4 mois')

// cohérence : annuel < 12 × mensuel (l'économie est réelle)
assert.ok(PRODUCTS.premiumAnnual.priceEUR < 12 * PRODUCTS.premiumMonthly.priceEUR)
assert.ok(PRODUCTS.premiumPlusAnnual.priceEUR < 12 * PRODUCTS.premiumPlusMonthly.priceEUR)

// helpers
assert.equal(monthlyEquivalentEUR(PRODUCTS.premiumAnnual), 3.33)
assert.equal(formatEUR(39.99), '39,99 €')
console.log('Tous les tests pricing passent.')
