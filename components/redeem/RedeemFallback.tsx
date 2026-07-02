import BetaShell from '@/components/beta/BetaShell'

export default function RedeemFallback({ email, playUrl }: { email?: string; playUrl: string }) {
  return (
    <BetaShell>
      <h1 className="text-[clamp(26px,3vw,36px)] leading-[1.15] tracking-[-0.02em] font-medium m-0">
        Activez votre Premium+
      </h1>
      <p className="mt-4 text-[15px] leading-[1.7] text-ss-fg/72">
        Ouvrez ce lien <strong>depuis votre téléphone</strong>&nbsp;: l&rsquo;app SeaScope
        s&rsquo;ouvre et Premium+ s&rsquo;active après connexion
        {email ? <> (utilisez de préférence l&rsquo;email <strong>{email}</strong>)</> : null}.
      </p>
      <p className="mt-6">
        <a href={playUrl} className="inline-block rounded-lg bg-ss-accent px-7 py-3.5 text-[16px] font-semibold text-ss-bg no-underline">
          Installer SeaScope
        </a>
      </p>
      <p className="mt-4 text-[13px] leading-[1.6] text-ss-fg/60">
        L&rsquo;app n&rsquo;est pas encore installée&nbsp;? Installez-la, puis
        <strong> rouvrez ce lien</strong> depuis votre téléphone — il reste valable 30&nbsp;jours.
      </p>
    </BetaShell>
  )
}
