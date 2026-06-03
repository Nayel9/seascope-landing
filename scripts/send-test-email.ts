// Envoi de test du template « demande email Google » vers OWNER_EMAIL.
// Usage: node --experimental-strip-types scripts/send-test-email.ts
import { demandeEmailGPEmail } from '../lib/admin/emails.ts'
import { sendBrevo } from '../lib/admin/brevo.ts'

const dest = process.env.OWNER_EMAIL
if (!dest) throw new Error('OWNER_EMAIL manquant')

const { subject, html } = demandeEmailGPEmail({ prenom: 'Nayel (test)' })
await sendBrevo({ email: dest, name: 'Test SeaScope' }, `[TEST] ${subject}`, html)
console.log(`Envoyé à ${dest} — sujet: [TEST] ${subject}`)
