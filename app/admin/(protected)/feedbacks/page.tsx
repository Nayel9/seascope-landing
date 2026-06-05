import Link from 'next/link'
import { requireAdmin } from '@/lib/admin/auth'
import { queryFeedbacks, type Feedback } from '@/lib/admin/notion'
import FeedbackRow from '@/components/admin/FeedbackRow'

export const dynamic = 'force-dynamic'

type FbTab = 'nontraites' | 'encours' | 'installation' | 'tous'

const filters: Record<FbTab, (f: Feedback) => boolean> = {
  nontraites: (f) => ['Nouveau', 'À investiguer', ''].includes(f.statut),
  encours: (f) => f.statut === 'En cours',
  installation: (f) => f.typeRetour === 'Problème installation',
  tous: () => true,
}

const labels: Record<FbTab, string> = { nontraites: '🚨 Non traités', encours: 'En cours', installation: '🆘 Installation', tous: 'Tous' }

export default async function FeedbacksPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  await requireAdmin()
  const { tab: rawTab } = await searchParams
  const tab: FbTab = (Object.keys(filters) as FbTab[]).includes(rawTab as FbTab) ? (rawTab as FbTab) : 'nontraites'

  const all = await queryFeedbacks()
  const rows = all.filter(filters[tab])

  return (
    <main className="px-6 py-5">
      <div className="flex flex-wrap gap-1">
        {(Object.keys(labels) as FbTab[]).map((k) => (
          <Link
            key={k}
            href={`/admin/feedbacks?tab=${k}`}
            className={`rounded-t-md px-3.5 py-2 text-[13px] ${k === tab ? 'bg-ss-surface-2 text-ss-teal' : 'text-ss-fg/60 hover:text-ss-fg'}`}
          >
            {labels[k]} ({all.filter(filters[k]).length})
          </Link>
        ))}
      </div>
      <div className="overflow-x-auto rounded-b-ss rounded-tr-ss bg-ss-bg-2">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-white/10 text-left text-[11px] uppercase tracking-wide text-ss-fg/50">
              <th className="px-3 py-2.5">Testeur</th>
              <th className="px-3 py-2.5">Type</th>
              <th className="px-3 py-2.5">Description</th>
              <th className="px-3 py-2.5">Impact</th>
              <th className="px-3 py-2.5">Priorité</th>
              <th className="px-3 py-2.5">Statut</th>
              <th className="px-3 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-ss-fg/50">Aucun retour ici.</td></tr>
            )}
            {rows.map((fb) => <FeedbackRow key={fb.id} fb={fb} />)}
          </tbody>
        </table>
      </div>
    </main>
  )
}
