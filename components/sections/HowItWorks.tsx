import { Reveal } from '@/components/ui/Reveal'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Pill } from '@/components/ui/Pill'
import { MapPin, Layers, Compass } from '@/components/ui/icons'

export function HowItWorks() {
  return (
    <section id="how" className="py-16 md:py-[120px]">
      <div className="container-landing">
        <Reveal>
          <SectionHeader
            kicker="Comment ça marche"
            heading={<>Trois gestes.<br />Une décision claire.</>}
            lead="SeaScope vous demande l'essentiel — votre spot, votre pratique — puis renvoie un signal décisionnel, pas une avalanche de chiffres."
          />
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Step 1 */}
          <Reveal>
            <div className="bg-ss-surface border border-white/7 rounded-ss-lg p-7 flex flex-col gap-[18px] min-h-[360px]">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] tracking-[0.18em] text-ss-teal">01</span>
                <span className="w-9 h-9 rounded-[10px] bg-ss-teal/[0.08] inline-flex items-center justify-center text-ss-teal">
                  <MapPin size={18} />
                </span>
              </div>
              <h3 className="text-[20px] leading-[1.25] font-medium m-0">Choisissez votre spot.</h3>
              <p className="text-[14px] text-ss-fg/50 leading-[1.5] m-0">
                Trévignon, Quiberon, Glénan, ou n&apos;importe quel point GPS. Vos spots préférés sont mémorisés.
              </p>
              <div className="mt-auto bg-ss-bg-2 border border-white/7 rounded-[12px] p-4 min-h-[132px] relative overflow-hidden">
                <svg viewBox="0 0 280 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
                  <defs>
                    <pattern id="grid" width="14" height="14" patternUnits="userSpaceOnUse">
                      <path d="M 14 0 L 0 0 0 14" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="280" height="100" fill="url(#grid)" />
                  <path d="M0 70 C 50 60, 80 78, 130 62 S 220 50, 280 58 L280 100 L0 100 Z" fill="rgba(94,234,212,0.05)" stroke="rgba(94,234,212,0.4)" strokeWidth="1" />
                  <circle cx="140" cy="55" r="5" fill="#5EEAD4" />
                  <circle cx="140" cy="55" r="11" fill="none" stroke="#5EEAD4" strokeWidth="1" opacity="0.4" />
                </svg>
                <span className="absolute font-mono text-[10px] text-ss-teal tracking-[0.1em]" style={{ left: 120, top: 24 }}>TRÉVIGNON</span>
              </div>
            </div>
          </Reveal>

          {/* Step 2 */}
          <Reveal delay={120}>
            <div className="bg-ss-surface border border-white/7 rounded-ss-lg p-7 flex flex-col gap-[18px] min-h-[360px]">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] tracking-[0.18em] text-ss-teal">02</span>
                <span className="w-9 h-9 rounded-[10px] bg-ss-teal/[0.08] inline-flex items-center justify-center text-ss-teal">
                  <Layers size={18} />
                </span>
              </div>
              <h3 className="text-[20px] leading-[1.25] font-medium m-0">SeaScope confronte les modèles à vos limites.</h3>
              <p className="text-[14px] text-ss-fg/50 leading-[1.5] m-0">
                Fusion de plusieurs modèles météo marins, croisée avec les seuils de votre profil de navigation.
              </p>
              <div className="mt-auto bg-ss-bg-2 border border-white/7 rounded-[12px] p-4 flex flex-col gap-1.5">
                {[
                  { label: 'ARPEGE',    v: 72, color: '#34D399' },
                  { label: 'ICON-EU',   v: 65, color: '#34D399' },
                  { label: 'GFS',       v: 58, color: '#FBBF24' },
                  { label: 'WAVEWATCH', v: 70, color: '#34D399' },
                  { label: 'SEASCOPE',  v: 88, color: '#5EEAD4' },
                ].map((m) => (
                  <div key={m.label} className="grid items-center gap-2" style={{ gridTemplateColumns: '70px 1fr 30px' }}>
                    <span className="font-mono text-[10px] text-ss-fg/50 tracking-[0.08em]">{m.label}</span>
                    <div className="h-1 bg-white/[0.06] rounded-[2px] overflow-hidden">
                      <div className="h-full rounded-[2px]" style={{ width: `${m.v}%`, background: m.color }} />
                    </div>
                    <span className="font-mono text-[10px] text-right" style={{ color: m.color }}>{m.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Step 3 */}
          <Reveal delay={240}>
            <div className="bg-ss-surface border border-white/7 rounded-ss-lg p-7 flex flex-col gap-[18px] min-h-[360px]">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] tracking-[0.18em] text-ss-teal">03</span>
                <span className="w-9 h-9 rounded-[10px] bg-ss-teal/[0.08] inline-flex items-center justify-center text-ss-teal">
                  <Compass size={18} />
                </span>
              </div>
              <h3 className="text-[20px] leading-[1.25] font-medium m-0">Obtenez votre signal.</h3>
              <p className="text-[14px] text-ss-fg/50 leading-[1.5] m-0">
                Une recommandation tranchée — meilleure fenêtre, heure de retour, niveau adapté à votre pratique.
              </p>
              <div className="mt-auto bg-ss-bg-2 border border-white/7 rounded-[12px] p-4 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <Pill kind="bon">BON</Pill>
                  <span className="font-mono text-[11px] text-ss-fg/50 tracking-[0.1em]">88 / 100</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <div>
                    <div className="font-mono text-[9px] text-ss-fg/50 tracking-[0.14em] uppercase">Départ optimal</div>
                    <div className="font-mono text-[18px] font-medium mt-1">08:00 — 11:00</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-[9px] text-ss-rentrer tracking-[0.14em] uppercase">Rentrer avant</div>
                    <div className="font-mono text-[18px] font-medium text-ss-rentrer mt-1">10:15</div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
