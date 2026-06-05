'use client'

import { useState } from 'react'
import { MOTIFS_REFUS, type MotifRefusKey } from '@/lib/admin/refus'
import type { BatchReport } from '@/lib/admin/actions'

export default function RefusDialog({
  recipients, previews, sending, report, onConfirm, onClose,
}: {
  recipients: Array<{ id: string; prenom: string; email: string }>
  previews: Record<MotifRefusKey, string>
  sending: boolean
  report: BatchReport | null
  onConfirm: (motif: MotifRefusKey, envoyerEmail: boolean) => void
  onClose: () => void
}) {
  const [motif, setMotif] = useState<MotifRefusKey>(MOTIFS_REFUS[0].key)
  const [envoyer, setEnvoyer] = useState(true)
  const n = recipients.length
  const sansEmail = recipients.filter((r) => !r.email)
  const motifLabel = MOTIFS_REFUS.find((m) => m.key === motif)?.label

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/80 p-6" onClick={() => { if (!sending) onClose() }}>
      <div className="w-full max-w-2xl rounded-ss-lg border border-ss-deconseille/30 bg-ss-bg-2" onClick={(e) => e.stopPropagation()}>
        <div className="border-b border-white/10 px-6 py-4 text-sm font-bold text-ss-deconseille">
          Refuser {n} candidature{n > 1 ? 's' : ''}
        </div>

        <div className="flex flex-wrap gap-2 px-6 pt-4">
          {recipients.map((r) => (
            <span key={r.id} className="rounded-full border border-ss-deconseille/20 bg-ss-surface-2 px-3.5 py-1 text-xs">
              <b className="text-ss-deconseille">{r.prenom}</b> · {r.email || 'aucun email'}
            </span>
          ))}
        </div>

        {report ? (
          <div className="m-6 space-y-1.5 rounded-ss bg-ss-surface-2 p-5 text-sm">
            <p className="mb-3 font-semibold">{report.ok ? '✅ Refus traités' : '⚠️ Certains refus ont échoué'}</p>
            {report.results.map((r) => (
              <p key={r.id} className={r.ok ? 'text-ss-bon' : 'text-ss-deconseille'}>
                {r.ok ? '✓' : '✕'} {r.prenom}
                {r.error ? ` — ${r.error}` : ''}
                {r.info ? ` — ${r.info}` : ''}
              </p>
            ))}
          </div>
        ) : (
          <>
            <div className="px-6 pt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ss-fg/50">Motif du refus</p>
              <div className="flex flex-wrap gap-2">
                {MOTIFS_REFUS.map((m) => (
                  <label
                    key={m.key}
                    className={`cursor-pointer rounded-md border px-3 py-1.5 text-xs font-semibold ${
                      motif === m.key
                        ? 'border-ss-deconseille/60 bg-ss-deconseille/15 text-ss-deconseille'
                        : 'border-white/15 bg-ss-surface text-ss-fg/70 hover:border-white/30'
                    }`}
                  >
                    <input type="radio" name="motif-refus" value={m.key} checked={motif === m.key} onChange={() => setMotif(m.key)} className="sr-only" />
                    {m.label}
                  </label>
                ))}
              </div>
              <label className="mt-3 flex items-center gap-2 text-xs text-ss-fg/70">
                <input type="checkbox" className="accent-ss-teal" checked={envoyer} onChange={(e) => setEnvoyer(e.target.checked)} />
                Envoyer le mail de refus {n > 1 ? 'aux candidats' : 'au candidat'}
              </label>
              {envoyer && sansEmail.length > 0 && (
                <p className="mt-2 text-[11px] text-ss-variable">
                  ⚠ {sansEmail.map((r) => r.prenom).join(', ')}&nbsp;: aucun email de candidature — refus enregistré sans envoi.
                </p>
              )}
              {envoyer && n > 1 && (
                <p className="mt-2 text-[11px] text-ss-fg/50">Aperçu générique — chaque mail sera personnalisé avec le prénom du candidat.</p>
              )}
            </div>
            {envoyer ? (
              <iframe
                srcDoc={previews[motif]}
                sandbox=""
                title="Aperçu email de refus"
                className="m-6 h-96 w-[calc(100%-3rem)] rounded-ss border border-white/10 bg-white"
              />
            ) : (
              <p className="m-6 rounded-ss bg-ss-surface-2 p-5 text-sm text-ss-fg/60">
                Aucun mail ne sera envoyé — seul le statut Notion passera à « Refusé » avec le motif.
              </p>
            )}
          </>
        )}

        <div className="flex items-center gap-2.5 px-6 pb-5">
          {!report && (
            <span className="mr-auto text-[11px] leading-relaxed text-ss-fg/60">
              Après confirmation (par candidat) : Statut → Refusé · Motif refus = « {motifLabel} »{envoyer ? ' · envoi du mail' : ''}
              <br />Traitement séquentiel — un échec n&apos;interrompt pas les suivants.
            </span>
          )}
          <button onClick={onClose} disabled={sending} className="ml-auto rounded-md border border-gray-400/25 bg-gray-400/10 px-4 py-2 text-xs font-semibold disabled:opacity-40">
            {report ? 'Fermer' : 'Annuler'}
          </button>
          {!report && (
            <button
              onClick={() => onConfirm(motif, envoyer)}
              disabled={sending}
              className="rounded-md bg-ss-deconseille px-4 py-2 text-xs font-bold text-white disabled:opacity-50"
            >
              {sending ? 'Traitement…' : envoyer ? `Refuser et envoyer (${n})` : `Refuser sans mail (${n})`}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
