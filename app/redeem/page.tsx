import type { Metadata } from 'next'
import { verifyPremiumToken } from '@/lib/campaign/premiumToken'
import RedeemFallback from '@/components/redeem/RedeemFallback'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'Activer Premium+ — SeaScope',
  robots: { index: false, follow: false },
}

export default async function RedeemPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>
}) {
  const { t } = await searchParams
  // Décodage best-effort de l'email pour l'affichage uniquement. Aucune confiance
  // sécurité, aucune mutation : le vrai grant se fait dans l'app (POST backend).
  const payload = verifyPremiumToken(t)
  const playUrl = process.env.GOOGLE_PLAY_URL ?? ''
  return <RedeemFallback email={payload?.e} playUrl={playUrl} />
}
