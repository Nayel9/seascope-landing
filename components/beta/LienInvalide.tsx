import BetaShell from '@/components/beta/BetaShell'

export default function LienInvalide() {
  return (
    <BetaShell>
      <h1 className="text-[clamp(26px,3vw,36px)] leading-[1.15] tracking-[-0.02em] font-medium m-0">
        Ce lien n&rsquo;est plus valide
      </h1>
      <p className="mt-4 text-[15px] leading-[1.7] text-ss-fg/72">
        Pas d&rsquo;inquiétude&nbsp;: répondez simplement au mail d&rsquo;invitation et on s&rsquo;occupe de vous.
      </p>
    </BetaShell>
  )
}
