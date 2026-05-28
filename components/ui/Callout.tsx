interface CalloutProps {
  num: string
  label: string
  text: string
  style?: React.CSSProperties
}

export function Callout({ num, label, text, style }: CalloutProps) {
  return (
    <div
      className="absolute z-10 hidden lg:flex gap-3 items-start max-w-[240px] rounded-[14px] border border-white/14 px-3.5 py-3 backdrop-blur-sm"
      style={{
        background: 'rgba(14,34,54,0.92)',
        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)',
        ...style,
      }}
    >
      <div className="w-[22px] h-[22px] rounded-full bg-ss-teal text-[#052a26] flex-none inline-flex items-center justify-center font-mono text-[11px] font-semibold shrink-0">
        {num}
      </div>
      <div>
        <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-ss-fg/50 mb-0.5">
          {label}
        </div>
        <div className="text-[13px] text-ss-fg leading-[1.35]">{text}</div>
      </div>
    </div>
  )
}
