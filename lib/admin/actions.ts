'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/admin/auth'
import { getCandidature, prop, updatePage, type StatutCandidature } from '@/lib/admin/notion'
import { sendBrevo } from '@/lib/admin/brevo'
import { invitationEmail, relanceEmail } from '@/lib/admin/emails'

export type ActionResult = { ok: true } | { ok: false; error: string }

export interface BatchItemResult {
  id: string
  prenom: string
  ok: boolean
  error?: string
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
 *  de candidature si le champ est encore vide. */
export async function qualifier(id: string, statut: StatutCandidature): Promise<ActionResult> {
  await requireAdmin()
  try {
    const props: Record<string, unknown> = { Statut: prop.select(statut) }
    if (statut === 'Accepté') {
      const c = await getCandidature(id)
      if (!c.emailGooglePlay && c.email) props['Email Google Play'] = prop.email(c.email)
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
