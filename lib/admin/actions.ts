'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/admin/auth'
import { getCandidature, prop, queryCandidatures, updatePage, type StatutCandidature } from '@/lib/admin/notion'
import { sendBrevo } from '@/lib/admin/brevo'
import { confirmationInstallEmail, demandeEmailGPEmail, invitationEmail, refusEmail, relanceEmail } from '@/lib/admin/emails'
import { signCandidatureToken } from '@/lib/beta/token'
import { MOTIFS_REFUS, type MotifRefusKey } from '@/lib/admin/refus'
import { fetchLatestReplyTextFrom } from '@/lib/admin/imap'
import { extractEmailGP } from '@/lib/admin/extractEmailGP'

export type ActionResult = { ok: true } | { ok: false; error: string }

export interface BatchItemResult {
  id: string
  prenom: string
  ok: boolean
  error?: string
  info?: string
}

export interface BatchReport {
  ok: boolean
  results: BatchItemResult[]
}

const ADMIN_PATH = '/admin/candidatures'

function fail(e: unknown): { ok: false; error: string } {
  console.error('[admin]', e)
  return { ok: false, error: e instanceof Error ? e.message : 'Erreur interne' }
}

// ── Qualification ─────────────────────────────────────────────────────────────

/** Change le statut. À l'acceptation, pré-remplit Email Google Play avec l'email
 *  de candidature SEULEMENT si c'est une adresse Gmail (les autres ne sont
 *  souvent pas des comptes Google — Play Console les refuse) ; sinon le champ
 *  reste vide et le bouton « Demander email GP » prend le relais. */
export async function qualifier(id: string, statut: StatutCandidature): Promise<ActionResult> {
  await requireAdmin()
  try {
    const props: Record<string, unknown> = { Statut: prop.select(statut) }
    if (statut === 'Accepté') {
      const c = await getCandidature(id)
      if (!c.emailGooglePlay && c.email && /@(gmail|googlemail)\.com$/i.test(c.email)) {
        props['Email Google Play'] = prop.email(c.email)
      }
    }
    await updatePage(id, props)
    revalidatePath(ADMIN_PATH)
    return { ok: true }
  } catch (e) {
    return fail(e)
  }
}

export async function setPriorite(id: string, priorite: string): Promise<ActionResult> {
  await requireAdmin()
  try {
    await updatePage(id, { 'Priorité bêta': prop.select(priorite) })
    revalidatePath(ADMIN_PATH)
    return { ok: true }
  } catch (e) {
    return fail(e)
  }
}

export async function setCanal(id: string, canal: string): Promise<ActionResult> {
  await requireAdmin()
  try {
    await updatePage(id, { 'Canal de recrutement': prop.select(canal) })
    revalidatePath(ADMIN_PATH)
    return { ok: true }
  } catch (e) {
    return fail(e)
  }
}

export async function setEmailGooglePlay(id: string, value: string): Promise<ActionResult> {
  await requireAdmin()
  try {
    await updatePage(id, { 'Email Google Play': prop.email(value.trim()) })
    revalidatePath(ADMIN_PATH)
    return { ok: true }
  } catch (e) {
    return fail(e)
  }
}

// ── Invitations / relances (batch séquentiel, un échec ne bloque pas) ─────────

export async function envoyerInvitations(ids: string[]): Promise<BatchReport> {
  await requireAdmin()
  const results: BatchItemResult[] = []
  for (const id of ids) {
    let prenom = id
    try {
      // Garde-fou serveur : on relit l'état réel juste avant l'envoi.
      const c = await getCandidature(id)
      prenom = c.prenom || id
      if (c.statut !== 'Accepté') throw new Error(`statut « ${c.statut} » — seuls les Acceptés sont invitables`)
      if (c.invitationEnvoyee) throw new Error('invitation déjà envoyée')
      if (!c.emailGooglePlay) throw new Error('Email Google Play manquant')

      const { subject, html } = invitationEmail({ prenom: c.prenom, emailGooglePlay: c.emailGooglePlay })
      await sendBrevo({ email: c.emailGooglePlay, name: c.prenom }, subject, html)

      try {
        await updatePage(id, {
          'Invitation envoyée': prop.checkbox(true),
          'Lien de téléchargement envoyé': prop.checkbox(true),
          'Date invitation envoyée': prop.dateToday(),
          'Statut': prop.select('Invité Google Play'),
        })
      } catch (notionErr) {
        // Email parti mais Notion KO : signaler explicitement, ne pas masquer.
        throw new Error(`email envoyé MAIS mise à jour Notion échouée — corriger à la main (${notionErr instanceof Error ? notionErr.message : notionErr})`)
      }
      results.push({ id, prenom, ok: true })
    } catch (e) {
      console.error('[admin] invitation', id, e)
      results.push({ id, prenom, ok: false, error: e instanceof Error ? e.message : 'Erreur interne' })
    }
  }
  revalidatePath(ADMIN_PATH)
  return { ok: results.every((r) => r.ok), results }
}

/** Email « candidature acceptée » : demande l'adresse du compte Google
 *  (Play Store) + lien du groupe WhatsApp. Envoyé sur l'email de candidature. */
export async function envoyerDemandesEmailGP(ids: string[]): Promise<BatchReport> {
  await requireAdmin()
  const results: BatchItemResult[] = []
  for (const id of ids) {
    let prenom = id
    try {
      const c = await getCandidature(id)
      prenom = c.prenom || id
      if (c.statut !== 'Accepté') throw new Error(`statut « ${c.statut} » — réservé aux Acceptés`)
      if (c.emailGooglePlay) throw new Error('Email Google Play déjà renseigné — passez à l’invitation')
      if (c.emailGPDemande) throw new Error('demande déjà envoyée')
      if (!c.email) throw new Error('aucun email de candidature')

      const { subject, html } = demandeEmailGPEmail({ prenom: c.prenom })
      await sendBrevo({ email: c.email, name: c.prenom }, subject, html)

      try {
        await updatePage(id, {
          'Email GP demandé': prop.checkbox(true),
          'Date demande email GP': prop.dateToday(),
        })
      } catch (notionErr) {
        throw new Error(`email envoyé MAIS mise à jour Notion échouée — corriger à la main (${notionErr instanceof Error ? notionErr.message : notionErr})`)
      }
      results.push({ id, prenom, ok: true })
    } catch (e) {
      console.error('[admin] demande email GP', id, e)
      results.push({ id, prenom, ok: false, error: e instanceof Error ? e.message : 'Erreur interne' })
    }
  }
  revalidatePath(ADMIN_PATH)
  return { ok: results.every((r) => r.ok), results }
}

export async function envoyerRelances(ids: string[]): Promise<BatchReport> {
  await requireAdmin()
  const results: BatchItemResult[] = []
  for (const id of ids) {
    let prenom = id
    try {
      const c = await getCandidature(id)
      prenom = c.prenom || id
      if (!c.invitationEnvoyee) throw new Error('invitation pas encore envoyée')
      if (c.relanceEnvoyee) throw new Error('relance déjà envoyée')
      const dest = c.emailGooglePlay || c.email
      if (!dest) throw new Error('aucun email')

      const { subject, html } = relanceEmail({ prenom: c.prenom })
      await sendBrevo({ email: dest, name: c.prenom }, subject, html)

      try {
        await updatePage(id, {
          'Relance envoyée': prop.checkbox(true),
          'Date relance': prop.dateToday(),
        })
      } catch (notionErr) {
        throw new Error(`email envoyé MAIS mise à jour Notion échouée — corriger à la main (${notionErr instanceof Error ? notionErr.message : notionErr})`)
      }
      results.push({ id, prenom, ok: true })
    } catch (e) {
      console.error('[admin] relance', id, e)
      results.push({ id, prenom, ok: false, error: e instanceof Error ? e.message : 'Erreur interne' })
    }
  }
  revalidatePath(ADMIN_PATH)
  return { ok: results.every((r) => r.ok), results }
}

/** Campagne « as-tu installé l'app ? » : email aux invités avec deux liens signés
 *  (installée / problème). Réservé au statut « Invité Google Play », une fois par candidat. */
export async function envoyerConfirmations(ids: string[]): Promise<BatchReport> {
  await requireAdmin()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  if (!siteUrl) {
    return { ok: false, results: [{ id: 'env', prenom: 'Config', ok: false, error: 'NEXT_PUBLIC_SITE_URL manquant' }] }
  }
  const base = siteUrl.replace(/\/$/, '')
  const results: BatchItemResult[] = []
  for (const id of ids) {
    let prenom = id
    try {
      const c = await getCandidature(id)
      prenom = c.prenom || id
      if (c.statut !== 'Invité Google Play') throw new Error(`statut « ${c.statut} » — réservé aux invités`)
      if (c.confirmationDemandee) throw new Error('demande de confirmation déjà envoyée')
      const dest = c.emailGooglePlay || c.email
      if (!dest) throw new Error('aucun email')

      const token = encodeURIComponent(signCandidatureToken(id))
      const { subject, html } = confirmationInstallEmail(
        { prenom: c.prenom },
        `${base}/beta/installee?t=${token}`,
        `${base}/beta/probleme?t=${token}`,
      )
      await sendBrevo({ email: dest, name: c.prenom }, subject, html)
      try {
        await updatePage(id, {
          'Confirmation demandée': prop.checkbox(true),
          'Date confirmation demandée': prop.dateToday(),
        })
      } catch (notionErr) {
        throw new Error(`email envoyé MAIS mise à jour Notion échouée — corriger à la main (${notionErr instanceof Error ? notionErr.message : notionErr})`)
      }
      results.push({ id, prenom, ok: true })
    } catch (e) {
      console.error('[admin] confirmation install', id, e)
      results.push({ id, prenom, ok: false, error: e instanceof Error ? e.message : 'Erreur interne' })
    }
  }
  revalidatePath(ADMIN_PATH)
  return { ok: results.every((r) => r.ok), results }
}

// ── Refus avec motif ──────────────────────────────────────────────────────────

/** Refus en lot avec motif : Notion d'abord (statut + motif), mail ensuite.
 *  Ordre inverse des invitations : un refusé sans mail se rattrape à la main,
 *  alors qu'un mail de refus parti pour un candidat resté « Nouveau » ne se
 *  rattrape pas. */
export async function refuser(
  ids: string[],
  motifKey: MotifRefusKey,
  envoyerEmail: boolean,
): Promise<BatchReport> {
  await requireAdmin()
  const motif = MOTIFS_REFUS.find((m) => m.key === motifKey)
  if (!motif) {
    return { ok: false, results: ids.map((id) => ({ id, prenom: id, ok: false, error: `motif inconnu : ${motifKey}` })) }
  }
  const results: BatchItemResult[] = []
  for (const id of ids) {
    let prenom = id
    try {
      const c = await getCandidature(id)
      prenom = c.prenom || id
      await updatePage(id, {
        'Statut': prop.select('Refusé'),
        'Motif refus': prop.select(motif.label),
      })
      if (!envoyerEmail) {
        results.push({ id, prenom, ok: true, info: 'refusé sans mail (choix admin)' })
        continue
      }
      if (!c.email) {
        results.push({ id, prenom, ok: true, info: 'refusé — aucun email de candidature, mail non envoyé' })
        continue
      }
      try {
        const { subject, html } = refusEmail({ prenom: c.prenom }, motif)
        await sendBrevo({ email: c.email, name: c.prenom }, subject, html)
      } catch (brevoErr) {
        // Notion déjà à jour : signaler explicitement que seul le mail a échoué.
        throw new Error(`statut mis à jour MAIS mail de refus non envoyé (${brevoErr instanceof Error ? brevoErr.message : brevoErr})`)
      }
      results.push({ id, prenom, ok: true })
    } catch (e) {
      console.error('[admin] refus', id, e)
      results.push({ id, prenom, ok: false, error: e instanceof Error ? e.message : 'Erreur interne' })
    }
  }
  revalidatePath(ADMIN_PATH)
  return { ok: results.every((r) => r.ok), results }
}

// ── Relève des réponses email Google Play ─────────────────────────────────────

/** Lit la boîte IMAP et remplit « Email Google Play » pour les candidats
 *  Acceptés dont la demande est partie et le champ encore vide. Jamais
 *  d'écrasement ; l'envoi de l'invitation reste un geste manuel. */
export async function releverReponsesGP(): Promise<BatchReport> {
  await requireAdmin()
  const results: BatchItemResult[] = []
  try {
    const candidats = (await queryCandidatures()).filter(
      (c) => c.statut === 'Accepté' && c.emailGPDemande && !c.emailGooglePlay && c.email,
    )
    if (candidats.length === 0) return { ok: true, results: [] }

    const replies = await fetchLatestReplyTextFrom(
      candidats.map((c) => ({
        email: c.email,
        since: c.dateDemandeGP ? new Date(c.dateDemandeGP) : c.dateCandidature ? new Date(c.dateCandidature) : undefined,
      })),
    )

    for (const c of candidats) {
      const prenom = c.prenom || c.id
      try {
        const body = replies.get(c.email.toLowerCase())
        if (body === undefined) {
          results.push({ id: c.id, prenom, ok: true, info: 'pas encore de réponse' })
          continue
        }
        const extrait = extractEmailGP(body, c.email)
        if (!extrait) {
          results.push({ id: c.id, prenom, ok: true, info: 'réponse reçue mais aucune adresse détectée — à saisir manuellement' })
          continue
        }
        if ('ambigu' in extrait) {
          results.push({ id: c.id, prenom, ok: true, info: `à vérifier manuellement — ${extrait.ambigu}` })
          continue
        }
        await updatePage(c.id, { 'Email Google Play': prop.email(extrait.email) })
        results.push({ id: c.id, prenom, ok: true, info: `rempli : ${extrait.email}` })
      } catch (e) {
        console.error('[admin] relève GP', c.id, e)
        results.push({ id: c.id, prenom, ok: false, error: e instanceof Error ? e.message : 'Erreur interne' })
      }
    }
  } catch (e) {
    // Connexion IMAP ou lecture Notion KO : rien n'a été modifié, le signaler tel quel.
    console.error('[admin] relève GP', e)
    return { ok: false, results: [{ id: 'imap', prenom: 'Connexion', ok: false, error: e instanceof Error ? e.message : 'Erreur interne' }] }
  }
  revalidatePath(ADMIN_PATH)
  return { ok: results.every((r) => r.ok), results }
}

// ── Statuts en lot ────────────────────────────────────────────────────────────

export async function marquerActifs(ids: string[]): Promise<ActionResult> {
  await requireAdmin()
  try {
    for (const id of ids) await updatePage(id, { Statut: prop.select('Actif') })
    revalidatePath(ADMIN_PATH)
    return { ok: true }
  } catch (e) {
    return fail(e)
  }
}

export async function qualifierEnLot(ids: string[], statut: StatutCandidature): Promise<ActionResult> {
  await requireAdmin()
  try {
    for (const id of ids) {
      const r = await qualifier(id, statut)
      if (!r.ok) return r
    }
    return { ok: true }
  } catch (e) {
    return fail(e)
  }
}

// ── Export Google Play ────────────────────────────────────────────────────────

export async function marquerExportes(ids: string[]): Promise<ActionResult> {
  await requireAdmin()
  try {
    for (const id of ids) await updatePage(id, { 'Export Google Play': prop.checkbox(true) })
    revalidatePath('/admin/candidatures/export')
    revalidatePath(ADMIN_PATH)
    return { ok: true }
  } catch (e) {
    return fail(e)
  }
}

// ── Feedbacks ─────────────────────────────────────────────────────────────────

export async function majFeedback(
  id: string,
  champs: { statut?: string; impact?: string; priorite?: string },
): Promise<ActionResult> {
  await requireAdmin()
  try {
    const props: Record<string, unknown> = {}
    if (champs.statut) props['Statut'] = prop.select(champs.statut)
    if (champs.impact) props['Impact'] = prop.select(champs.impact)
    if (champs.priorite) props['Priorité'] = prop.select(champs.priorite)
    if (Object.keys(props).length === 0) return { ok: true }
    await updatePage(id, props)
    revalidatePath('/admin/feedbacks')
    return { ok: true }
  } catch (e) {
    return fail(e)
  }
}
