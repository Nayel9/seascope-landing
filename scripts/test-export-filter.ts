// Tests du prédicat d'export Google Play (pas d'infra de test dans le repo).
// Usage: node --experimental-strip-types scripts/test-export-filter.ts
import assert from 'node:assert/strict'
import { aExporterGooglePlay, type Candidature } from '../lib/admin/notion.ts'

const base = { emailGooglePlay: 'x@gmail.com', exportGooglePlay: false } as Partial<Candidature>
const c = (over: Partial<Candidature>): Candidature => ({ ...base, ...over }) as Candidature

const cases: Array<{ nom: string; cand: Candidature; attendu: boolean }> = [
  { nom: 'Accepté avec email non exporté → oui', cand: c({ statut: 'Accepté' }), attendu: true },
  { nom: 'Invité Google Play non exporté → oui (bug du 2026-06-05)', cand: c({ statut: 'Invité Google Play' }), attendu: true },
  { nom: 'Actif non exporté → oui (rattrapage)', cand: c({ statut: 'Actif' }), attendu: true },
  { nom: 'Refusé → non', cand: c({ statut: 'Refusé' }), attendu: false },
  { nom: 'Nouveau → non', cand: c({ statut: 'Nouveau' }), attendu: false },
  { nom: 'déjà exporté → non', cand: c({ statut: 'Invité Google Play', exportGooglePlay: true }), attendu: false },
  { nom: 'sans email GP → non', cand: c({ statut: 'Accepté', emailGooglePlay: '' }), attendu: false },
]

let ko = 0
for (const t of cases) {
  try {
    assert.equal(aExporterGooglePlay(t.cand), t.attendu)
    console.log(`✓ ${t.nom}`)
  } catch {
    ko++
    console.error(`✕ ${t.nom}`)
  }
}
if (ko) { console.error(`${ko} échec(s)`); process.exit(1) }
console.log('Tous les tests passent.')
