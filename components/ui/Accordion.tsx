'use client'

import { useState, useId, useRef } from 'react'
import clsx from 'clsx'

interface AccordionItem {
  q: string
  a: React.ReactNode
}

interface AccordionProps {
  items: AccordionItem[]
}

function AccordionRow({ q, a, index }: AccordionItem & { index: number }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  const contentRef = useRef<HTMLDivElement>(null)

  // prefers-reduced-motion via CSS only — transition is defined in className,
  // browser will honour the media query automatically via Tailwind's motion-reduce variant.

  return (
    <div className="border-b border-white/7 last:border-b-0">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        id={`${id}-trigger`}
        onClick={() => setOpen((v) => !v)}
        className={clsx(
          'w-full flex items-center justify-between gap-4',
          'py-5 px-0 text-left',
          'text-[15px] font-medium text-ss-fg leading-snug',
          'cursor-pointer transition-colors duration-150',
          'hover:text-ss-teal focus-visible:outline-none focus-visible:text-ss-teal',
        )}
      >
        <span>{q}</span>
        <span
          aria-hidden="true"
          className={clsx(
            'flex-none w-5 h-5 rounded-full border border-white/14',
            'inline-flex items-center justify-center',
            'transition-[transform,border-color] duration-200 motion-reduce:transition-none',
            open && 'rotate-45 border-ss-teal/50'
          )}
        >
          <svg viewBox="0 0 10 10" className="w-3 h-3" fill="none" aria-hidden="true">
            <path d="M5 2v6M2 5h6" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/>
          </svg>
        </span>
      </button>

      <div
        id={`${id}-panel`}
        role="region"
        aria-labelledby={`${id}-trigger`}
        ref={contentRef}
        className={clsx(
          'overflow-hidden',
          'transition-[max-height,opacity] duration-300 ease-in-out motion-reduce:transition-none',
          open ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="pb-5 text-[14px] leading-relaxed text-ss-fg/72">
          {a}
        </div>
      </div>
    </div>
  )
}

export function Accordion({ items }: AccordionProps) {
  return (
    <div className="divide-y divide-white/7 rounded-ss-lg border border-white/7 bg-ss-surface px-6">
      {items.map((item, i) => (
        <AccordionRow key={i} {...item} index={i} />
      ))}
    </div>
  )
}
