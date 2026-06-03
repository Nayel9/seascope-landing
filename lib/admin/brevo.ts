export interface BrevoEnv {
  apiKey: string
  sender: { name: string; email: string }
}

export function brevoEnv(): BrevoEnv {
  const apiKey = process.env.BREVO_API_KEY
  const senderEmail = process.env.BREVO_SENDER
  const senderName = process.env.BREVO_SENDER_NAME
  if (!apiKey || !senderEmail || !senderName) {
    throw new Error('Variables manquantes: BREVO_API_KEY, BREVO_SENDER, BREVO_SENDER_NAME')
  }
  return { apiKey, sender: { name: senderName, email: senderEmail } }
}

export async function sendBrevo(to: { email: string; name?: string }, subject: string, htmlContent: string): Promise<void> {
  const { apiKey, sender } = brevoEnv()
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'api-key': apiKey },
    body: JSON.stringify({ sender, to: [to], subject, htmlContent }),
  })
  if (!res.ok) throw new Error(`Brevo error ${res.status}: ${await res.text()}`)
}
