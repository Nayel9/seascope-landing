'use client'

import { useState, useTransition } from 'react'
import { majFeedback } from '@/lib/admin/actions'
import type { Feedback } from '@/lib/admin/notion'

const IMPACTS = ['', 'Bloquant', 'Gênant', 'Mineur']
const PRIORITES = ['', 'P0', 'P1', 'P2', 'P3']
const STATUTS = ['Nouveau', 'À investiguer', 'En cours', 'Résolu', 'Ignoré']

const typeStyles: Record<string, string> = {
  'Bug': 'bg-ss-deconseille/12 text-ss-deconseille',
  'Incohérence météo': 'bg-purple-400/15 text-purple-400',
  'Problème de confiance': 'bg-pink-400/15 text-pink-400',
  'Recommandation incorrecte': 'bg-ss-delicat/15 text-ss-delicat',
  'Donnée manquante': 'bg-ss-variable/15 text-ss-variable',
  'Interface confuse': 'bg-blue-400/15 text-blue-400',
  'Suggestion': 'bg-ss-bon/15 text-ss-bon',
}

function Sel({ value, options, onChange, disabled }: { value: string; options: string[]; onChange: (v: string) => void; disabled: boolean }) {
  return (
    <select
      defaultValue={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-md border border-white/15 bg-ss-surface px-1.5 py-1 text-xs disabled:opacity-40"
    >
      {options.map((o) => <option key={o} value={o}>{o || '—'}</option>)}
    </select>
  )
}

export default function FeedbackRow({ fb }: { fb: Feedback }) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const update = (champs: { statut?: string; impact?: string; priorite?: string }) =>
    startTransition(async () => {
      setError(null)
      const r = await majFeedback(fb.id, champs)
      if (!r.ok) setError(r.error ?? 'Erreur')
    })

  return (
    <tr className="border-b border-white/5 align-top">
      <td className="px-3 py-3">
        <b>{fb.email}</b>
        <br /><span className="text-[11px] text-ss-fg/50">{fb.date}{fb.spot ? ` · ${fb.spot}` : ''}</span>
        {error && <p className="mt-1 text-[11px] text-ss-deconseille">{error}</p>}
      </td>
      <td className="px-3 py-3">
        <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${typeStyles[fb.typeRetour] ?? 'bg-gray-400/15 text-gray-400'}`}>
          {fb.typeRetour || '—'}
        </span>
      </td>
      <td className="max-w-[320px] px-3 py-3 text-xs text-ss-fg/65">
        {fb.description.length > 140 ? `${fb.description.slice(0, 140)}…` : fb.description || '—'}
      </td>
      <td className="px-3 py-3"><Sel key={`impact-${fb.impact}`} value={fb.impact} options={IMPACTS} disabled={pending} onChange={(v) => update({ impact: v })} /></td>
      <td className="px-3 py-3"><Sel key={`prio-${fb.priorite}`} value={fb.priorite} options={PRIORITES} disabled={pending} onChange={(v) => update({ priorite: v })} /></td>
      <td className="px-3 py-3"><Sel key={`statut-${fb.statut}`} value={fb.statut} options={STATUTS} disabled={pending} onChange={(v) => update({ statut: v })} /></td>
      <td className="px-3 py-3">
        <a href={fb.notionUrl} target="_blank" rel="noreferrer" className="text-xs text-ss-teal hover:underline">Notion ↗</a>
      </td>
    </tr>
  )
}
