import Link from 'next/link'
import { requireAdmin } from '@/lib/admin/auth'
import { queryCandidatures, queryFeedbacks, type Candidature } from '@/lib/admin/notion'
import { demandeEmailGPEmail, invitationEmail, refusEmail, relanceEmail } from '@/lib/admin/emails'
import { MOTIFS_RECONTACT_LABELS, MOTIFS_REFUS, type MotifRefusKey } from '@/lib/admin/refus'
import CandidaturesTable from '@/components/admin/CandidaturesTable'

export const dynamic = 'force-dynamic'

export type TabKey = 'traiter' | 'emailgp' | 'inviter' | 'invites' | 'relancer' | 'actifs' | 'recontacter' | 'refuses' | 'tous'

export interface Row extends Candidature {
  aRelancer: boolean
  joursDepuisInvitation: number | null
}

const RELANCE_APRES_JOURS = 5

function enrich(c: Candidature): Row {
  let jours: number | null = null
  if (c.dateInvitation) {
    jours = Math.floor((Date.now() - new Date(c.dateInvitation).getTime()) / 86_400_000)
  }
  const aRelancer =
    c.invitationEnvoyee && !c.relanceEnvoyee && c.retoursCount === 0 &&
    jours !== null && jours >= RELANCE_APRES_JOURS &&
    (c.statut === 'Invité Google Play' || c.statut === 'Actif')
  return { ...c, aRelancer, joursDepuisInvitation: jours }
}

const filters: Record<TabKey, (r: Row) => boolean> = {
  traiter: (r) => ['Nouveau', 'En cours', 'En attente'].includes(r.statut),
  emailgp: (r) => r.statut === 'Accepté' && !r.invitationEnvoyee && !r.emailGooglePlay,
  inviter: (r) => r.statut === 'Accepté' && !r.invitationEnvoyee && !!r.emailGooglePlay,
  invites: (r) => r.statut === 'Invité Google Play',
  relancer: (r) => r.aRelancer,
  actifs: (r) => r.statut === 'Actif',
  // Refusés « recontactables » (mail promettant un recontact : iOS, beta complète, zone…)
  recontacter: (r) => r.statut === 'Refusé' && MOTIFS_RECONTACT_LABELS.has(r.motifRefus),
  // Refus définitifs + inactifs (les recontactables ont leur propre onglet)
  refuses: (r) => ['Refusé', 'Inactif'].includes(r.statut) && !MOTIFS_RECONTACT_LABELS.has(r.motifRefus),
  tous: () => true,
}

const tabLabels: Record<TabKey, string> = {
  traiter: '📋 À traiter', emailgp: '📮 Email Google à confirmer', inviter: '✅ À inviter',
  invites: '📨 Invités', relancer: '🔁 À relancer', actifs: '🟢 Actifs',
  recontacter: '⏳ À recontacter', refuses: '❌ Refusés', tous: 'Tous',
}

export default async function CandidaturesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  await requireAdmin()
  const { tab: rawTab } = await searchParams
  const tab: TabKey = (Object.keys(filters) as TabKey[]).includes(rawTab as TabKey) ? (rawTab as TabKey) : 'traiter'

  const [candidatures, feedbacks] = await Promise.all([queryCandidatures(), queryFeedbacks()])
  const rows = candidatures.map(enrich)
  const retoursNonTraites = feedbacks.filter((f) => ['Nouveau', 'À investiguer', ''].includes(f.statut)).length
  const counts = Object.fromEntries(
    (Object.keys(filters) as TabKey[]).map((k) => [k, rows.filter(filters[k]).length]),
  ) as Record<TabKey, number>

  // Aperçus générés côté serveur (les env GOOGLE_PLAY_URL etc. restent serveur).
  const previewInvitation = invitationEmail({ prenom: '{Prénom}', emailGooglePlay: '{email Google Play}' }).html
  const previewRelance = relanceEmail({ prenom: '{Prénom}' }).html
  const previewDemande = demandeEmailGPEmail({ prenom: '{Prénom}' }).html
  const previewsRefus = Object.fromEntries(
    MOTIFS_REFUS.map((m) => [m.key, refusEmail({ prenom: '{Prénom}' }, m).html]),
  ) as Record<MotifRefusKey, string>

  const kpis: Array<{ tab: TabKey; label: string; alert?: boolean }> = [
    { tab: 'traiter', label: '📋 À traiter' },
    { tab: 'emailgp', label: '📮 Email GP à confirmer', alert: true },
    { tab: 'inviter', label: '✅ À inviter' },
    { tab: 'invites', label: '📨 Invités' },
    { tab: 'relancer', label: '🔁 À relancer', alert: true },
    { tab: 'actifs', label: '🟢 Actifs' },
    { tab: 'recontacter', label: '⏳ À recontacter' },
  ]

  return (
    <main className="px-6 py-5">
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 xl:grid-cols-8">
        {kpis.map((k) => (
          <Link
            key={k.tab}
            href={`/admin/candidatures?tab=${k.tab}`}
            className="rounded-ss border border-ss-teal/12 bg-ss-surface-2 px-3.5 py-3 hover:border-ss-teal/40"
          >
            <b className={`block text-2xl ${k.alert && counts[k.tab] > 0 ? 'text-ss-variable' : 'text-white'}`}>
              {counts[k.tab]}
            </b>
            <span className="text-[11px] text-ss-fg/70">{k.label}</span>
          </Link>
        ))}
        <Link
          href="/admin/feedbacks"
          className="rounded-ss border border-ss-teal/12 bg-ss-surface-2 px-3.5 py-3 hover:border-ss-teal/40"
        >
          <b className={`block text-2xl ${retoursNonTraites > 0 ? 'text-ss-variable' : 'text-white'}`}>
            {retoursNonTraites}
          </b>
          <span className="text-[11px] text-ss-fg/70">🚨 Retours non traités</span>
        </Link>
      </div>

      <div className="mt-5 flex flex-wrap gap-1">
        {(Object.keys(tabLabels) as TabKey[]).map((k) => (
          <Link
            key={k}
            href={`/admin/candidatures?tab=${k}`}
            className={`rounded-t-md px-3.5 py-2 text-[13px] ${k === tab ? 'bg-ss-surface-2 text-ss-teal' : 'text-ss-fg/60 hover:text-ss-fg'}`}
          >
            {tabLabels[k]} ({counts[k]})
          </Link>
        ))}
      </div>

      <CandidaturesTable
        key={tab}
        rows={rows.filter(filters[tab])}
        tab={tab}
        previewInvitation={previewInvitation}
        previewRelance={previewRelance}
        previewDemande={previewDemande}
        previewsRefus={previewsRefus}
      />
    </main>
  )
}
