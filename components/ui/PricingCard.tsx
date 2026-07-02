import clsx from 'clsx'
import type { OfferingPackage } from '@/lib/pricing'
import { OFFERINGS, formatEUR, monthlyEquivalentEUR } from '@/lib/pricing'

// Loosen the type so `badge` is uniformly optional
interface PricingPackage extends Omit<OfferingPackage, 'badge'> {
  badge?: string
}

interface PricingOffering {
  title: string
  packages: readonly PricingPackage[]
}

type Offering = typeof OFFERINGS[keyof typeof OFFERINGS]

interface PricingCardProps {
  offering: Offering
}

export function PricingCard({ offering }: PricingCardProps) {
  const pkgs = offering.packages as readonly PricingPackage[]
  const highlighted = pkgs.find((p) => p.highlighted)
  const rest = pkgs.filter((p) => !p.highlighted)

  return (
    <div
      className={clsx(
        'relative flex flex-col rounded-ss-xl border overflow-hidden',
        offering.title === 'Premium+'
          ? 'border-ss-teal/30 bg-ss-surface-2'
          : 'border-white/7 bg-ss-surface'
      )}
    >
      {/* Header */}
      <div className="px-6 pt-6 pb-5 border-b border-white/7">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[13px] font-mono tracking-[0.12em] uppercase text-ss-teal">
            {offering.title}
          </span>
          {highlighted?.badge && (
            <span className="inline-flex items-center h-5 px-2 rounded-full bg-ss-teal/10 text-ss-teal text-[11px] font-mono font-semibold tracking-[0.06em]">
              {highlighted.badge}
            </span>
          )}
        </div>
      </div>

      {/* Highlighted package */}
      {highlighted && (() => {
        const monthly = monthlyEquivalentEUR(highlighted.product)
        return (
          <div className="px-6 py-5 border-b border-white/7">
            <div className="flex items-end gap-2 mb-1">
              <span className="text-[38px] font-semibold leading-none tracking-[-0.03em] text-ss-fg">
                {formatEUR(highlighted.product.priceEUR)}
              </span>
              <span className="text-sm text-ss-fg/50 mb-1.5">
                {highlighted.role === 'annual' ? '/ an' : highlighted.role === 'monthly' ? '/ mois' : '/ saison'}
              </span>
            </div>
            {highlighted.role === 'annual' && monthly !== null && (
              <p className="text-[13px] text-ss-fg/50">
                soit <span className="text-ss-teal font-medium">{formatEUR(monthly)}</span> / mois
              </p>
            )}
          </div>
        )
      })()}

      {/* Other packages */}
      {rest.length > 0 && (
        <div className="px-6 py-4 flex flex-col gap-3">
          {rest.map((pkg) => (
            <div key={pkg.product.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[13px] text-ss-fg/50">
                  {pkg.role === 'monthly' ? 'Mensuel' : pkg.role === 'season' ? 'Saison (4 mois)' : 'Annuel'}
                </span>
                {pkg.badge && (
                  <span className="inline-flex items-center h-4 px-1.5 rounded-full bg-ss-variable/10 text-ss-variable text-[10px] font-mono font-semibold">
                    {pkg.badge}
                  </span>
                )}
              </div>
              <span className="text-[14px] font-medium text-ss-fg">
                {formatEUR(pkg.product.priceEUR)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Teal accent line for Premium+ */}
      {offering.title === 'Premium+' && (
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-ss-teal/0 via-ss-teal to-ss-teal/0" />
      )}
    </div>
  )
}
