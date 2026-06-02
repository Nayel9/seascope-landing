import { NextResponse } from 'next/server'

// ── Types ─────────────────────────────────────────────────────────────────────

interface FeedbackPayload {
  email: string
  fbtype: string
  spot?: string
  what: string
  expected?: string
}

// ── HTML escape — applied to every user value before email template insertion ──

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// ── Validation ────────────────────────────────────────────────────────────────

function validateEnv() {
  const required = ['BREVO_API_KEY', 'BREVO_SENDER', 'BREVO_SENDER_NAME', 'OWNER_EMAIL', 'NOTION_TOKEN', 'NOTION_FEEDBACK_DB_ID'] as const
  const missing = required.filter((k) => !process.env[k])
  if (missing.length) throw new Error(`Variables manquantes: ${missing.join(', ')}`)
  return {
    brevoKey:         process.env.BREVO_API_KEY!,
    brevoSender:      process.env.BREVO_SENDER!,
    brevoName:        process.env.BREVO_SENDER_NAME!,
    ownerEmail:       process.env.OWNER_EMAIL!,
    notionToken:      process.env.NOTION_TOKEN!,
    notionFeedbackDb: process.env.NOTION_FEEDBACK_DB_ID!,
  }
}

function validate(data: unknown): FeedbackPayload {
  if (!data || typeof data !== 'object') throw new Error('Payload invalide')
  const d = data as Record<string, unknown>
  const errors: string[] = []
  if (!d.email || typeof d.email !== 'string' || !/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(d.email)) errors.push('Email invalide')
  if (!d.fbtype) errors.push('Type de retour requis')
  if (!d.what || typeof d.what !== 'string' || d.what.trim().length < 10) errors.push('Description trop courte (min. 10 caractères)')
  if (errors.length) throw new Error(errors.join(', '))
  return {
    email:    (d.email as string).trim().toLowerCase().slice(0, 254),
    fbtype:   (d.fbtype as string).trim().slice(0, 100),
    spot:     typeof d.spot === 'string' ? d.spot.trim().slice(0, 200) : undefined,
    what:     (d.what as string).trim().slice(0, 2000),
    expected: typeof d.expected === 'string' ? d.expected.trim().slice(0, 2000) : undefined,
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
  if (!res.ok) throw new Error(`Brevo error ${res.status}: ${await res.text()}`)
}

// All user-controlled values are passed through esc() before HTML insertion.
function ownerHtml(p: FeedbackPayload): string {
  const rows = [
    ['Email', `<a href="mailto:${esc(p.email)}" style="color:#5EEAD4">${esc(p.email)}</a>`],
    ['Type',  esc(p.fbtype)],
    ...(p.spot ? [['Spot', esc(p.spot)]] : []),
  ].map(([k, v]) =>
    `<tr><td style="padding:10px 12px;background:#f8f9fa;font-weight:600;color:#0E2236;width:34%;border-bottom:1px solid #e9ecef">${k}</td><td style="padding:10px 12px;border-bottom:1px solid #e9ecef;color:#555">${v}</td></tr>`
  ).join('')

  const expectedBlock = p.expected
    ? `<div style="margin-top:12px;padding:16px;background:#f0faf8;border-left:3px solid #5EEAD4;border-radius:4px"><p style="margin:0 0 8px;font-weight:600;color:#0E2236;font-size:13px">Ce qu&rsquo;on attendait</p><p style="margin:0;font-size:14px;color:#555;line-height:1.6;white-space:pre-wrap">${esc(p.expected)}</p></div>`
    : ''

  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>Nouveau retour SeaScope</title></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',sans-serif;background:#f4f4f4">
<table role="presentation" style="width:100%;border-collapse:collapse"><tr><td style="padding:40px 0;text-align:center">
<table role="presentation" style="width:600px;margin:0 auto;background:#fff;box-shadow:0 4px 6px rgba(0,0,0,.1)">
<tr><td style="padding:36px 30px;background:linear-gradient(135deg,#0E2236,#061425);text-align:center">
<h1 style="margin:0;color:#5EEAD4;font-size:22px;font-weight:600">&#128205; Nouveau retour terrain</h1>
<p style="margin:8px 0 0;color:rgba(230,238,246,.7);font-size:13px">${new Date().toLocaleString('fr-FR')} &mdash; ${esc(p.fbtype)}</p>
</td></tr>
<tr><td style="padding:36px 30px">
<table role="presentation" style="width:100%;border-collapse:collapse;font-size:14px">${rows}</table>
<div style="margin-top:20px;padding:16px;background:#f8f9fa;border-left:3px solid #F59E0B;border-radius:4px">
<p style="margin:0 0 8px;font-weight:600;color:#0E2236;font-size:13px">Ce qui s&rsquo;est pass&eacute;</p>
<p style="margin:0;font-size:14px;color:#555;line-height:1.6;white-space:pre-wrap">${esc(p.what)}</p>
</div>
${expectedBlock}
</td></tr>
<tr><td style="padding:24px;background:#f8f9fa;text-align:center;font-size:12px;color:#777">SeaScope &middot; Beta ferm&eacute;e 2026</td></tr>
</table></td></tr></table></body></html>`
}

function clientHtml(p: FeedbackPayload): string {
  const spotLine = p.spot ? `Spot&nbsp;: <strong>${esc(p.spot)}</strong><br>` : ''
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>Retour re&ccedil;u &mdash; SeaScope</title></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',sans-serif;background:#f4f4f4">
<table role="presentation" style="width:100%;border-collapse:collapse"><tr><td style="padding:40px 0;text-align:center">
<table role="presentation" style="width:600px;margin:0 auto;background:#fff;box-shadow:0 4px 6px rgba(0,0,0,.1)">
<tr><td style="padding:36px 30px;background:linear-gradient(135deg,#0E2236,#061425);text-align:center">
<h1 style="margin:0;color:#5EEAD4;font-size:22px;font-weight:600">Retour bien re&ccedil;u</h1>
</td></tr>
<tr><td style="padding:36px 30px;font-size:15px;line-height:1.7;color:#444">
<p style="margin:0 0 16px">Merci pour ce retour &mdash; c&rsquo;est exactement ce dont on a besoin pour calibrer SeaScope.</p>
<div style="margin:24px 0;padding:18px;background:#f0faf8;border-left:3px solid #5EEAD4;border-radius:4px">
<p style="margin:0;font-size:14px;color:#555;line-height:1.8">
Type&nbsp;: <strong>${esc(p.fbtype)}</strong><br>
${spotLine}
</p></div>
<p style="margin:0">On revient vers vous si on a besoin de pr&eacute;cisions. En attendant, continuez &agrave; naviguer &#127754;</p>
</td></tr>
<tr><td style="padding:24px;background:#f8f9fa;text-align:center">
<p style="margin:0;font-size:13px;color:#0E2236;font-weight:600">SeaScope</p>
<p style="margin:4px 0 0;font-size:12px;color:#777">Copilote d&eacute;cisionnel pour la navigation c&ocirc;ti&egrave;re &middot; Beta 2026<br>
<a href="mailto:seascope-contact@pennarstudio.fr" style="color:#5EEAD4">seascope-contact@pennarstudio.fr</a></p>
</td></tr>
</table></td></tr></table></body></html>`
}

// ── Notion ────────────────────────────────────────────────────────────────────

async function createNotionFeedbackPage(token: string, dbId: string, p: FeedbackPayload) {
  const properties: Record<string, unknown> = {
    'Email':               { title: [{ text: { content: p.email } }] },
    'Type de retour':      { select: { name: p.fbtype } },
    "Ce qui s'est passé":  { rich_text: [{ text: { content: p.what } }] },
    'Statut':              { select: { name: 'Nouveau' } },
    'Date':                { date: { start: new Date().toISOString() } },
  }
  if (p.spot)     properties['Spot']               = { rich_text: [{ text: { content: p.spot } }] }
  if (p.expected) properties["Ce qu'on attendait"] = { rich_text: [{ text: { content: p.expected } }] }

  const res = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
    },
    body: JSON.stringify({ parent: { database_id: dbId }, properties }),
  })
  if (!res.ok) throw new Error(`Notion error ${res.status}: ${await res.text()}`)
}

// ── Handler ───────────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const env = validateEnv()
    const raw = await request.json()
    const payload = validate(raw)

    await Promise.all([
      sendBrevo(env.brevoKey, {
        sender: { name: env.brevoName, email: env.brevoSender },
        to: [{ email: env.ownerEmail }],
        subject: `Retour beta [${payload.fbtype}]${payload.spot ? ` — ${payload.spot}` : ''}`,
        htmlContent: ownerHtml(payload),
      }),
      sendBrevo(env.brevoKey, {
        sender: { name: env.brevoName, email: env.brevoSender },
        to: [{ email: payload.email }],
        subject: 'Retour bien reçu — SeaScope',
        htmlContent: clientHtml(payload),
      }),
      createNotionFeedbackPage(env.notionToken, env.notionFeedbackDb, payload),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[api/feedback]', error)
    const message = error instanceof Error ? error.message : 'Erreur interne'
    const status = message.includes('invalide') || message.includes('requis') || message.includes('courte') ? 400 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
