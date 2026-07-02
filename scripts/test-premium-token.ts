// Tests du token Premium+ signé (HMAC) — node --experimental-strip-types --env-file=.env.local scripts/test-premium-token.ts
// (env-file requis : la signature utilise BETA_REDEEM_SECRET)
import assert from 'node:assert/strict'
import { signPremiumToken, verifyPremiumToken, type PremiumTokenPayload } from '../lib/campaign/premiumToken.ts'

const email = 'testeur@example.com'
const token = signPremiumToken({ email })

// Format : <payloadB64url>.<hmac hex 64>
assert.ok(/^[A-Za-z0-9_-]+\.[0-9a-f]{64}$/.test(token), 'format <payloadB64>.<hmac hex>')

const p = verifyPremiumToken(token)
assert.ok(p, 'aller-retour sign/verify → payload non nul')
assert.equal(p!.e, email, 'email préservé')
assert.equal(p!.t, 'premium_plus', 'type premium_plus')
assert.equal(p!.m, 12, 'months = 12 par défaut')
assert.equal(typeof p!.x, 'number', 'x est un number (epoch s)')
assert.ok(p!.x > Math.floor(Date.now() / 1000) + 29 * 86400, 'exp ≈ J+30')
assert.ok(p!.x < Math.floor(Date.now() / 1000) + 31 * 86400, 'exp ≈ J+30')

// Payload décodable et conforme au contrat backend
const [b64] = token.split('.')
const decoded = JSON.parse(Buffer.from(b64, 'base64url').toString('utf8')) as PremiumTokenPayload
assert.deepEqual(Object.keys(decoded), ['e', 't', 'm', 'x'], 'ordre des clés e,t,m,x (parité backend)')

// Falsification signature → null
assert.equal(verifyPremiumToken(token.slice(0, -1) + (token.endsWith('0') ? '1' : '0')), null, 'signature altérée → null')
// Falsification payload → null
const forged = Buffer.from(JSON.stringify({ e: 'attaquant@x.com', t: 'premium_plus', m: 12, x: decoded.x }), 'utf8').toString('base64url')
assert.equal(verifyPremiumToken(`${forged}.${token.split('.')[1]}`), null, 'payload altéré → null')
// Expiration dépassée → null
const expired = signPremiumToken({ email, expDays: -1 })
assert.equal(verifyPremiumToken(expired), null, 'lien expiré → null')
// Entrées vides
assert.equal(verifyPremiumToken(''), null, 'vide → null')
assert.equal(verifyPremiumToken(undefined), null, 'undefined → null')
assert.equal(verifyPremiumToken('pas-de-point'), null, 'sans point → null')
assert.equal(verifyPremiumToken('aaaa.zzzz'), null, 'signature non-hex → null')

console.log('Tous les tests passent.')
