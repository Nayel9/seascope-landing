'use server'

// Actions publiques des pages /beta/* — AUCUN requireAdmin : l'authentification
// est le token HMAC signé porté par le lien email. GET ne mute jamais (scanners) ;
// ces actions ne sont déclenchées que par un geste explicite du testeur.

import { revalidatePath } from 'next/cache'
import { verifyCandidatureToken } from '@/lib/beta/token'
import { createFeedbackInstallation, getCandidature, prop, updatePage } from '@/lib/admin/notion'
import { sendBrevo } from '@/lib/admin/brevo'
import { problemeInstallationOwnerEmail } from '@/lib/admin/emails'
import { ETAPES_PROBLEME } from '@/lib/beta/constantes'

export type EtatConfirmation = 'confirme' | 'deja' | 'neutre' | 'invalide' | 'erreur'

/** Le testeur confirme l'installation : Invité Google Play → Actif (idempotent). */
export async function confirmerInstallation(token: string): Promise<EtatConfirmation> {
  const id = verifyCandidatureToken(token)
  if (!id) return 'invalide'
  try {
    const c = await getCandidature(id)
    if (c.statut === 'Invité Google Play') {
      await updatePage(id, { Statut: prop.select('Actif') })
      revalidatePath('/admin/candidatures')
      return 'confirme'
    }
    if (c.statut === 'Actif') return 'deja'
    return 'neutre' // statut inattendu : on remercie sans rien changer
  } catch (e) {
    console.error('[beta] confirmation', e)
    return 'erreur'
  }
}

export interface ProblemePayload {
  etape: string
  description: string
  telephone?: string
}

/** Le testeur signale un problème : ticket dans la base feedbacks + notif admin.
 *  Le candidat reste « Invité Google Play ». */
export async function signalerProbleme(token: string, p: ProblemePayload): Promise<{ ok: boolean; error?: string }> {
  const id = verifyCandidatureToken(token)
  if (!id) return { ok: false, error: 'Lien invalide' }
  const etape = (ETAPES_PROBLEME as readonly string[]).includes(p.etape) ? p.etape : ''
  const description = (p.description ?? '').trim().slice(0, 2000)
  const telephone = (p.telephone ?? '').trim().slice(0, 100)
  if (!etape) return { ok: false, error: 'Indiquez l’étape qui bloque' }
  if (description.length < 10) return { ok: false, error: 'Description trop courte (min. 10 caractères)' }
  try {
    const c = await getCandidature(id)
    // Adresse de correspondance : la candidature d'abord (celle que le testeur lit
    // et depuis laquelle il répond), l'adresse Google Play en secours. Délibérément
    // différent du destinataire de la campagne (emailGooglePlay || email).
    const email = c.email || c.emailGooglePlay
    const texte = `[${etape}] ${description}${telephone ? `\nTéléphone : ${telephone}` : ''}`
    await createFeedbackInstallation(email, texte)
    const owner = process.env.OWNER_EMAIL
    if (owner) {
      const { subject, html } = problemeInstallationOwnerEmail({ prenom: c.prenom, email, etape, description, telephone: telephone || undefined })
      // La notif est best-effort : le ticket Notion est déjà créé, ne pas faire échouer le testeur.
      await sendBrevo({ email: owner }, subject, html).catch((e) => console.error('[beta] notif owner', e))
    }
    revalidatePath('/admin/feedbacks')
    return { ok: true }
  } catch (e) {
    console.error('[beta] problème', e)
    return { ok: false, error: 'Erreur interne — réessayez, ou répondez simplement au mail d’invitation' }
  }
}
