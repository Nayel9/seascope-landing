'use client'

import { useActionState } from 'react'
import { login, type LoginState } from '@/lib/admin/auth-actions'

export default function LoginForm() {
  const [state, action, pending] = useActionState<LoginState | undefined, FormData>(login, undefined)

  return (
    <form action={action} className="w-full max-w-sm space-y-4">
      <input
        type="password"
        name="password"
        required
        autoFocus
        placeholder="Mot de passe"
        className="w-full rounded-ss border border-ss-teal/25 bg-ss-surface px-4 py-3 text-ss-fg outline-none focus:border-ss-teal"
      />
      {state?.error && <p className="text-sm text-ss-deconseille">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-ss bg-ss-teal px-4 py-3 font-semibold text-ss-bg disabled:opacity-50"
      >
        {pending ? 'Connexion…' : 'Se connecter'}
      </button>
    </form>
  )
}
