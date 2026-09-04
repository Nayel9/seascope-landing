import clsx from 'clsx'

type CellValue = boolean | string

interface FeatureLine {
  label: string
  tag?: 'security' | 'soon'
  free: CellValue
  premium: CellValue
  premiumPlus: CellValue
}

// Miroir du `FEATURE_CATALOG` de l'app (`lib/paywall/subscriptionFeatures.ts`) et de ses
// `TIER_LIMITS`. Les valeurs chiffrees ne sont affichees QUE si la limite est reellement
// appliquee dans le code de l'app — sinon on ne l'annonce pas.
const FEATURES: FeatureLine[] = [
  // Toutes paliers
  { label: 'Alertes sécurité & vigilance', tag: 'security', free: true,        premium: true,        premiumPlus: true        },
  { label: 'Verdict mouillage',              tag: 'security', free: true,        premium: true,        premiumPlus: true        },
  { label: 'Météo de base',                                   free: true,        premium: true,        premiumPlus: true        },
  { label: 'Score de décision',                               free: true,        premium: true,        premiumPlus: true        },
  { label: 'Carte & POI',                                     free: true,        premium: true,        premiumPlus: true        },
  { label: 'Journal de bord',                                 free: true,        premium: true,        premiumPlus: true        },
  { label: 'Simulateur (sortie du jour)',                     free: true,        premium: true,        premiumPlus: true        },
  // Premium +
  { label: 'Prévisions',                                      free: '5 j',       premium: '7 j HD',    premiumPlus: '7 j HD'     },
  { label: 'Planning multi-jours',                            free: false,       premium: true,        premiumPlus: true        },
  { label: 'Spots enregistrés',                               free: '3',         premium: 'illimité',  premiumPlus: 'illimité'  },
  { label: 'Sorties planifiées',                              free: '2',         premium: 'illimité',  premiumPlus: 'illimité'  },
  { label: "Courants & hauteur d'eau",                        free: false,       premium: true,        premiumPlus: true        },
  { label: 'Simulateur avancé',                               free: false,       premium: true,        premiumPlus: true        },
  { label: 'Overlay courant (carte)',                         free: false,       premium: true,        premiumPlus: true        },
  { label: 'Profils bateau',                                  free: '1',         premium: '3',         premiumPlus: 'illimité'  },
  { label: 'Guardian Watch',           tag: 'security',       free: true,        premium: true,        premiumPlus: true        },
  { label: 'Guardian Intelligent',                            free: false,       premium: true,        premiumPlus: true        },
  // Premium+ exclusif
  { label: 'Guardian Pro',                                    free: false,       premium: false,       premiumPlus: true        },
  { label: 'Arrival Intelligence avancée',                    free: false,       premium: false,       premiumPlus: true        },
  { label: 'Réglementation avancée',                         free: false,       premium: false,       premiumPlus: true        },
  { label: 'Synchronisation cloud',                           free: false,       premium: false,       premiumPlus: true        },
  { label: 'Équipage',                 tag: 'soon',           free: false,       premium: false,       premiumPlus: true        },
  { label: 'Communauté',               tag: 'soon',           free: false,       premium: false,       premiumPlus: true        },
  { label: 'Partage avancé',           tag: 'soon',           free: false,       premium: false,       premiumPlus: true        },
]

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" className="w-4 h-4 text-ss-teal flex-none" fill="none" aria-hidden="true">
      <path d="M3 8.5l3.5 3.5 6.5-7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function DashIcon() {
  return (
    <svg viewBox="0 0 16 16" className="w-4 h-4 text-ss-fg/18 flex-none" fill="none" aria-hidden="true">
      <path d="M4 8h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function Cell({ value, highlight }: { value: CellValue; highlight?: boolean }) {
  if (value === true) {
    return (
      <td className={clsx('py-3 px-4 text-center', highlight && 'bg-ss-teal/[0.03]')}>
        <span className="inline-flex justify-center"><CheckIcon /></span>
      </td>
    )
  }
  if (value === false) {
    return (
      <td className={clsx('py-3 px-4 text-center', highlight && 'bg-ss-teal/[0.03]')}>
        <span className="inline-flex justify-center"><DashIcon /></span>
      </td>
    )
  }
  return (
    <td className={clsx('py-3 px-4 text-center', highlight && 'bg-ss-teal/[0.03]')}>
      <span className={clsx(
        'text-[12px] font-mono font-medium px-2 py-0.5 rounded-full',
        highlight ? 'text-ss-teal bg-ss-teal/10' : 'text-ss-fg/72 bg-white/4'
      )}>
        {value}
      </span>
    </td>
  )
}

export function ComparisonTable() {
  return (
    <div className="overflow-x-auto rounded-ss-xl border border-white/7">
      <table className="w-full min-w-[560px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-white/7">
            <th className="py-4 px-4 text-left text-[13px] font-normal text-ss-fg/50 w-1/2">
              Fonctionnalité
            </th>
            <th className="py-4 px-4 text-center text-[13px] font-semibold text-ss-fg/72 w-[16.66%]">
              Gratuit
            </th>
            <th className="py-4 px-4 text-center text-[13px] font-semibold text-ss-fg/72 w-[16.66%]">
              Premium
            </th>
            <th className="py-4 px-4 text-center text-[13px] font-semibold text-ss-teal bg-ss-teal/[0.03] w-[16.66%]">
              Premium+
            </th>
          </tr>
        </thead>
        <tbody>
          {FEATURES.map((feat, i) => (
            <tr
              key={feat.label}
              className={clsx(
                'border-b border-white/[0.04] transition-colors duration-100 hover:bg-white/[0.015]',
                i === FEATURES.length - 1 && 'border-b-0'
              )}
            >
              <td className="py-3 px-4">
                <span className="flex items-center gap-2 text-[13px] text-ss-fg/80 leading-tight">
                  {feat.label}
                  {feat.tag === 'security' && (
                    <span className="inline-flex items-center h-4 px-1.5 rounded-full bg-ss-bon/10 text-ss-bon text-[9px] font-mono font-semibold tracking-[0.08em] uppercase flex-none">
                      Sécurité
                    </span>
                  )}
                  {feat.tag === 'soon' && (
                    <span className="inline-flex items-center h-4 px-1.5 rounded-full bg-ss-variable/10 text-ss-variable text-[9px] font-mono font-semibold tracking-[0.08em] uppercase flex-none">
                      Bientôt
                    </span>
                  )}
                </span>
              </td>
              <Cell value={feat.free} />
              <Cell value={feat.premium} />
              <Cell value={feat.premiumPlus} highlight />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
