import { isAuthenticated } from '@/lib/admin/auth'
import { queryCandidatures } from '@/lib/admin/notion'

export const dynamic = 'force-dynamic'

export async function GET() {
  if (!(await isAuthenticated())) return new Response('Unauthorized', { status: 401 })

  const rows = await queryCandidatures()
  const emails = rows
    .filter((r) => r.statut === 'Accepté' && r.emailGooglePlay && !r.exportGooglePlay)
    .map((r) => r.emailGooglePlay)

  // Format liste de testeurs Google Play Console : un email par ligne, sans en-tête.
  const body = emails.join('\n') + (emails.length ? '\n' : '')
  const today = new Date().toISOString().slice(0, 10)

  return new Response(body, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="seascope-testeurs-${today}.csv"`,
    },
  })
}
