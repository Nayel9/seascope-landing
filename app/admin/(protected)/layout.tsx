import type { Metadata } from 'next'
import AdminNav from '@/components/admin/AdminNav'

export const metadata: Metadata = { title: 'SeaScope Admin', robots: { index: false } }

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ss-surface text-ss-fg">
      <AdminNav />
      {children}
    </div>
  )
}
