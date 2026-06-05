import type { Metadata } from 'next'
import { verifyCandidatureToken } from '@/lib/beta/token'
import { getCandidature } from '@/lib/admin/notion'
import BetaShell from '@/components/beta/BetaShell'
import LienInvalide from '@/components/beta/LienInvalide'
import ProblemeForm from '@/components/beta/ProblemeForm'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'Signaler un problème — SeaScope',
  robots: { index: false, follow: false },
}

export default async function ProblemePage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>
}) {
  const { t } = await searchParams
  const id = verifyCandidatureToken(t)
  if (!id) return <LienInvalide />
  let prenom = ''
  try {
    prenom = (await getCandidature(id)).prenom
  } catch {
    return <LienInvalide />
  }
  return (
    <BetaShell>
      <ProblemeForm token={t!} prenom={prenom} />
    </BetaShell>
  )
}
