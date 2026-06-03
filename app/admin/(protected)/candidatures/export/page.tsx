import { requireAdmin } from '@/lib/admin/auth'
import { queryCandidatures } from '@/lib/admin/notion'
import StatutChip from '@/components/admin/StatutChip'
import MarkExportedButton from '@/components/admin/MarkExportedButton'

export const dynamic = 'force-dynamic'

export default async function ExportPage() {
  await requireAdmin()
  const rows = (await queryCandidatures()).filter(
    (r) => r.statut === 'Accepté' && r.emailGooglePlay && !r.exportGooglePlay,
  )

  return (
    <main className="px-6 py-6">
      <h1 className="text-base font-semibold text-white">📤 Export Google Play Console</h1>
      <p className="mt-1.5 text-sm text-ss-fg/55">
        {rows.length} candidat{rows.length > 1 ? 's' : ''} accepté{rows.length > 1 ? 's' : ''}, email Google Play renseigné, pas encore exporté{rows.length > 1 ? 's' : ''}.
      </p>

      <div className="mt-4 overflow-x-auto rounded-ss bg-ss-bg-2">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-white/10 text-left text-[11px] uppercase tracking-wide text-ss-fg/50">
              <th className="px-3 py-2.5">Candidat</th>
              <th className="px-3 py-2.5">Email Google Play</th>
              <th className="px-3 py-2.5">Région</th>
              <th className="px-3 py-2.5">Navigation</th>
              <th className="px-3 py-2.5">Statut</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-ss-fg/50">Rien à exporter.</td></tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-white/5">
                <td className="px-3 py-3 font-semibold">{r.prenom}</td>
                <td className="px-3 py-3">{r.emailGooglePlay}</td>
                <td className="px-3 py-3">{r.region}</td>
                <td className="px-3 py-3">{r.typeNav}</td>
                <td className="px-3 py-3"><StatutChip statut={r.statut} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2.5">
        <a
          href="/admin/candidatures/export/csv"
          className={`rounded-md bg-ss-teal px-5 py-2.5 text-xs font-bold text-ss-bg ${rows.length === 0 ? 'pointer-events-none opacity-40' : ''}`}
        >
          ⬇ Télécharger le CSV ({rows.length} email{rows.length > 1 ? 's' : ''})
        </a>
        <MarkExportedButton ids={rows.map((r) => r.id)} />
        <span className="text-xs text-ss-fg/55">Un email par ligne — format liste de testeurs Google Play. Marquez exportés <b>après</b> l'import dans la Console.</span>
      </div>
    </main>
  )
}
