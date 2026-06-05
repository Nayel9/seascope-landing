// Tests de extractEmailGP (fonction pure, pas d'infra de test dans le repo).
// Usage: node --experimental-strip-types scripts/test-extract-email-gp.ts
import assert from 'node:assert/strict'
import { extractEmailGP } from '../lib/admin/extractEmailGP.ts'

const cases: Array<{ nom: string; body: string; from: string; attendu: ReturnType<typeof extractEmailGP> }> = [
  { nom: 'gmail simple', body: "Bonjour, mon compte : jean.nav@gmail.com — merci !", from: 'jean@hotmail.fr', attendu: { email: 'jean.nav@gmail.com' } },
  { nom: 'googlemail', body: 'voilà : skipper@googlemail.com', from: 'x@orange.fr', attendu: { email: 'skipper@googlemail.com' } },
  { nom: 'casse mélangée + citation de notre adresse', body: "Mon adresse Google : Marin.Breton@GMAIL.com\n\nLe mer. 4 juin, seascope-contact@pennarstudio.fr a écrit :\n> il nous faut l'adresse de votre compte", from: 'marin@free.fr', attendu: { email: 'marin.breton@gmail.com' } },
  { nom: 'réponse sans adresse depuis un gmail', body: "C'est cette adresse 👍", from: 'paul.mer@gmail.com', attendu: { email: 'paul.mer@gmail.com' } },
  { nom: 'workspace unique (non-gmail)', body: 'mon compte google : moi@mondomaine.bzh', from: 'moi@hotmail.fr', attendu: { email: 'moi@mondomaine.bzh' } },
  { nom: 'sa propre adresse citée ne compte pas', body: 'De : yann@hotmail.fr\nOui bien sûr !', from: 'yann@hotmail.fr', attendu: null },
  { nom: 'multi non-gmail ambigu', body: 'a@domaine1.fr ou b@domaine2.fr ?', from: 'c@orange.fr', attendu: { ambigu: 'plusieurs adresses trouvées : a@domaine1.fr, b@domaine2.fr' } },
  { nom: "rien d'exploitable depuis non-gmail", body: 'Je vous renvoie ça vite promis', from: 'd@orange.fr', attendu: null },
  { nom: 'gmail prioritaire sur autre adresse', body: 'perso : x@monsite.fr mais pour Google Play : y@gmail.com', from: 'z@orange.fr', attendu: { email: 'y@gmail.com' } },
]

let ko = 0
for (const c of cases) {
  const r = extractEmailGP(c.body, c.from)
  try {
    assert.deepEqual(r, c.attendu)
    console.log(`✓ ${c.nom}`)
  } catch {
    ko++
    console.error(`✕ ${c.nom} — attendu ${JSON.stringify(c.attendu)}, obtenu ${JSON.stringify(r)}`)
  }
}
if (ko) { console.error(`${ko} échec(s)`); process.exit(1) }
console.log('Tous les tests passent.')
