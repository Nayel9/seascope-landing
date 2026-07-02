// Génère l'image Open Graph paysage 1200×630 (aperçus réseaux sociaux).
// Composition on-brand : fond navy + halo teal + wordmark SeaScope + accroche
// + capture dashboard (arrondie) à droite. Sortie: public/og.png
// Usage: node --experimental-strip-types scripts/prepare-og.ts
import sharp from 'sharp'

const W = 1200
const H = 630
const NAVY = '#061425'
const TEAL = '#5EEAD4'

// ── Fond + halo + texte (SVG overlay pleine toile) ───────────────────────────
const bg = `
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="glow" cx="78%" cy="18%" r="60%">
      <stop offset="0%" stop-color="${TEAL}" stop-opacity="0.20"/>
      <stop offset="55%" stop-color="${TEAL}" stop-opacity="0.05"/>
      <stop offset="100%" stop-color="${NAVY}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="${NAVY}"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  <g font-family="Segoe UI, Arial, sans-serif">
    <!-- wordmark -->
    <text x="80" y="196" font-size="72" font-weight="800" fill="#E6EEF6">Sea<tspan fill="${TEAL}">Scope</tspan></text>
    <!-- accroche principale -->
    <text x="80" y="300" font-size="52" font-weight="800" fill="#E6EEF6">Puis-je sortir</text>
    <text x="80" y="366" font-size="52" font-weight="800" fill="#E6EEF6">aujourd'hui&#160;?</text>
    <!-- sous-titre -->
    <text x="80" y="436" font-size="27" font-weight="400" fill="#9FB3C8">L'assistant de décision des plaisanciers.</text>
    <text x="80" y="474" font-size="27" font-weight="400" fill="#9FB3C8">Météo, marées, courants, sécurité — un verdict clair.</text>
    <!-- pill « Gratuit sur Google Play » -->
    <rect x="80" y="516" width="340" height="56" rx="28" fill="${TEAL}"/>
    <text x="250" y="553" font-size="24" font-weight="700" fill="#052a26" text-anchor="middle">Gratuit sur Google Play</text>
  </g>
</svg>`

// ── Capture dashboard (arrondie) ─────────────────────────────────────────────
const shotH = 560
const src = sharp('public/screens/dashboard-decision.webp')
const meta = await src.metadata()
const shotW = Math.round(shotH * (meta.width! / meta.height!))
const shot = await src.resize({ height: shotH }).png().toBuffer()
const mask = Buffer.from(
  `<svg width="${shotW}" height="${shotH}"><rect width="${shotW}" height="${shotH}" rx="28" ry="28"/></svg>`,
)
const roundedShot = await sharp(shot)
  .composite([{ input: mask, blend: 'dest-in' }])
  .png()
  .toBuffer()

await sharp(Buffer.from(bg))
  .composite([{ input: roundedShot, left: W - shotW - 70, top: Math.round((H - shotH) / 2) }])
  .png()
  .toFile('public/og.png')

console.log(`OG générée : public/og.png (${W}×${H}), capture ${shotW}×${shotH}`)
