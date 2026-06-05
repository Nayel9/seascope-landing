'use client'

import type { BatchReport } from '@/lib/admin/actions'

export interface ModalState {
  mode: 'invitation' | 'relance' | 'demande' | 'confirmation'
  recipients: Array<{ id: string; prenom: string; email: string }>
}

const modeLabels: Record<ModalState['mode'], string> = {
  invitation: 'invitation',
  relance: 'relance',
  demande: 'demande email GP',
  confirmation: 'demande de confirmation',
}

const modeEffects: Record<ModalState['mode'], string> = {
  invitation: 'Après envoi (par destinataire) : ☑ Invitation envoyée · ☑ Lien envoyé · 📅 Date du jour · Statut → Invité Google Play',
  relance: 'Après envoi (par destinataire) : ☑ Relance envoyée · 📅 Date relance = aujourd’hui',
  demande: 'Après envoi (par destinataire) : ☑ Email GP demandé · 📅 Date demande = aujourd’hui',
  confirmation: 'Après envoi (par destinataire) : ☑ Confirmation demandée · 📅 Date du jour — liens personnalisés par candidat',
}

export default function EmailModal({
  state, previewHtml, sending, report, onConfirm, onClose,
}: {
  state: ModalState
  previewHtml: string
  sending: boolean
  report: BatchReport | null
  onConfirm: () => void
  onClose: () => void
}) {
  const n = state.recipients.length
  const label = modeLabels[state.mode]

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/80 p-6" onClick={() => { if (!sending) onClose() }}>
      <div
        className="w-full max-w-2xl rounded-ss-lg border border-ss-teal/25 bg-ss-bg-2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-white/10 px-6 py-4 text-sm font-bold text-ss-teal">
          Aperçu — {n} {label}{n > 1 ? 's' : ''}
        </div>

        <div className="flex flex-wrap gap-2 px-6 pt-4">
          {state.recipients.map((r) => (
            <span key={r.id} className="rounded-full border border-ss-teal/20 bg-ss-surface-2 px-3.5 py-1 text-xs">
              <b className="text-ss-teal">{r.prenom}</b> · {r.email}
            </span>
          ))}
        </div>

        {report ? (
          <div className="m-6 space-y-1.5 rounded-ss bg-ss-surface-2 p-5 text-sm">
            <p className="mb-3 font-semibold">{report.ok ? '✅ Tous les envois ont réussi' : '⚠️ Certains envois ont échoué'}</p>
            {report.results.map((r) => (
              <p key={r.id} className={r.ok ? 'text-ss-bon' : 'text-ss-deconseille'}>
                {r.ok ? '✓' : '✕'} {r.prenom}{r.error ? ` — ${r.error}` : ''}
              </p>
            ))}
          </div>
        ) : (
          <iframe
            srcDoc={previewHtml}
            sandbox=""
            title="Aperçu email"
            className="m-6 h-96 w-[calc(100%-3rem)] rounded-ss border border-white/10 bg-white"
          />
        )}

        <div className="flex items-center gap-2.5 px-6 pb-5">
          {!report && (
            <span className="mr-auto text-[11px] leading-relaxed text-ss-fg/60">
              {modeEffects[state.mode]}
              <br />Envois séquentiels — un échec n’interrompt pas les suivants.
            </span>
          )}
          <button onClick={onClose} disabled={sending} className="ml-auto rounded-md border border-gray-400/25 bg-gray-400/10 px-4 py-2 text-xs font-semibold disabled:opacity-40">
            {report ? 'Fermer' : 'Annuler'}
          </button>
          {!report && (
            <button
              onClick={onConfirm}
              disabled={sending}
              className="rounded-md bg-ss-teal px-4 py-2 text-xs font-bold text-ss-bg disabled:opacity-50"
            >
              {sending ? 'Envoi…' : `Confirmer (${n} envoi${n > 1 ? 's' : ''})`}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
