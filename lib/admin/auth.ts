import { createHash, createHmac, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const COOKIE_NAME = 'ss_admin'
const MAX_AGE_S = 60 * 60 * 24 * 30 // 30 jours

function env() {
  const password = process.env.ADMIN_PASSWORD
  const secret = process.env.ADMIN_SESSION_SECRET
  if (!password || !secret) throw new Error('Variables manquantes: ADMIN_PASSWORD, ADMIN_SESSION_SECRET')
  return { password, secret }
}

// Comparaison timing-safe de deux chaînes de longueurs quelconques.
function safeEqual(a: string, b: string): boolean {
  const ha = createHash('sha256').update(a).digest()
  const hb = createHash('sha256').update(b).digest()
  return timingSafeEqual(ha, hb)
}

function sign(exp: string, secret: string): string {
  return createHmac('sha256', secret).update(exp).digest('hex')
}

export function verifyPassword(candidate: string): boolean {
  return safeEqual(candidate, env().password)
}

export async function createSession(): Promise<void> {
  const { secret } = env()
  const exp = String(Date.now() + MAX_AGE_S * 1000)
  const jar = await cookies()
  jar.set(COOKIE_NAME, `${exp}.${sign(exp, secret)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/admin',
    maxAge: MAX_AGE_S,
  })
}

export async function destroySession(): Promise<void> {
  const jar = await cookies()
  jar.set(COOKIE_NAME, '', { path: '/admin', maxAge: 0 })
}

export async function isAuthenticated(): Promise<boolean> {
  const { secret } = env()
  const jar = await cookies()
  const value = jar.get(COOKIE_NAME)?.value
  if (!value) return false
  const dot = value.indexOf('.')
  if (dot === -1) return false
  const exp = value.slice(0, dot)
  const sig = value.slice(dot + 1)
  if (!/^\d+$/.test(exp) || Number(exp) < Date.now()) return false
  return safeEqual(sig, sign(exp, secret))
}

/** À appeler en tête de chaque page et Server Action admin. */
export async function requireAdmin(): Promise<void> {
  if (!(await isAuthenticated())) redirect('/admin/login')
}
