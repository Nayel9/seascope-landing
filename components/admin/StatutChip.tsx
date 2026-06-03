const styles: Record<string, string> = {
  'Nouveau': 'bg-blue-400/15 text-blue-400',
  'En cours': 'bg-ss-variable/15 text-ss-variable',
  'En attente': 'bg-gray-400/15 text-gray-400',
  'Accepté': 'bg-ss-bon/15 text-ss-bon',
  'Refusé': 'bg-ss-deconseille/15 text-ss-deconseille',
  'Invité Google Play': 'bg-purple-400/15 text-purple-400',
  'Actif': 'bg-ss-teal/15 text-ss-teal',
  'Inactif': 'bg-amber-700/15 text-amber-600',
}

export default function StatutChip({ statut }: { statut: string }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${styles[statut] ?? 'bg-gray-400/15 text-gray-400'}`}>
      {statut || '—'}
    </span>
  )
}
