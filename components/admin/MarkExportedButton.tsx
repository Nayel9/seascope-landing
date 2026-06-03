'use client'

import { useState, useTransition } from 'react'
import { marquerExportes } from '@/lib/admin/actions'

export default function MarkExportedButton({ ids }: { ids: string[] }) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  return (
    <span>
      <button
        disabled={pending || ids.length === 0}
        onClick={() =>
          startTransition(async () => {
            setError(null)
            const r = await marquerExportes(ids)
            if (!r.ok) setError(r.error ?? 'Erreur')
          })
        }
        className="rounded-md border border-gray-400/25 bg-gray-400/10 px-5 py-2.5 text-xs font-semibold text-gray-300 disabled:opacity-40"
      >
        {pending ? 'Marquage…' : `☑ Marquer comme exportés (${ids.length})`}
      </button>
      {error && <span className="ml-3 text-xs text-ss-deconseille">{error}</span>}
    </span>
  )
}
