'use client'

import { useState, useTransition } from 'react'
import { signalerProbleme } from '@/lib/beta/actions'
import { ETAPES_PROBLEME } from '@/lib/beta/constantes'

export default function ProblemeForm({ token, prenom }: { token: string; prenom: string }) {
  const [etape, setEtape] = useState('')
  const [description, setDescription] = useState('')
  const [telephone, setTelephone] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [envoye, setEnvoye] = useState(false)
  const [pending, start] = useTransition()

  if (envoye) {
    return (
      <div>
        <h1 className="text-[clamp(26px,3vw,36px)] leading-[1.15] tracking-[-0.02em] font-medium m-0">
          Bien reçu{prenom ? `, ${prenom}` : ''}&nbsp;!
        </h1>
        <p className="mt-4 text-[15px] leading-[1.7] text-ss-fg/72">
          Je regarde ça et je reviens vers vous rapidement par email pour vous débloquer.
        </p>
      </div>
    )
  }

  const submit = () =>
    start(async () => {
      setError(null)
      const r = await signalerProbleme(token, { etape, description, telephone: telephone || undefined })
      if (r.ok) setEnvoye(true)
      else setError(r.error ?? 'Erreur')
    })

  const inputCls = 'w-full rounded-lg border border-white/15 bg-ss-surface px-3.5 py-2.5 text-[15px] outline-none focus:border-ss-teal'

  return (
    <div>
      <h1 className="text-[clamp(26px,3vw,36px)] leading-[1.15] tracking-[-0.02em] font-medium m-0">
        Un souci avec la bêta&nbsp;?
      </h1>
      <p className="mt-4 text-[15px] leading-[1.7] text-ss-fg/72">
        Décrivez ce qui bloque{prenom ? `, ${prenom}` : ''} — on vous dépanne.
      </p>
      <div className="mt-6 flex flex-col gap-4">
        <label className="text-sm text-ss-fg/72">
          Étape qui bloque <span className="text-ss-deconseille">*</span>
          <select value={etape} onChange={(e) => setEtape(e.target.value)} className={`mt-1.5 ${inputCls}`}>
            <option value="">— Choisir —</option>
            {ETAPES_PROBLEME.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
        </label>
        <label className="text-sm text-ss-fg/72">
          Ce qui se passe <span className="text-ss-deconseille">*</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            maxLength={2000}
            placeholder="Ex : le bouton Installer reste grisé sur Google Play…"
            className={`mt-1.5 ${inputCls}`}
          />
        </label>
        <label className="text-sm text-ss-fg/72">
          Modèle de téléphone (optionnel)
          <input
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            maxLength={100}
            placeholder="Ex : Samsung Galaxy S23"
            className={`mt-1.5 ${inputCls}`}
          />
        </label>
        {error && <p className="text-sm text-ss-deconseille">{error}</p>}
        <button
          onClick={submit}
          disabled={pending}
          className="self-start rounded-lg bg-ss-teal px-8 py-3.5 text-[15px] font-semibold text-[#06151f] disabled:opacity-50"
        >
          {pending ? 'Envoi…' : 'Envoyer'}
        </button>
      </div>
    </div>
  )
}
