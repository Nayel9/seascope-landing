import { Reveal } from '@/components/ui/Reveal'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { FeatureRow } from '@/components/ui/FeatureRow'
import { Pill } from '@/components/ui/Pill'

const features = [
  {
    icon: '⚡',
    title: 'Score en temps réel',
    desc: 'Toutes les variables marines agrégées en un indice de 0 à 100 — mis à jour à chaque nouvelle prévision.',
  },
  {
    icon: '✅',
    title: 'Verdict immédiat',
    desc: 'BON, VARIABLE, DÉLICAT ou DÉCONSEILLÉ — affiché dès l\'ouverture, sans lecture d\'un seul chiffre.',
  },
  {
    icon: '🕐',
    title: 'Créneaux idéaux',
    desc: 'Les meilleures fenêtres de sortie calculées heure par heure, selon votre profil et vos limites.',
  },
  {
    icon: '↩️',
    title: 'Heure de retour conseillée',
    desc: 'SeaScope surveille la dégradation et vous indique à quelle heure être rentré au port.',
  },
]

export function Decide() {
  return (
    <section id="decide" className="py-16 md:py-[120px]">
      <div className="container-landing">
        <Reveal>
          <SectionHeader
            kicker="Décider"
            heading={
              <>
                Décider en
                <br />
                quelques&nbsp;secondes.
              </>
            }
            lead="Plus besoin d'interpréter les chiffres. SeaScope lit les données marines à votre place et vous dit simplement si vous pouvez sortir."
          />
        </Reveal>

        {/* Main feature row with forecast-today screenshot */}
        <Reveal>
          <FeatureRow
            title="Votre prévision du jour, d'un coup d'œil"
            image={{
              src: '/screens/forecast-today.webp',
              alt: 'Écran prévision du jour — score, verdict, fenêtres horaires',
              priority: false,
            }}
          >
            <p>
              En haut de l&apos;écran : le verdict du jour, le score global et la
              fenêtre optimale. En bas : le détail heure par heure si vous voulez
              comprendre.
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              <Pill kind="bon">Sortie idéale</Pill>
              <Pill kind="variable">Sortie possible</Pill>
              <Pill kind="deconseille">Déconseillé</Pill>
            </div>
          </FeatureRow>
        </Reveal>

        {/* Feature cards grid */}
        <Reveal delay={80}>
          <div className="mt-14 md:mt-20 grid grid-cols-1 sm:grid-cols-2 gap-px bg-white/7 rounded-ss-lg overflow-hidden">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-ss-bg p-6 md:p-8 flex flex-col gap-3"
              >
                <span className="text-2xl leading-none select-none" aria-hidden="true">
                  {f.icon}
                </span>
                <h3 className="text-[17px] md:text-[19px] font-medium text-ss-fg tracking-[-0.01em] leading-snug">
                  {f.title}
                </h3>
                <p className="text-[13px] md:text-[14px] text-ss-fg/55 leading-relaxed m-0">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Second visual — dashboard decision */}
        <Reveal delay={120}>
          <div className="mt-14 md:mt-20">
            <FeatureRow
              title="Le tableau de bord décisionnel"
              image={{
                src: '/screens/dashboard-decision.webp',
                alt: 'Tableau de bord SeaScope — vue décisionnelle complète',
              }}
              reverse
            >
              <p>
                Le dashboard regroupe vent, vagues, marées, courants et
                sécurité Guardian sur un seul écran. Zéro navigation entre
                applis.
              </p>
              <p>
                Chaque indicateur est contextualisé : un vent de 15 nœuds n&apos;a
                pas le même impact selon votre bateau et votre expérience.
              </p>
            </FeatureRow>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
