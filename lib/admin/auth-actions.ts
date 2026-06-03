'use server'

import { redirect } from 'next/navigation'
import { createSession, destroySession, verifyPassword } from '@/lib/admin/auth'

export interface LoginState {
  error?: string
}

export async function login(_prev: LoginState | undefined, formData: FormData): Promise<LoginState> {
  const password = formData.get('password')
  if (typeof password !== 'string' || !verifyPassword(password)) {
    return { error: 'Mot de passe incorrect' }
  }
  await createSession()
  redirect('/admin/candidatures')
}

export async function logout(): Promise<void> {
  await destroySession()
  redirect('/admin/login')
}
