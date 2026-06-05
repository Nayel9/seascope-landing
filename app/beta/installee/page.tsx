import type { Metadata } from 'next'
import { verifyCandidatureToken } from '@/lib/beta/token'
import { getCandidature } from '@/lib/admin/notion'
import BetaShell from '@/components/beta/BetaShell'
import LienInvalide from '@/components/beta/LienInvalide'
import ConfirmInstallation from '@/components/beta/ConfirmInstallation'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'Confirmation d’installation — SeaScope',
  robots: { index: false, follow: false },
}

export default async function InstalleePage({
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
      <ConfirmInstallation
        token={t!}
        prenom={prenom}
        formUrl={process.env.FEEDBACK_FORM_URL ?? ''}
        whatsappUrl={process.env.WHATSAPP_GROUP_URL ?? ''}
      />
    </BetaShell>
  )
}
