import { NextResponse } from 'next/server'

// ── Types ─────────────────────────────────────────────────────────────────────

interface BetaPayload {
  firstname: string
  email: string
  region: string
  navType: string
  freq: string
  boat?: string
  platform: string
  practice: string
  blocker?: string
}

// ── Validation ────────────────────────────────────────────────────────────────

function validateEnv() {
  const required = ['BREVO_API_KEY', 'BREVO_SENDER', 'BREVO_SENDER_NAME', 'OWNER_EMAIL', 'NOTION_TOKEN', 'NOTION_BETA_DB_ID'] as const
  const missing = required.filter((k) => !process.env[k])
  if (missing.length) throw new Error(`Variables manquantes: ${missing.join(', ')}`)
  return {
    brevoKey:     process.env.BREVO_API_KEY!,
    brevoSender:  process.env.BREVO_SENDER!,
    brevoName:    process.env.BREVO_SENDER_NAME!,
    ownerEmail:   process.env.OWNER_EMAIL!,
    notionToken:  process.env.NOTION_TOKEN!,
    notionBetaDb: process.env.NOTION_BETA_DB_ID!,
  }
}

function validate(data: unknown): BetaPayload {
  if (!data || typeof data !== 'object') throw new Error('Payload invalide')
  const d = data as Record<string, unknown>
  const errors: string[] = []
  if (!d.firstname || typeof d.firstname !== 'string' || d.firstname.trim().length < 2) errors.push('Prénom requis')
  if (!d.email || typeof d.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) errors.push('Email invalide')
  if (!d.region || typeof d.region !== 'string' || d.region.trim().length < 2) errors.push('Région requise')
  if (!d.navType) errors.push('Type de navigation requis')
  if (!d.freq) errors.push('Fréquence requise')
  if (!d.platform) errors.push('Plateforme requise')
  if (!d.practice) errors.push('Pratique requise')
  if (errors.length) throw new Error(errors.join(', '))
  return {
    firstname: (d.firstname as string).trim(),
    email:     (d.email as string).trim().toLowerCase(),
    region:    (d.region as string).trim(),
    navType:   (d.navType as string).trim(),
    freq:      (d.freq as string).trim(),
    boat:      typeof d.boat === 'string' ? d.boat.trim() : undefined,
    platform:  (d.platform as string).trim(),
    practice:  (d.practice as string).trim(),
    blocker:   typeof d.blocker === 'string' ? d.blocker.trim() : undefined,
  }
}

// ── Brevo ─────────────────────────────────────────────────────────────────────

async function sendBrevo(apiKey: string, payload: {
  sender: { name: string; email: string }
  to: Array<{ email: string; name?: string }>
  subject: string
  htmlContent: string
}) {
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'api-key': apiKey },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`Brevo error ${res.status}: ${txt}`)
  }
}

function ownerHtml(p: BetaPayload): string {
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>Nouvelle candidature SeaScope</title></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',sans-serif;background:#f4f4f4">
<table role="presentation" style="width:100%;border-collapse:collapse">
<tr><td style="padding:40px 0;text-align:center">
<table role="presentation" style="width:600px;margin:0 auto;background:#fff;box-shadow:0 4px 6px rgba(0,0,0,.1)">
<tr><td style="padding:36px 30px;background:linear-gradient(135deg,#0E2236,#061425);text-align:center">
<h1 style="margin:0;color:#5EEAD4;font-size:24px;font-weight:600">&#9875; Nouvelle candidature beta</h1>
<p style="margin:8px 0 0;color:rgba(230,238,246,.7);font-size:13px">${new Date().toLocaleString('fr-FR')}</p>
</td></tr>
<tr><td style="padding:36px 30px">
<table role="presentation" style="width:100%;border-collapse:collapse;font-size:14px">
${[
  ['Prénom', p.firstname],
  ['Email', `<a href="mailto:${p.email}" style="color:#5EEAD4">${p.email}</a>`],
  ['Région', p.region],
  ['Type de navigation', p.navType],
  ['Fréquence', p.freq],
  ['Plateforme', p.platform],
  ['Pratique', p.practice],
  ...(p.boat ? [['Bateau', p.boat]] : []),
].map(([k, v]) => `<tr>
  <td style="padding:10px 12px;background:#f8f9fa;font-weight:600;color:#0E2236;width:38%;border-bottom:1px solid #e9ecef">${k}</td>
  <td style="padding:10px 12px;border-bottom:1px solid #e9ecef;color:#555">${v}</td>
</tr>`).join('')}
</table>
${p.blocker ? `<div style="margin-top:24px;padding:18px;background:#f0faf8;border-left:3px solid #5EEAD4;font-size:14px;color:#555;line-height:1.6"><strong style="color:#0E2236">Raison de renoncement :</strong><br>${p.blocker}</div>` : ''}
</td></tr>
<tr><td style="padding:24px;background:#f8f9fa;text-align:center;font-size:12px;color:#777">SeaScope · Beta fermée 2026</td></tr>
</table></td></tr></table>
</body></html>`
}

function clientHtml(p: BetaPayload): string {
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>Candidature reçue — SeaScope</title></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',sans-serif;background:#f4f4f4">
<table role="presentation" style="width:100%;border-collapse:collapse">
<tr><td style="padding:40px 0;text-align:center">
<table role="presentation" style="width:600px;margin:0 auto;background:#fff;box-shadow:0 4px 6px rgba(0,0,0,.1)">
<tr><td style="padding:36px 30px;background:linear-gradient(135deg,#0E2236,#061425);text-align:center">
<h1 style="margin:0;color:#5EEAD4;font-size:24px;font-weight:600">Bienvenue à bord, ${p.firstname} &#9875;</h1>
</td></tr>
<tr><td style="padding:36px 30px;font-size:15px;line-height:1.7;color:#444">
<p style="margin:0 0 16px">On a bien reçu votre candidature à la beta fermée SeaScope.</p>
<div style="margin:24px 0;padding:20px;background:#f0faf8;border-left:3px solid #5EEAD4;border-radius:4px">
<p style="margin:0 0 8px;font-weight:600;color:#0E2236">Récapitulatif</p>
<p style="margin:0;font-size:14px;color:#555;line-height:1.8">
Pratique : <strong>${p.practice}</strong><br>
Type de navigation : <strong>${p.navType}</strong><br>
Plateforme : <strong>${p.platform}</strong>
</p></div>
<p style="margin:16px 0">Vous recevrez un accès à l'application et une invitation au Discord testeurs <strong>dans les prochains jours</strong>.</p>
<p style="margin:0;font-size:13px;color:#777">Des questions ? Répondez directement à cet email.</p>
</td></tr>
<tr><td style="padding:24px;background:#f8f9fa;text-align:center">
<p style="margin:0;font-size:13px;color:#0E2236;font-weight:600">SeaScope</p>
<p style="margin:4px 0 0;font-size:12px;color:#777">Copilote météo décisionnel · Beta 2026<br>
<a href="mailto:seascope-contact@pennarstudio.fr" style="color:#5EEAD4">seascope-contact@pennarstudio.fr</a></p>
</td></tr>
</table></td></tr></table>
</body></html>`
}

// ── Notion ────────────────────────────────────────────────────────────────────

async function createNotionBetaPage(token: string, dbId: string, p: BetaPayload) {
  const properties: Record<string, unknown> = {
    'Prénom':              { title: [{ text: { content: p.firstname } }] },
    'Email':               { email: p.email },
    'Région':              { rich_text: [{ text: { content: p.region } }] },
    'Type de navigation':  { select: { name: p.navType } },
    'Fréquence':           { select: { name: p.freq } },
    'Plateforme':          { select: { name: p.platform } },
    'Pratique':            { select: { name: p.practice } },
    'Statut':              { select: { name: 'Nouveau' } },
    'Source':              { rich_text: [{ text: { content: 'Landing page — Formulaire beta' } }] },
    'Date de candidature': { date: { start: new Date().toISOString() } },
  }
  if (p.boat)    properties['Bateau']                = { rich_text: [{ text: { content: p.boat } }] }
  if (p.blocker) properties['Raison de renoncement'] = { rich_text: [{ text: { content: p.blocker } }] }

  const res = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
    },
    body: JSON.stringify({ parent: { database_id: dbId }, properties }),
  })
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`Notion error ${res.status}: ${txt}`)
  }
}

// ── Handler ───────────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const env = validateEnv()
    const raw = await request.json()

    // honeypot
    if (raw && typeof raw === 'object' && (raw as Record<string, unknown>).website) {
      return NextResponse.json({ success: true })
    }

    const payload = validate(raw)

    await Promise.all([
      sendBrevo(env.brevoKey, {
        sender: { name: env.brevoName, email: env.brevoSender },
        to: [{ email: env.ownerEmail }],
        subject: `Nouvelle candidature beta — ${payload.firstname} (${payload.practice})`,
        htmlContent: ownerHtml(payload),
      }),
      sendBrevo(env.brevoKey, {
        sender: { name: env.brevoName, email: env.brevoSender },
        to: [{ email: payload.email, name: payload.firstname }],
        subject: 'Bienvenue à bord — votre candidature SeaScope',
        htmlContent: clientHtml(payload),
      }),
      createNotionBetaPage(env.notionToken, env.notionBetaDb, payload),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[api/beta]', error)
    const message = error instanceof Error ? error.message : 'Erreur interne'
    const status = message.includes('invalide') || message.includes('requis') ? 400 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
