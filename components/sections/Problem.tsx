import { Reveal } from '@/components/ui/Reveal'
import { SectionHeader } from '@/components/ui/SectionHeader'

const problems = [
  {
    idx: '01 — Météo dispersée',
    title: 'Trois applis, trois modèles, trois verdicts différents.',
    desc: 'Vent ici, houle là-bas, rafales nulle part. Les sources se contredisent.',
    path: 'M0 30 C 12 18, 22 38, 34 28 S 56 12, 68 24 S 86 38, 100 22',
    color: '#2DD4BF',
    wide: false,
  },
  {
    idx: '02 — Surcharge cognitive',
    title: 'Lire la météo devient un travail à temps plein.',
    desc: "Vagues, vent, rafales, coefficient, période… on cumule sans savoir quoi en faire.",
    path: 'M0 18 L10 32 L20 22 L30 40 L40 24 L50 36 L60 20 L70 30 L80 16 L90 38 L100 26',
    color: '#FBBF24',
    wide: false,
  },
  {
    idx: '03 — Décision sous stress',
    title: "Sortir ou pas ? On tranche dans l'incertitude.",
    desc: "On choisit par intuition, en croisant les doigts pour que la mer suive.",
    path: 'M0 22 C 18 30, 28 14, 42 26 S 64 38, 78 22 S 92 40, 100 28',
    color: '#FF6B6B',
    wide: false,
  },
  {
    idx: '04 — Peur de rater la fenêtre',
    title: '"Et si j\'avais pu sortir ce matin ?"',
    desc: "Les meilleures fenêtres sont courtes. Sans signal clair, elles passent à côté.",
    path: 'M0 36 L18 30 L34 14 L48 12 L62 20 L78 34 L100 40',
    color: '#6EE7B7',
    wide: true,
  },
  {
    idx: '05 — Peur de mal sortir',
    title: '"Et si les conditions tournent une fois au large ?"',
    desc: "La vraie peur, ce n'est pas la mauvaise météo : c'est ne pas l'avoir vue venir.",
    path: 'M0 32 L14 30 L28 26 L42 22 L56 24 L72 18 L86 10 L100 6',
    color: '#EF4444',
    wide: true,
  },
]

export function Problem() {
  return (
    <section id="problem" className="py-[120px] bg-ss-bg-2 border-y border-white/7">
      <div className="max-w-landing mx-auto px-8 sm:px-5">
        <Reveal>
          <SectionHeader
            kicker="Le problème"
            heading={<>Trop de données.<br />Pas assez de décision.</>}
            lead="Avant chaque sortie, on jongle entre trois applis météo, des modèles qui ne s'accordent pas, et l'intuition. La décision finale repose sur la fatigue d'un dimanche matin."
          />
        </Reveal>

        <Reveal>
          <div
            className="rounded-ss-lg overflow-hidden border border-white/7"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(12, 1fr)',
              gap: '1px',
              background: 'rgba(255,255,255,0.07)',
            }}
          >
            {problems.map((p) => (
              <div
                key={p.idx}
                className="bg-ss-bg flex flex-col gap-3.5 p-7 min-h-[220px]"
                style={{ gridColumn: `span ${p.wide ? 6 : 4}` }}
              >
                <div className="font-mono text-[11px] tracking-[0.16em] text-ss-fg/50">{p.idx}</div>
                <div className="text-[20px] leading-[1.25] font-medium tracking-[-0.01em]">{p.title}</div>
                <div
                  className="h-14 rounded-[8px] overflow-hidden"
                  style={{
                    background:
                      'repeating-linear-gradient(90deg, transparent 0, transparent 11px, rgba(255,255,255,0.07) 11px, rgba(255,255,255,0.07) 12px), linear-gradient(180deg, rgba(94,234,212,0.04), transparent)',
                  }}
                >
                  <svg viewBox="0 0 100 56" preserveAspectRatio="none" className="w-full h-full block">
                    <path d={p.path} fill="none" stroke={p.color} strokeWidth="1.2" strokeLinecap="round" />
                    <path d={`${p.path} L 100 56 L 0 56 Z`} fill={p.color} opacity="0.08" />
                  </svg>
                </div>
                <div className="text-[14px] text-ss-fg/50 leading-[1.5] mt-auto">{p.desc}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
