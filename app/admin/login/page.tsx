import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { isAuthenticated } from '@/lib/admin/auth'
import LoginForm from '@/components/admin/LoginForm'

export const metadata: Metadata = { title: 'SeaScope Admin — Connexion', robots: { index: false } }
export const dynamic = 'force-dynamic'

export default async function LoginPage() {
  if (await isAuthenticated()) redirect('/admin/candidatures')
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-ss-bg px-4">
      <h1 className="text-xl font-bold text-ss-teal">⚓ SeaScope Admin</h1>
      <LoginForm />
    </main>
  )
}
