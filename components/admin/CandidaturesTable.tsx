'use client'

import { useState, useTransition } from 'react'
import StatutChip from '@/components/admin/StatutChip'
import EmailModal, { type ModalState } from '@/components/admin/EmailModal'
import {
  envoyerConfirmations, envoyerDemandesEmailGP, envoyerInvitations, envoyerRelances, marquerActifs, offrirPremiumPlus, qualifier, qualifierEnLot, refuser, relancerDemandesEmailGP, releverReponsesGP,
  setCanal, setEmailGooglePlay, setPriorite, type BatchReport,
} from '@/lib/admin/actions'
import type { Row, TabKey } from '@/app/admin/(protected)/candidatures/page'
import RefusDialog from '@/components/admin/RefusDialog'
import type { MotifRefusKey } from '@/lib/admin/refus'

const CANAUX = ['', 'LinkedIn', 'Facebook', 'Hisse Et Oh', 'Bouche-à-oreille', 'Autre']
const PRIORITES = ['', 'Haute', 'Moyenne', 'Basse']

export default function CandidaturesTable({
  rows, tab, previewInvitation, previewRelance, previewDemande, previewRelanceGP, previewConfirmation, previewsRefus,
}: {
  rows: Row[]
  tab: TabKey
  previewInvitation: string
  previewRelance: string
  previewDemande: string
  previewRelanceGP: string
  previewConfirmation: string
  previewsRefus: Record<MotifRefusKey, string>
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [modal, setModal] = useState<ModalState | null>(null)
  const [report, setReport] = useState<BatchReport | null>(null)
  const [refusTargets, setRefusTargets] = useState<Row[] | null>(null)
  const [refusReport, setRefusReport] = useState<BatchReport | null>(null)
  const [releveReport, setReleveReport] = useState<BatchReport | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) =>
    startTransition(async () => {
      setError(null)
      const r = await fn()
      if (!r.ok) setError(r.error ?? 'Erreur')
      setSelected(new Set())
    })

  const toggle = (id: string) =>
    setSelected((s) => {
      const next = new Set(s)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const toggleAll = () =>
    setSelected((s) => (s.size === rows.length ? new Set() : new Set(rows.map((r) => r.id))))

  const openModal = (mode: ModalState['mode'], targets: Row[]) => {
    setReport(null)
    setModal({
      mode,
      // Les demandes GP (première et relance) partent sur l'email de candidature ; le reste sur l'email Google Play.
      recipients: targets.map((r) => ({
        id: r.id,
        prenom: r.prenom,
        email: (mode === 'demande' || mode === 'relanceGP') ? r.email : r.emailGooglePlay || r.email,
      })),
    })
  }

  const batchActions: Record<ModalState['mode'], (ids: string[]) => Promise<BatchReport>> = {
    invitation: envoyerInvitations,
    relance: envoyerRelances,
    demande: envoyerDemandesEmailGP,
    relanceGP: relancerDemandesEmailGP,
    confirmation: envoyerConfirmations,
  }

  const confirmModal = () => {
    if (!modal) return
    startTransition(async () => {
      const ids = modal.recipients.map((r) => r.id)
      const rep = await batchActions[modal.mode](ids)
      setReport(rep)
      setSelected(new Set())
    })
  }

  const confirmRefus = (motif: MotifRefusKey, envoyerEmail: boolean) => {
    if (!refusTargets) return
    startTransition(async () => {
      const rep = await refuser(refusTargets.map((r) => r.id), motif, envoyerEmail)
      setRefusReport(rep)
      setSelected(new Set())
    })
  }

  const relever = () =>
    startTransition(async () => {
      setError(null)
      setReleveReport(null)
      setReleveReport(await releverReponsesGP())
    })

  const selRows = rows.filter((r) => selected.has(r.id))

  return (
    <div className="rounded-b-ss rounded-tr-ss bg-ss-bg-2 pb-2">
      {error && (
        <p className="mx-4 mt-3 rounded-md border border-ss-deconseille/40 bg-ss-deconseille/10 px-4 py-2 text-sm text-ss-deconseille">
          {error}
        </p>
      )}
      {tab === 'emailgp' && (
        <div className="mx-4 mt-3">
          <div className="flex items-center gap-3">
            <BulkBtn kind="primary" label={pending ? '↻ Relève en cours…' : '↻ Relever les réponses'} disabled={pending} onClick={relever} />
            <span className="text-[11px] text-ss-fg/50">Lit la boîte contact@ et remplit les emails Google Play trouvés dans les réponses.</span>
          </div>
          {releveReport && (
            <div className="mt-2 space-y-1 rounded-ss bg-ss-surface-2 px-4 py-3 text-[13px]">
              <p className="mb-1 font-semibold">
                {releveReport.results.length === 0 ? 'Aucun candidat en attente de réponse.' : releveReport.ok ? 'Relève terminée' : '⚠️ Relève terminée avec erreurs'}
              </p>
              {releveReport.results.map((r) => (
                <p key={r.id} className={!r.ok ? 'text-ss-deconseille' : r.info?.startsWith('rempli') ? 'text-ss-bon' : 'text-ss-fg/70'}>
                  {!r.ok ? '✕' : r.info?.startsWith('rempli') ? '✓' : '·'} {r.prenom}{r.error ? ` — ${r.error}` : ''}{r.info ? ` — ${r.info}` : ''}
                </p>
              ))}
              <button onClick={() => setReleveReport(null)} className="mt-1 text-xs text-ss-fg/50 underline">Fermer</button>
            </div>
          )}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-white/10 text-left text-[11px] uppercase tracking-wide text-ss-fg/50">
              <th className="w-9 px-3 py-2.5">
                <input type="checkbox" className="accent-ss-teal" checked={rows.length > 0 && selected.size === rows.length} onChange={toggleAll} />
              </th>
              <th className="px-3 py-2.5">Candidat</th>
              <th className="px-3 py-2.5">Profil</th>
              <th className="px-3 py-2.5">Email Google Play</th>
              <th className="px-3 py-2.5">Priorité</th>
              {tab === 'traiter' && <th className="px-3 py-2.5">Canal</th>}
              <th className="px-3 py-2.5">Statut</th>
              <th className="min-w-[240px] px-3 py-2.5">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={tab === 'traiter' ? 8 : 7} className="px-4 py-8 text-center text-ss-fg/50">Aucune candidature dans cet onglet.</td></tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} className={`border-b border-white/5 align-middle ${selected.has(r.id) ? 'bg-ss-teal/5' : ''}`}>
                <td className="px-3 py-3">
                  <input type="checkbox" className="accent-ss-teal" checked={selected.has(r.id)} onChange={() => toggle(r.id)} />
                </td>
                <td className="px-3 py-3">
                  <b>{r.prenom}</b>
                  {r.aRelancer && <span className="ml-2 text-[10px] text-ss-variable">⚠ J+{r.joursDepuisInvitation} sans retour</span>}
                  <br />
                  <span className="text-xs text-ss-fg/55">{r.email} · {r.region}</span>
                </td>
                <td className="px-3 py-3">
                  {r.typeNav} · {r.frequence}
                  <br /><span className="text-xs text-ss-fg/55">{r.pratique}</span>
                </td>
                <td className="px-3 py-3">
                  <input
                    key={`gp-${r.emailGooglePlay}`}
                    type="email"
                    defaultValue={r.emailGooglePlay}
                    placeholder="—"
                    onBlur={(e) => {
                      if (e.target.value.trim() !== r.emailGooglePlay) run(() => setEmailGooglePlay(r.id, e.target.value))
                    }}
                    className="w-44 rounded-md border border-ss-teal/25 bg-ss-surface px-2 py-1 text-xs outline-none focus:border-ss-teal"
                  />
                </td>
                <td className="px-3 py-3">
                  <select
                    key={`prio-${r.priorite}`}
                    defaultValue={r.priorite}
                    onChange={(e) => run(() => setPriorite(r.id, e.target.value))}
                    className="rounded-md border border-white/15 bg-ss-surface px-1.5 py-1 text-xs"
                  >
                    {PRIORITES.map((p) => <option key={p} value={p}>{p || '—'}</option>)}
                  </select>
                </td>
                {tab === 'traiter' && (
                  <td className="px-3 py-3">
                    <select
                      key={`canal-${r.canal}`}
                      defaultValue={r.canal}
                      onChange={(e) => run(() => setCanal(r.id, e.target.value))}
                      className="rounded-md border border-white/15 bg-ss-surface px-1.5 py-1 text-xs"
                    >
                      {CANAUX.map((c) => <option key={c} value={c}>{c || '—'}</option>)}
                    </select>
                    {r.canalAutre && <><br /><span className="text-[11px] text-ss-fg/50">« {r.canalAutre} »</span></>}
                  </td>
                )}
                <td className="px-3 py-3">
                  <StatutChip statut={r.statut} />
                  {r.statut === 'Refusé' && r.motifRefus && <><br /><span className="text-[11px] text-ss-deconseille/80">motif : {r.motifRefus}</span></>}
                  {r.emailGPDemande && !r.emailGooglePlay && r.dateDemandeGP && <><br /><span className="text-[11px] text-ss-teal/80">email GP demandé le {r.dateDemandeGP}</span></>}
                  {r.dateInvitation && <><br /><span className="text-[11px] text-ss-fg/50">invité le {r.dateInvitation}</span></>}
                  {r.relanceEnvoyee && r.dateRelance && <><br /><span className="text-[11px] text-ss-variable/80">relancé le {r.dateRelance}</span></>}
                  {r.confirmationDemandee && r.dateConfirmationDemandee && <><br /><span className="text-[11px] text-ss-fg/50">confirmation demandée le {r.dateConfirmationDemandee}</span></>}
                </td>
                <td className="px-3 py-3">
                  <RowActions row={r} disabled={pending} onQualifier={(s) => run(() => qualifier(r.id, s))} onInvite={() => openModal('invitation', [r])} onRelance={() => openModal('relance', [r])} onActif={() => run(() => marquerActifs([r.id]))} onDemande={() => openModal('demande', [r])} onRelanceGP={() => openModal('relanceGP', [r])} onRefuser={() => { setRefusReport(null); setRefusTargets([r]) }} onConfirmation={() => openModal('confirmation', [r])} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected.size > 0 && (
        <div className="sticky bottom-3 mx-4 mt-3 flex items-center gap-2.5 rounded-ss border border-ss-teal/40 bg-ss-bg px-4 py-3 shadow-2xl">
          <span className="mr-2 text-[13px] font-bold text-ss-teal">{selected.size} sélectionné{selected.size > 1 ? 's' : ''}</span>
          {tab === 'traiter' && (
            <>
              <BulkBtn kind="ok" label="✓ Accepter la sélection" disabled={pending} onClick={() => run(() => qualifierEnLot([...selected], 'Accepté'))} />
              <BulkBtn kind="ko" label="✕ Refuser" disabled={pending} onClick={() => { setRefusReport(null); setRefusTargets(selRows) }} />
              <BulkBtn kind="neutral" label="⏸ En attente" disabled={pending} onClick={() => run(() => qualifierEnLot([...selected], 'En attente'))} />
            </>
          )}
          {tab === 'emailgp' && (
            <>
              <BulkBtn kind="warn" label="📮 Demander email GP" disabled={pending} onClick={() => {
                const targets = selRows.filter((r) => !r.emailGPDemande)
                if (targets.length === 0) { setError('Demande déjà envoyée à toute la sélection — utilisez le bouton Relancer'); return }
                openModal('demande', targets)
              }} />
              <BulkBtn kind="neutral" label="🔁 Relancer demande GP" disabled={pending} onClick={() => {
                const targets = selRows.filter((r) => r.emailGPDemande && !r.emailGooglePlay)
                if (targets.length === 0) { setError('Aucun sélectionné n\'a déjà reçu la demande initiale'); return }
                openModal('relanceGP', targets)
              }} />
            </>
          )}
          {tab === 'inviter' && (
            <BulkBtn kind="primary" label="✉️ Envoyer les invitations" disabled={pending} onClick={() => {
              const targets = selRows.filter((r) => r.emailGooglePlay)
              if (targets.length === 0) { setError('Aucun sélectionné n’a d’Email Google Play'); return }
              openModal('invitation', targets)
            }} />
          )}
          {(tab === 'invites' || tab === 'relancer') && (
            <>
              <BulkBtn kind="warn" label="🔁 Relancer la sélection" disabled={pending} onClick={() => {
                const targets = selRows.filter((r) => !r.relanceEnvoyee)
                if (targets.length === 0) { setError('Tous les sélectionnés ont déjà été relancés'); return }
                openModal('relance', targets)
              }} />
              <BulkBtn kind="ok" label="🟢 Marquer actifs" disabled={pending} onClick={() => run(() => marquerActifs([...selected]))} />
              {tab === 'invites' && (
                <BulkBtn kind="warn" label="📣 Demander confirmation" disabled={pending} onClick={() => {
                  const targets = selRows.filter((r) => r.statut === 'Invité Google Play' && !r.confirmationDemandee)
                  if (targets.length === 0) { setError('Confirmation déjà demandée à toute la sélection'); return }
                  openModal('confirmation', targets)
                }} />
              )}
            </>
          )}
          <BulkBtn kind="primary" label="🎁 Offrir Premium+" disabled={pending} onClick={() => {
            const targets = selRows.filter((r) => !r.premiumPlusOffert)
            if (targets.length === 0) { setError('Premium+ déjà offert à toute la sélection'); return }
            run(() => offrirPremiumPlus(targets.map((r) => r.id)))
          }} />
          <button onClick={() => setSelected(new Set())} className="ml-auto text-xs text-ss-fg/50 underline">
            Tout désélectionner
          </button>
        </div>
      )}

      {modal && (
        <EmailModal
          state={modal}
          previewHtml={modal.mode === 'invitation' ? previewInvitation : modal.mode === 'relance' ? previewRelance : modal.mode === 'confirmation' ? previewConfirmation : modal.mode === 'relanceGP' ? previewRelanceGP : previewDemande}
          sending={pending}
          report={report}
          onConfirm={confirmModal}
          onClose={() => { setModal(null); setReport(null) }}
        />
      )}
      {refusTargets && (
        <RefusDialog
          recipients={refusTargets.map((r) => ({ id: r.id, prenom: r.prenom, email: r.email }))}
          previews={previewsRefus}
          sending={pending}
          report={refusReport}
          onConfirm={confirmRefus}
          onClose={() => { setRefusTargets(null); setRefusReport(null) }}
        />
      )}
    </div>
  )
}

const btnStyles = {
  ok: 'border border-ss-bon/30 bg-ss-bon/15 text-ss-bon',
  ko: 'border border-ss-deconseille/25 bg-ss-deconseille/10 text-ss-deconseille',
  neutral: 'border border-gray-400/25 bg-gray-400/10 text-gray-300',
  primary: 'bg-ss-teal text-ss-bg',
  warn: 'border border-ss-variable/30 bg-ss-variable/15 text-ss-variable',
} as const

function BulkBtn({ kind, label, disabled, onClick }: { kind: keyof typeof btnStyles; label: string; disabled?: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} disabled={disabled} className={`rounded-md px-3 py-1.5 text-xs font-semibold disabled:opacity-40 ${btnStyles[kind]}`}>
      {label}
    </button>
  )
}

function RowActions({ row, disabled, onQualifier, onInvite, onRelance, onActif, onDemande, onRelanceGP, onRefuser, onConfirmation }: {
  row: Row
  disabled: boolean
  onQualifier: (s: 'Accepté' | 'En attente') => void
  onInvite: () => void
  onRelance: () => void
  onActif: () => void
  onDemande: () => void
  onRelanceGP: () => void
  onRefuser: () => void
  onConfirmation: () => void
}) {
  // Boutons explicites avec libellés (maquette v1 validée).
  if (['Nouveau', 'En cours', 'En attente'].includes(row.statut)) {
    return (
      <span className="flex flex-wrap gap-1.5">
        <BulkBtn kind="ok" label="✓ Accepter" disabled={disabled} onClick={() => onQualifier('Accepté')} />
        <BulkBtn kind="ko" label="✕ Refuser" disabled={disabled} onClick={onRefuser} />
        {row.statut !== 'En attente' && <BulkBtn kind="neutral" label="⏸ Attente" disabled={disabled} onClick={() => onQualifier('En attente')} />}
      </span>
    )
  }
  if (row.statut === 'Accepté') {
    if (row.invitationEnvoyee) return <BulkBtn kind="primary" label="✉️ Invité ✓" disabled onClick={() => {}} />
    return (
      <span className="flex flex-wrap gap-1.5">
        {!row.emailGooglePlay && (
          row.emailGPDemande
            ? <BulkBtn kind="neutral" label="🔁 Relancer" disabled={disabled} onClick={onRelanceGP} />
            : <BulkBtn kind="warn" label="📮 Demander email GP" disabled={disabled} onClick={onDemande} />
        )}
        <BulkBtn kind="primary" label="✉️ Envoyer invitation" disabled={disabled || !row.emailGooglePlay} onClick={onInvite} />
      </span>
    )
  }
  if (row.statut === 'Invité Google Play' || row.statut === 'Actif') {
    return (
      <span className="flex flex-wrap gap-1.5">
        {row.statut !== 'Actif' && <BulkBtn kind="ok" label="🟢 Marquer actif" disabled={disabled} onClick={onActif} />}
        {row.relanceEnvoyee
          ? <BulkBtn kind="warn" label="🔁 Relancé ✓" disabled onClick={() => {}} />
          : <BulkBtn kind="warn" label="🔁 Relancer" disabled={disabled} onClick={onRelance} />}
        {row.statut === 'Invité Google Play' && (
          row.confirmationDemandee
            ? <BulkBtn kind="warn" label="📣 Demandé ✓" disabled onClick={() => {}} />
            : <BulkBtn kind="warn" label="📣 Demander confirmation" disabled={disabled} onClick={onConfirmation} />
        )}
      </span>
    )
  }
  return null
}
