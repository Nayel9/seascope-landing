import { Reveal } from '@/components/ui/Reveal'

export function FeedbackLoop() {
  return (
    <section className="py-[120px] bg-ss-bg-2 border-y border-white/7">
      <div className="max-w-landing mx-auto px-8 sm:px-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-[60px] items-center">
          <Reveal>
            <div className="flex items-center gap-3 mb-[22px]">
              <span className="inline-flex items-center gap-2.5 font-mono text-[11px] tracking-[0.18em] uppercase text-ss-teal">
                <span className="w-1.5 h-1.5 rounded-full bg-ss-teal shadow-[0_0_0_4px_rgba(94,234,212,0.15)]" />
                Boucle terrain
              </span>
            </div>
            <h2 className="text-[clamp(30px,3.4vw,50px)] leading-[1.08] tracking-[-0.02em] font-medium mb-4 text-balance">
              La beta sert à affûter<br />les recommandations réelles.
            </h2>
            <p className="text-[clamp(16px,1.25vw,19px)] leading-[1.6] text-ss-fg/72 mt-4 text-pretty">
              On ne cherche pas à valider une démo. On cherche à valider une
              décision : est-ce que SeaScope a vu juste cette fois ?
              Vos retours terrain font évoluer la pondération des modèles,
              les seuils par profil, et la façon dont on formule un signal.
            </p>
            <p className="text-[clamp(16px,1.25vw,19px)] leading-[1.6] text-ss-fg/72 mt-3 text-pretty">
              L&apos;objectif n&apos;est pas une appli météo de plus. C&apos;est un vrai
              copilote de décision — entraîné avec vous.
            </p>
          </Reveal>

          <Reveal delay={120}>
            <div className="border border-white/7 rounded-ss-xl p-8 bg-ss-surface grid grid-cols-3 gap-3.5">
              {[
                { n: '01 · AVANT',  t: 'SeaScope recommande.',   d: 'Score, fenêtre, heure de retour adaptés à votre profil.' },
                { n: '02 · APRÈS',  t: 'Vous notez la réalité.', d: 'Mer vue, vent ressenti, écart à la prévision, décision prise.' },
                { n: '03 · ENTRE',  t: "Le modèle s'ajuste.",    d: 'Pondération locale, calibrage par zone, par profil, par saison.' },
              ].map((s) => (
                <div key={s.n} className="border border-white/7 rounded-ss p-[18px] bg-black/[0.15] flex flex-col gap-2">
                  <span className="font-mono text-[10px] tracking-[0.18em] text-ss-teal">{s.n}</span>
                  <span className="text-[14px] font-medium">{s.t}</span>
                  <span className="text-[12px] text-ss-fg/50 leading-[1.5]">{s.d}</span>
                </div>
              ))}
              <div className="col-span-3 mt-3 pt-4 border-t border-white/7 flex items-center justify-between flex-wrap gap-3">
                <span className="font-mono text-[11px] tracking-[0.14em] text-ss-fg/50 uppercase">Boucle fermée · Métrique principale</span>
                <span className="font-mono text-[14px] text-ss-teal">&quot;SeaScope a-t-il vu juste ?&quot;</span>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
