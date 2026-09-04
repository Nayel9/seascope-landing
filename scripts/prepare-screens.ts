// Génère les captures d'écran de la landing à partir des MAQUETTES anonymisées
// (spot « Baie de l'Estran », design on-brand cohérent) — pas des captures réelles
// qui exposaient un mouillage privé.
//
// Chaque maquette est un template 1080×2340 : titre + téléphone. On extrait
// uniquement le CONTENU DE L'ÉCRAN (intérieur du bezel), sans titre ni filigrane,
// puis on l'exporte en webp. DeviceFrame ajoute le cadre côté UI.
//
// Usage: node --experimental-strip-types scripts/prepare-screens.ts
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'

const SRC = "C:/Users/nvainer/Downloads/SeaScope copilote navigation (1)/exports"
const OUT = 'public/screens'
mkdirSync(OUT, { recursive: true })

// Rectangle du contenu d'écran à l'intérieur du bezel (template partagé 1080×2340).
// Ratio 714/1583 ≈ 0.451 ≈ DeviceFrame (388/862 = 0.450) → object-cover sans rognage visible.
const CROP = { left: 185, top: 731, width: 714, height: 1583 }

// maquette source → nom sémantique utilisé par les sections.
const MAP: Array<{ src: string; out: string }> = [
  { src: '01_accueil.png',            out: 'dashboard-decision' }, // Hero + Décider (verdict) + OG
  { src: '02_planning.png',           out: 'forecast-7days'     }, // Préparer — meilleures fenêtres
  { src: '03_previsions.png',         out: 'forecast-today'     }, // Décider — prévision du jour
  { src: '04_carte.png',              out: 'map'                }, // Explorer
  { src: '05_navigation.png',         out: 'navigation'         }, // Naviguer
  { src: '06_guardian_maquette.png',  out: 'guardian'           }, // Sécurité — Guardian
]

for (const m of MAP) {
  await sharp(`${SRC}/${m.src}`)
    .extract(CROP)
    .resize({ width: 900, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(`${OUT}/${m.out}.webp`)
  console.log(`✓ ${m.out}.webp`)
}
console.log('Assets prêts (maquettes anonymisées).')
