// Extraction de l'adresse Google depuis la réponse d'un candidat à la demande
// d'email Google Play. Fonction pure — aucune dépendance réseau.
// Testée par scripts/test-extract-email-gp.ts.

const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g
const VALID_EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Nos adresses, présentes dans les citations « Le … a écrit : » — toujours ignorées. */
const NOS_ADRESSES = new Set(['seascope-contact@pennarstudio.fr', 'contact@pennarstudio.fr'])

const isGmail = (e: string) => /@(gmail|googlemail)\.com$/i.test(e)

export type ExtractResult =
  | { email: string }   // adresse retenue avec confiance
  | { ambigu: string }  // réponse trouvée mais douteuse — traitement manuel
  | null                // rien d'exploitable

export function extractEmailGP(body: string, fromAddress: string): ExtractResult {
  const from = fromAddress.toLowerCase()
  // L'adresse de candidature du candidat est aussi exclue du corps (citations) :
  // si elle est gmail, la règle « expéditeur gmail » ci-dessous la rattrape.
  const found = [...new Set((body.match(EMAIL_RE) ?? []).map((e) => e.toLowerCase()))]
    .filter((e) => !NOS_ADRESSES.has(e) && e !== from && VALID_EMAIL_RE.test(e))

  const gmail = found.find(isGmail)
  if (gmail) return { email: gmail }
  if (found.length === 1) return { email: found[0] }              // compte Google Workspace possible
  if (found.length === 0 && isGmail(from) && VALID_EMAIL_RE.test(from)) return { email: from } // « c'est cette adresse »
  if (found.length > 1) return { ambigu: `plusieurs adresses trouvées : ${found.join(', ')}` }
  return null
}
