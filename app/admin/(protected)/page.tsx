import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/admin/auth'

export default async function AdminIndex() {
  await requireAdmin()
  redirect('/admin/candidatures')
}
