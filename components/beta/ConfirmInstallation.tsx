'use client'

import { useState, useTransition } from 'react'
import { confirmerInstallation, type EtatConfirmation } from '@/lib/beta/actions'

export default function ConfirmInstallation({
  token, prenom, formUrl, whatsappUrl,
}: {
  token: string
  prenom: string
  formUrl: string
  whatsappUrl: string
}) {
  const [etat, setEtat] = useState<EtatConfirmation | null>(null)
  const [pending, start] = useTransition()

  if (etat === 'confirme' || etat === 'deja' || etat === 'neutre') {
    return (
      <div>
        <h1 className="text-[clamp(26px,3vw,36px)] leading-[1.15] tracking-[-0.02em] font-medium m-0">
          {etat === 'deja' ? 'Déjà confirmé — merci !' : `C'est noté${prenom ? `, ${prenom}` : ''} — bonne nav ! 🌊`}
        </h1>
        <p className="mt-4 text-[15px] leading-[1.7] text-ss-fg/72">
          Après quelques sorties, racontez-nous ce qui s&rsquo;est réellement passé — c&rsquo;est ce qui fait avancer SeaScope.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {formUrl && (
            <a href={formUrl} className="rounded-lg bg-ss-teal px-6 py-3 text-sm font-semibold text-[#06151f]">
              Formulaire de retour terrain
            </a>
          )}
          {whatsappUrl && (
            <a href={whatsappUrl} className="rounded-lg border border-ss-teal/60 px-6 py-3 text-sm font-semibold text-ss-teal">
              Groupe WhatsApp des testeurs
            </a>
          )}
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-[clamp(26px,3vw,36px)] leading-[1.15] tracking-[-0.02em] font-medium m-0">
        Merci{prenom ? ` ${prenom}` : ''}&nbsp;!
      </h1>
      <p className="mt-4 text-[15px] leading-[1.7] text-ss-fg/72">
        Un dernier clic pour confirmer que SeaScope est bien installée sur votre téléphone&nbsp;:
      </p>
      {etat === 'erreur' && (
        <p className="mt-4 text-sm text-ss-deconseille">Une erreur est survenue — réessayez dans un instant.</p>
      )}
      {etat === 'invalide' && (
        <p className="mt-4 text-sm text-ss-deconseille">Ce lien n&rsquo;est plus valide — répondez au mail d&rsquo;invitation.</p>
      )}
      <button
        onClick={() => start(async () => setEtat(await confirmerInstallation(token)))}
        disabled={pending}
        className="mt-6 rounded-lg bg-ss-teal px-8 py-3.5 text-[15px] font-semibold text-[#06151f] disabled:opacity-50"
      >
        {pending ? 'Confirmation…' : "Je confirme l'installation"}
      </button>
    </div>
  )
}
