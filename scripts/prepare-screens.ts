import sharp from 'sharp'
import { mkdirSync } from 'node:fs'

const SRC = 'C:/Users/nvainer/Downloads/Seascope_files'
const OUT = 'public/screens'
mkdirSync(OUT, { recursive: true })

// mapping source → nom sémantique. topCropPx = pixels de barre d'état OS à rogner.
const MAP: Array<{ src: string; out: string; topCropPx: number }> = [
  { src: '22601.jpg', out: 'dashboard-decision', topCropPx: 72 },
  { src: '22605.jpg', out: 'forecast-today',      topCropPx: 72 },
  { src: '22606.jpg', out: 'forecast-7days',      topCropPx: 72 },
  { src: '22608.jpg', out: 'weather',             topCropPx: 72 },
  { src: '22614.jpg', out: 'map',                 topCropPx: 72 },
  { src: '22615.jpg', out: 'navigation',          topCropPx: 72 },
  { src: '22617.jpg', out: 'settings-sources',    topCropPx: 72 },
  { src: '22619.jpg', out: 'paywall-tarifs',      topCropPx: 72 },
  { src: '22621.jpg', out: 'paywall-comparatif',  topCropPx: 72 },
  { src: '22623.jpg', out: 'paywall-avantages',   topCropPx: 72 },
  { src: '22603.jpg', out: 'dashboard-full',      topCropPx: 0  }, // déjà sans barre visible
]

for (const m of MAP) {
  const img = sharp(`${SRC}/${m.src}`)
  const meta = await img.metadata()
  const h = (meta.height ?? 0) - m.topCropPx
  await img
    .extract({ left: 0, top: m.topCropPx, width: meta.width!, height: h })
    .resize({ width: 900, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(`${OUT}/${m.out}.webp`)
  console.log(`✓ ${m.out}.webp`)
}
console.log('Assets prêts.')
