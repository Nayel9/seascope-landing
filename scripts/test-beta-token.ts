// Tests du token candidat signé (HMAC) — node --experimental-strip-types --env-file=.env.local scripts/test-beta-token.ts
// (env-file requis : la signature utilise ADMIN_SESSION_SECRET)
import assert from 'node:assert/strict'
import { signCandidatureToken, verifyCandidatureToken } from '../lib/beta/token.ts'

const id = '1f2e3d4c-5b6a-7980-abcd-ef0123456789'
const token = signCandidatureToken(id)

assert.equal(verifyCandidatureToken(token), id, 'aller-retour sign/verify')
assert.equal(verifyCandidatureToken(token.slice(0, -1) + (token.endsWith('0') ? '1' : '0')), null, 'signature altérée → null')
assert.equal(verifyCandidatureToken('autre-id.' + token.split('.')[1]), null, 'id altéré → null')
assert.equal(verifyCandidatureToken(''), null, 'vide → null')
assert.equal(verifyCandidatureToken(undefined), null, 'undefined → null')
assert.equal(verifyCandidatureToken('pas-de-point'), null, 'sans point → null')
assert.equal(verifyCandidatureToken(`${id}.zzzz`), null, 'signature non-hex → null')
assert.ok(/^[0-9a-f-]+\.[0-9a-f]{64}$/.test(token), 'format <id>.<hmac hex>')

console.log('Tous les tests passent.')
