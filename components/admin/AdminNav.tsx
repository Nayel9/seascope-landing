import Link from 'next/link'
import { logout } from '@/lib/admin/auth-actions'

const links = [
  { href: '/admin/candidatures', label: 'Candidatures' },
  { href: '/admin/feedbacks', label: 'Feedbacks' },
  { href: '/admin/candidatures/export', label: 'Export CSV' },
]

export default function AdminNav() {
  return (
    <nav className="flex items-center gap-6 border-b border-ss-teal/15 bg-ss-bg px-6 py-3.5">
      <span className="text-sm font-bold tracking-wide text-ss-teal">⚓ SeaScope Admin</span>
      {links.map((l) => (
        <Link key={l.href} href={l.href} className="text-sm text-ss-fg/75 hover:text-ss-teal">
          {l.label}
        </Link>
      ))}
      <form action={logout} className="ml-auto">
        <button type="submit" className="text-xs text-ss-fg/50 underline hover:text-ss-fg">
          déconnexion
        </button>
      </form>
    </nav>
  )
}
