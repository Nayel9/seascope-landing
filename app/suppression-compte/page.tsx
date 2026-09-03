import type { Metadata } from 'next'
import { Nav } from '@/components/layout/Nav'
import { Footer } from '@/components/layout/Footer'
import { Kicker } from '@/components/ui/Kicker'

export const metadata: Metadata = {
  title: 'Supprimer votre compte — SeaScope',
  description:
    'Comment supprimer définitivement votre compte SeaScope et les données associées, depuis l’application ou par simple demande par e-mail.',
  // La page DOIT rester indexable : Google Play exige une URL publique atteignable.
  robots: { index: true, follow: true },
}

const UPDATED = '3 septembre 2026'

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="scroll-mt-24 text-[clamp(20px,2vw,26px)] leading-[1.2] tracking-[-0.015em] font-medium mt-14 mb-4 first:mt-0"
    >
      {children}
    </h2>
  )
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-[15px] leading-[1.7] text-ss-fg/72 mb-4 max-w-[72ch]">{children}</p>
}

function UL({ children }: { children: React.ReactNode }) {
  return <ul className="list-none m-0 p-0 mb-4 flex flex-col gap-2.5 max-w-[72ch]">{children}</ul>
}

function LI({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-3 items-start text-[15px] leading-[1.6] text-ss-fg/72">
      <span className="w-[5px] h-[5px] rounded-full bg-ss-teal flex-none mt-2.5" />
      <span>{children}</span>
    </li>
  )
}

export default function SuppressionComptePage() {
  return (
    <>
      <Nav />
      <main className="py-16 md:py-24">
        <div className="container-narrow">
          <div className="flex items-center gap-3 mb-5">
            <Kicker>Votre compte</Kicker>
          </div>
          <h1 className="text-[clamp(30px,3.6vw,44px)] leading-[1.1] tracking-[-0.02em] font-medium m-0 text-balance">
            Supprimer votre compte
          </h1>
          <p className="mt-4 font-mono text-[12px] tracking-[0.08em] text-ss-fg/50 uppercase">
            Dernière mise à jour : {UPDATED}
          </p>

          <div className="mt-10 border border-ss-teal/25 bg-ss-teal/[0.05] rounded-ss-lg p-6">
            <p className="font-mono text-[11px] tracking-[0.16em] uppercase text-ss-teal mb-3">
              L&apos;essentiel
            </p>
            <UL>
              <LI>
                La suppression est <strong className="text-ss-fg">définitive</strong> : aucune
                récupération n&apos;est possible.
              </LI>
              <LI>
                Deux chemins possibles : depuis{' '}
                <strong className="text-ss-fg">l&apos;application</strong>, en quelques secondes, ou{' '}
                <strong className="text-ss-fg">par e-mail</strong> si vous n&apos;avez plus accès à
                l&apos;application.
              </LI>
              <LI>
                SeaScope reste <strong className="text-ss-fg">entièrement utilisable sans compte</strong>.
              </LI>
            </UL>
          </div>

          <div className="mt-12">
            <H2 id="depuis-application">1. Depuis l&apos;application</H2>
            <P>
              C&apos;est le chemin le plus rapide, et la suppression y est immédiate. Dans SeaScope :
            </P>
            <UL>
              <LI>
                Ouvrez <strong className="text-ss-fg">Réglages</strong>, puis{' '}
                <strong className="text-ss-fg">Compte</strong>.
              </LI>
              <LI>
                Touchez <strong className="text-ss-fg">Supprimer mon compte</strong>, en bas de
                l&apos;écran.
              </LI>
              <LI>
                Lisez la liste de ce qui sera effacé, cochez la case de confirmation, puis tapez le
                mot <strong className="text-ss-fg">SUPPRIMER</strong>.
              </LI>
              <LI>
                Validez. Votre compte et les données associées sont effacés aussitôt.
              </LI>
            </UL>

            <H2 id="sans-application">2. Sans l&apos;application</H2>
            <P>
              Si vous n&apos;avez plus accès à l&apos;application — téléphone perdu, application
              désinstallée — écrivez-nous à{' '}
              <a href="mailto:seascope-contact@pennarstudio.fr" className="text-ss-teal">
                seascope-contact@pennarstudio.fr
              </a>{' '}
              depuis l&apos;adresse e-mail de votre compte, en demandant sa suppression. Nous
              traitons la demande sous 30 jours, conformément au RGPD, et vous confirmons
              l&apos;effacement par retour d&apos;e-mail.
            </P>

            <H2 id="ce-qui-est-supprime">3. Ce qui est supprimé</H2>
            <P>Tout, immédiatement et sans conservation :</P>
            <UL>
              <LI>Votre compte et votre adresse e-mail.</LI>
              <LI>
                Vos données synchronisées : spots, points d&apos;intérêt, sorties du journal de bord,
                bateaux, profils de navigation, trophées, préférences, sessions de mouillage
                Guardian et sorties planifiées.
              </LI>
              <LI>Vos sessions de connexion, sur tous vos appareils.</LI>
              <LI>
                Les données enregistrées sur l&apos;appareil depuis lequel vous effectuez la
                suppression.
              </LI>
            </UL>
            <P>
              Aucune sauvegarde de ces données n&apos;est conservée après la suppression. Les mesures
              d&apos;usage anonymes, qui ne sont rattachées ni à votre compte ni à votre identité,
              ne permettent pas de vous retrouver et ne sont donc pas concernées — voir la{' '}
              <a href="/privacy" className="text-ss-teal">
                politique de confidentialité
              </a>
              .
            </P>

            <H2 id="ce-qui-nest-pas-supprime">4. Ce qui n&apos;est pas supprimé</H2>
            <UL>
              <LI>
                <strong className="text-ss-fg">Un abonnement Google Play actif.</strong> Il est géré
                par Google, pas par nous : supprimer votre compte SeaScope ne le résilie pas. Pour
                l&apos;arrêter, passez par le Play Store — Abonnements — SeaScope — Résilier.
              </LI>
              <LI>
                Les données que vous avez enregistrées sur{' '}
                <strong className="text-ss-fg">d&apos;autres appareils</strong> et qui n&apos;étaient
                pas synchronisées. Elles disparaîtront à la désinstallation de l&apos;application sur
                ces appareils.
              </LI>
            </UL>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
