// Rendu local des templates emails admin pour aperçu (node --experimental-strip-types).
// Usage: node scripts/render-emails.ts (env GOOGLE_PLAY_URL etc. requis)
import { writeFileSync, mkdirSync } from 'node:fs'
import { demandeEmailGPEmail, invitationEmail, relanceEmail, refusEmail } from '../lib/admin/emails.ts'
import { MOTIFS_REFUS } from '../lib/admin/refus.ts'

mkdirSync('.playwright-mcp', { recursive: true })

const demande = demandeEmailGPEmail({ prenom: 'Camille' })
const invitation = invitationEmail({ prenom: 'Camille', emailGooglePlay: 'camille.nav@gmail.com' })
const relance = relanceEmail({ prenom: 'Camille' })

writeFileSync('.playwright-mcp/email-1-demande.html', demande.html)
writeFileSync('.playwright-mcp/email-2-invitation.html', invitation.html)
writeFileSync('.playwright-mcp/email-3-relance.html', relance.html)

console.log('1.', demande.subject)
console.log('2.', invitation.subject)
console.log('3.', relance.subject)

for (const m of MOTIFS_REFUS) {
  const e = refusEmail({ prenom: 'Camille' }, m)
  writeFileSync(`.playwright-mcp/email-refus-${m.key}.html`, e.html)
  console.log(`refus ${m.key}:`, e.subject)
}
