// Token candidat signé pour les liens publics des emails (confirmation
// d'installation). HMAC-SHA256 avec ADMIN_SESSION_SECRET (secret existant),
// préfixe « beta: » pour isoler ce domaine de signature de celui des sessions
// admin. Pas d'expiration : le pire abus (rejouer son propre lien) est idempotent.
// Testé par scripts/test-beta-token.ts.
import { createHash, createHmac, timingSafeEqual } from 'node:crypto'

function secret(): string {
  const s = process.env.ADMIN_SESSION_SECRET
  if (!s) throw new Error('Variable manquante: ADMIN_SESSION_SECRET')
  return s
}

const sign = (id: string): string => createHmac('sha256', secret()).update(`beta:${id}`).digest('hex')

// Comparaison timing-safe de chaînes de longueurs quelconques (même approche que lib/admin/auth.ts).
function safeEqual(a: string, b: string): boolean {
  const ha = createHash('sha256').update(a).digest()
  const hb = createHash('sha256').update(b).digest()
  return timingSafeEqual(ha, hb)
}

export function signCandidatureToken(id: string): string {
  return `${id}.${sign(id)}`
}

/** Retourne l'id candidat si le token est valide, sinon null. */
export function verifyCandidatureToken(token: string | undefined | null): string | null {
  if (!token) return null
  const dot = token.lastIndexOf('.')
  if (dot <= 0) return null
  const id = token.slice(0, dot)
  const sig = token.slice(dot + 1)
  if (!/^[0-9a-f]{64}$/.test(sig) || !/^[0-9a-f-]{32,40}$/i.test(id)) return null
  return safeEqual(sig, sign(id)) ? id : null
}
