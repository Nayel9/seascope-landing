import Image from 'next/image'
import { Eye, Anchor, Bell, ShieldCheck } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Reveal } from '@/components/ui/Reveal'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Callout } from '@/components/ui/Callout'
import { DeviceFrame } from '@/components/ui/DeviceFrame'

const guardianFeatures: { Icon: LucideIcon; title: string; desc: string }[] = [
  {
    Icon: Eye,
    title: 'Guardian Watch',
    desc: "Surveillance continue de vos conditions de mouillage — vent, vague, affourchage — même en arrière-plan.",
  },
  {
    Icon: Anchor,
    title: 'Verdict mouillage',
    desc: "SeaScope évalue si votre zone de mouillage est sûre : profondeur, protection, risque de dragage.",
  },
  {
    Icon: Bell,
    title: 'Alertes intelligentes',
    desc: "Notification immédiate si une variable dépasse votre seuil de sécurité personnalisé : vent, houle, marée.",
  },
  {
    Icon: ShieldCheck,
    title: "Surveillance d'ancre",
    desc: "Trace un périmètre autour de votre position. Alerte dès que le bateau sort du rayon défini.",
  },
]

export function Security() {
  return (
    <section
      id="security"
      className="relative py-16 md:py-[120px] overflow-hidden"
    >
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{
          background:
            'radial-gradient(ellipse 55% 45% at 70% 40%, rgba(94,234,212,0.06) 0%, transparent 65%)',
        }}
      />

      <div className="container-landing">
        <Reveal>
          <SectionHeader
            kicker="Sécurité — Guardian"
            heading={
              <>
                Mouillé en sécurité,
                <br />
                même la nuit.
              </>
            }
            lead="Guardian surveille vos conditions d'amarrage en continu et vous alerte avant que la situation ne devienne critique."
          />
        </Reveal>

        {/* Main visual: dashboard-decision with Callout overlay */}
        <Reveal>
          <div className="relative flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

            {/* Phone + callout badge */}
            <div className="relative flex-none flex justify-center">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -z-10 scale-[1.4]"
                style={{
                  background:
                    'radial-gradient(closest-side, rgba(94,234,212,0.09), transparent 80%)',
                }}
              />
              <DeviceFrame large>
                <Image
                  src="/screens/dashboard-decision.webp"
                  alt="Tableau de bord SeaScope — bandeau Mouillage autorisé Guardian"
                  fill
                  sizes="(max-width: 640px) 220px, (max-width: 1024px) 300px, 380px"
                  className="object-cover"
                  loading="lazy"
                />
              </DeviceFrame>
              <Callout
                num="v"
                label="Guardian"
                text="Mouillage autorisé"
                style={{ top: '30%', right: '-80px' }}
              />
            </div>

            {/* Text column */}
            <div className="flex-1 max-w-[520px]">
              <h3 className="text-[clamp(22px,2.4vw,36px)] leading-[1.1] tracking-[-0.02em] font-medium text-ss-fg mb-5">
                Un gardien pour votre&nbsp;mouillage.
              </h3>
              <p className="text-[clamp(14px,1.1vw,17px)] leading-relaxed text-ss-fg/72 mb-6">
                Vous êtes à terre, vous dormez dans la cabine — Guardian
                continue de surveiller. Vent qui fraîchit, ancre qui dérape,
                marée qui découvre : SeaScope vous prévient avant qu&apos;il ne
                soit trop tard.
              </p>
              <p className="text-[clamp(14px,1.1vw,17px)] leading-relaxed text-ss-fg/72">
                Les seuils sont entièrement personnalisables selon votre bateau
                et votre tolérance au risque. Un voilier de 9 mètres et un
                catamaran n&apos;ont pas les mêmes limites.
              </p>
            </div>

          </div>
        </Reveal>

        {/* Guardian feature cards */}
        <Reveal delay={80}>
          <div className="mt-14 md:mt-20 grid grid-cols-1 sm:grid-cols-2 gap-px bg-white/7 rounded-ss-lg overflow-hidden">
            {guardianFeatures.map((feature) => (
              <div
                key={feature.title}
                className="bg-ss-bg p-6 md:p-8 flex flex-col gap-3"
              >
                <feature.Icon
                  className="w-[18px] h-[18px] text-ss-teal"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                <h3 className="text-[17px] md:text-[19px] font-medium text-ss-fg tracking-[-0.01em] leading-snug">
                  {feature.title}
                </h3>
                <p className="text-[13px] md:text-[14px] text-ss-fg/55 leading-relaxed m-0">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
