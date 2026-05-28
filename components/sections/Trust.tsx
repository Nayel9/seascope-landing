import { Reveal } from '@/components/ui/Reveal'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Layers, Eye, Compass, Cpu, Lock, Bell } from '@/components/ui/icons'

const items = [
  {
    Icon: Layers,
    title: 'Fusion multi-sources',
    body: "Plusieurs modèles météo marins — ARPEGE, ICON-EU, GFS, WaveWatch — agrégés et pondérés selon leur fiabilité locale.",
  },
  {
    Icon: Eye,
    title: 'Recommandations explicables',
    body: "Chaque score affiche les seuils dépassés, les modèles utilisés et le niveau d'incertitude. Vous voyez ce qu'on vous dit.",
  },
  {
    Icon: Compass,
    title: 'Personnalisation réelle',
    body: "Vos limites de vent, vagues et rafales définissent le BON. Pas un seuil moyen pour navigateur moyen.",
  },
  {
    Icon: Cpu,
    title: 'Logique transparente',
    body: "Un score, trois moments (départ, pire, retour), des raisons nommées. Aucune magie, aucun algorithme secret.",
  },
  {
    Icon: Lock,
    title: 'Stockage local',
    body: "Vos préférences, vos spots, vos sorties — sur votre appareil. Pas de profil cloud, pas de revente.",
  },
  {
    Icon: Bell,
    title: 'Alertes utiles',
    body: "Un signal seulement quand la fenêtre s'ouvre — ou quand la mer se referme. Pas de notification pour le bruit.",
  },
]

export function Trust() {
  return (
    <section id="trust" className="py-[120px] bg-ss-bg-2 border-y border-white/7">
      <div className="max-w-landing mx-auto px-8 sm:px-5">
        <Reveal>
          <SectionHeader
            kicker="Confiance"
            heading={<>Une décision n&apos;a de valeur<br />que si on peut la défendre.</>}
            lead="Pas de boîte noire, pas de cloud personnel, pas de score marketing. Chaque recommandation est traçable jusqu'aux chiffres qui l'ont produite."
          />
        </Reveal>

        <Reveal>
          <div
            className="rounded-ss-lg overflow-hidden border border-white/7 grid grid-cols-1 md:grid-cols-3"
            style={{ background: 'rgba(255,255,255,0.07)', gap: '1px' }}
          >
            {items.map(({ Icon, title, body }) => (
              <div key={title} className="bg-ss-bg flex flex-col gap-3.5 p-7 min-h-[220px]">
                <span className="w-9 h-9 rounded-[10px] bg-ss-teal/[0.08] inline-flex items-center justify-center text-ss-teal">
                  <Icon size={18} />
                </span>
                <h3 className="text-[18px] font-medium m-0 tracking-[-0.005em]">{title}</h3>
                <p className="text-[14px] text-ss-fg/50 leading-[1.5] m-0">{body}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
