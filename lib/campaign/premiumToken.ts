// Token Premium+ signé pour la campagne de redemption (email → lien universel
// /redeem?t=<token>). HMAC-SHA256 avec BETA_REDEEM_SECRET (secret DÉDIÉ, distinct
// d'ADMIN_SESSION_SECRET). Contrat IDENTIQUE au backend (Fly) qui vérifie ce token :
//   payload = { e, t:'premium_plus', m, x:<exp epoch s> }
//   token   = base64url(JSON.stringify(payload)) + '.' + HMAC_SHA256(payloadB64, secret) hex
// Le champ `e` (email invité) sert au pré-remplissage/rappel, PAS de gate. `x` = expiration
// du lien (J+30 par défaut). Testé par scripts/test-premium-token.ts.
import { createHash, createHmac, timingSafeEqual } from 'node:crypto'

export interface PremiumTokenPayload {
  e: string
  t: 'premium_plus'
  m: number
  x: number
}

function secret(): string {
  const s = process.env.BETA_REDEEM_SECRET
  if (!s) throw new Error('Variable manquante: BETA_REDEEM_SECRET')
  return s
}

const hmac = (payloadB64: string): string =>
  createHmac('sha256', secret()).update(payloadB64).digest('hex')

// Comparaison timing-safe de chaînes de longueurs quelconques (même approche que lib/beta/token.ts).
function safeEqual(a: string, b: string): boolean {
  const ha = createHash('sha256').update(a).digest()
  const hb = createHash('sha256').update(b).digest()
  return timingSafeEqual(ha, hb)
}

export function signPremiumToken(input: { email: string; months?: number; expDays?: number }): string {
  const months = input.months ?? 12
  const expDays = input.expDays ?? 30
  const x = Math.floor(Date.now() / 1000) + expDays * 86400
  const payload: PremiumTokenPayload = { e: input.email, t: 'premium_plus', m: months, x }
  const payloadB64 = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url')
  return `${payloadB64}.${hmac(payloadB64)}`
}

/** Retourne le payload typé si le token est valide et non expiré, sinon null. */
export function verifyPremiumToken(token: string | undefined | null): PremiumTokenPayload | null {
  if (!token) return null
  const dot = token.lastIndexOf('.')
  if (dot <= 0) return null
  const payloadB64 = token.slice(0, dot)
  const sig = token.slice(dot + 1)
  if (!/^[0-9a-f]{64}$/.test(sig) || !/^[A-Za-z0-9_-]+$/.test(payloadB64)) return null
  if (!safeEqual(sig, hmac(payloadB64))) return null
  let payload: PremiumTokenPayload
  try {
    payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'))
  } catch {
    return null
  }
  if (payload?.t !== 'premium_plus' || typeof payload.e !== 'string' || typeof payload.x !== 'number') return null
  if (payload.x < Math.floor(Date.now() / 1000)) return null
  return payload
}

export function buildRedeemUrl(siteUrl: string, token: string): string {
  return `${siteUrl.replace(/\/$/, '')}/redeem?t=${encodeURIComponent(token)}`
}
