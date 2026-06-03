function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function emailEnv() {
  const playUrl = process.env.GOOGLE_PLAY_URL
  const formUrl = process.env.FEEDBACK_FORM_URL
  if (!playUrl || !formUrl) throw new Error('Variables manquantes: GOOGLE_PLAY_URL, FEEDBACK_FORM_URL')
  return { playUrl, formUrl }
}

export interface EmailContent {
  subject: string
  html: string
}

const shell = (title: string, inner: string) => `<!DOCTYPE html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(title)}</title></head>
<body style="margin:0;padding:0;background-color:#0b1d2a;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0b1d2a;padding:32px 16px;">
<tr><td align="center">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background-color:#102a3c;border-radius:12px;overflow:hidden;">
${inner}
</table>
<p style="margin:20px 0 0;color:#54707f;font-size:11px;">Vous recevez cet email car vous avez candidat&eacute; &agrave; la b&ecirc;ta SeaScope.</p>
</td></tr></table></body></html>`

// `h1` doit être pré-encodé (entités HTML) — les appelants passent des littéraux, jamais de valeur candidat.
const header = (h1: string) => `<tr><td style="padding:40px 40px 24px;">
<p style="margin:0;color:#7fd1c8;font-size:13px;letter-spacing:2px;text-transform:uppercase;">SeaScope &mdash; B&ecirc;ta ferm&eacute;e</p>
<h1 style="margin:12px 0 0;color:#f4f7f9;font-size:26px;line-height:1.3;font-weight:600;">${h1}</h1>
</td></tr>`

const signature = `<p style="margin:0;color:#7a93a3;font-size:14px;line-height:1.6;">Bonne nav,<br><span style="color:#f4f7f9;font-weight:600;">Nayel &mdash; SeaScope</span></p>`

export function invitationEmail(c: { prenom: string; emailGooglePlay: string }): EmailContent {
  const { playUrl, formUrl } = emailEnv()
  const prenom = esc(c.prenom)
  const gp = esc(c.emailGooglePlay)
  const inner = `${header('Votre acc&egrave;s &agrave; la b&ecirc;ta est ouvert')}
<tr><td style="padding:0 40px;">
<p style="margin:0 0 16px;color:#c2d3dd;font-size:15px;line-height:1.6;">Bonjour ${prenom},</p>
<p style="margin:0 0 16px;color:#c2d3dd;font-size:15px;line-height:1.6;">Merci d'avoir candidat&eacute; pour tester SeaScope. SeaScope est un copilote m&eacute;t&eacute;o d&eacute;cisionnel pour la navigation c&ocirc;ti&egrave;re&nbsp;: savoir rapidement <strong style="color:#f4f7f9;">quand sortir, quand rentrer, et avec quel niveau de confiance</strong>.</p>
<p style="margin:0 0 24px;color:#c2d3dd;font-size:15px;line-height:1.6;">L'app est en b&ecirc;ta ferm&eacute;e Android. Votre retour terrain est ce qui fera la diff&eacute;rence.</p>
</td></tr>
<tr><td style="padding:0 40px 8px;" align="center">
<a href="${esc(playUrl)}" style="display:inline-block;background-color:#1ec8a5;color:#06151f;text-decoration:none;font-size:16px;font-weight:600;padding:14px 36px;border-radius:8px;">Rejoindre la b&ecirc;ta sur Google Play</a>
<p style="margin:12px 0 0;color:#7a93a3;font-size:12px;line-height:1.5;">Ouvrez ce lien depuis votre Android, connect&eacute; au compte Google ${gp}.</p>
</td></tr>
<tr><td style="padding:24px 40px 0;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0b1f2e;border-radius:8px;">
<tr><td style="padding:20px 24px;">
<p style="margin:0 0 8px;color:#f4f7f9;font-size:14px;font-weight:600;">Comment installer</p>
<p style="margin:0;color:#c2d3dd;font-size:14px;line-height:1.7;">1. Acceptez l'invitation au programme de test.<br>2. Installez SeaScope depuis Google Play.<br>3. Ouvrez l'app avant vos vraies sorties, naviguez comme d'habitude.</p>
</td></tr></table>
</td></tr>
<tr><td style="padding:24px 40px 0;">
<p style="margin:0 0 16px;color:#c2d3dd;font-size:15px;line-height:1.6;">Apr&egrave;s quelques sorties, racontez-nous ce qui s'est r&eacute;ellement pass&eacute; &mdash; 5 minutes&nbsp;:</p>
<p style="margin:0 0 24px;"><a href="${esc(formUrl)}" style="color:#1ec8a5;font-size:15px;font-weight:600;text-decoration:none;">&rarr; Formulaire de retour terrain</a></p>
<p style="margin:0 0 32px;color:#c2d3dd;font-size:15px;line-height:1.6;">Une pr&eacute;cision&nbsp;: on ne cherche pas des compliments. On cherche des retours honn&ecirc;tes &mdash; les moments o&ugrave; l'app vous a aid&eacute; &agrave; d&eacute;cider, et surtout ceux o&ugrave; elle vous a sembl&eacute; incoh&eacute;rente ou pas digne de confiance.</p>
</td></tr>
<tr><td style="padding:0 40px 36px;">${signature}</td></tr>`
  return { subject: 'Votre accès à la bêta SeaScope est ouvert', html: shell('Votre accès à la bêta SeaScope est ouvert', inner) }
}

export function relanceEmail(c: { prenom: string }): EmailContent {
  const { formUrl } = emailEnv()
  const prenom = esc(c.prenom)
  const inner = `${header('Premier retour&nbsp;?')}
<tr><td style="padding:0 40px;">
<p style="margin:0 0 16px;color:#c2d3dd;font-size:15px;line-height:1.6;">Bonjour ${prenom},</p>
<p style="margin:0 0 24px;color:#c2d3dd;font-size:15px;line-height:1.6;">Vous avez rejoint la b&ecirc;ta SeaScope il y a quelques jours &mdash; merci encore. Quatre questions rapides&nbsp;:</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0b1f2e;border-radius:8px;">
<tr><td style="padding:20px 24px;">
<p style="margin:0;color:#c2d3dd;font-size:14px;line-height:1.9;">1. Avez-vous ouvert l'app&nbsp;?<br>2. Avez-vous pr&eacute;par&eacute; une sortie avec&nbsp;?<br>3. Avez-vous chang&eacute; une d&eacute;cision gr&acirc;ce &agrave; elle (horaire, spot, dur&eacute;e, annulation, retour anticip&eacute;)&nbsp;?<br>4. Qu'est-ce qui vous a g&ecirc;n&eacute; ou sembl&eacute; incoh&eacute;rent&nbsp;?</p>
</td></tr></table>
</td></tr>
<tr><td style="padding:24px 40px 8px;" align="center">
<a href="${esc(formUrl)}" style="display:inline-block;background-color:#1ec8a5;color:#06151f;text-decoration:none;font-size:16px;font-weight:600;padding:14px 36px;border-radius:8px;">R&eacute;pondre en 5 minutes</a>
<p style="margin:12px 0 0;color:#7a93a3;font-size:12px;">Ou r&eacute;pondez simplement &agrave; cet email.</p>
</td></tr>
<tr><td style="padding:24px 40px 36px;">
<p style="margin:0 0 16px;color:#c2d3dd;font-size:15px;line-height:1.6;">M&ecirc;me un &laquo;&nbsp;je ne l'ai pas encore ouverte&nbsp;&raquo; est un retour utile. Et si l'installation bloque, r&eacute;pondez-moi directement, on r&egrave;gle &ccedil;a.</p>
${signature}
</td></tr>`
  return { subject: 'Premier retour SeaScope ?', html: shell('Premier retour SeaScope ?', inner) }
}
