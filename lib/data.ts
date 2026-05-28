import type { Persona, Tolerance, RecCard, ToleranceId } from '@/types'

export const PERSONAS: Persona[] = [
  { id: 'balade',  name: 'Balade côtière',      desc: 'Sortie tranquille, plaisir de naviguer.' },
  { id: 'famille', name: 'Sortie familiale',    desc: 'Équipage varié, confort et sécurité.' },
  { id: 'courte',  name: 'Session courte',      desc: 'Peu de temps, fenêtre optimisée.' },
  { id: 'peche',   name: 'Pêche côtière',       desc: 'Stabilité, mouillage, mer calme.' },
  { id: 'sport',   name: 'Navigation sportive', desc: 'Vent, vitesse, conditions engagées.' },
]

export const TOLERANCES: Tolerance[] = [
  { id: 'tranquille', name: 'Tranquille', sub: 'Mer clémente, sortie sereine.',   bars: 1 },
  { id: 'vivante',    name: 'Vivante',    sub: 'Du relief, ni sage ni chargé.',   bars: 2 },
  { id: 'engagee',    name: 'Engagée',    sub: 'Sportif, vent et mer formée.',    bars: 3 },
]

export const REC_CARDS: Record<ToleranceId, RecCard> = {
  tranquille: {
    kind: 'deconseille', pill: 'DÉCONSEILLÉ', score: '22',
    title: 'Conditions au-dessus de votre confort',
    window: 'Aucune fenêtre', ret: '—',
    reasons: [
      { state: 'bad',  icon: 'wind',  text: 'Rafales 18 nd — dépasse limite 12 nd' },
      { state: 'bad',  icon: 'wave',  text: 'Vagues 1.4 m — dépasse limite 0.8 m' },
      { state: 'warn', icon: 'bolt',  text: 'Mer croisée préoccupante' },
    ],
  },
  vivante: {
    kind: 'delicat', pill: 'DÉLICAT', score: '58',
    title: 'Sortie possible — à surveiller',
    window: '10:30 — 13:00', ret: '13:30',
    reasons: [
      { state: 'warn', icon: 'wind',  text: 'Rafales 15 nd — proche limite 16 nd' },
      { state: 'good', icon: 'wave',  text: 'Vagues 0.9 m — dans le profil' },
      { state: 'warn', icon: 'clock', text: 'Renforcement attendu après 13h' },
    ],
  },
  engagee: {
    kind: 'bon', pill: 'BON', score: '84',
    title: 'Conditions idéales pour vous',
    window: '09:00 — 15:00', ret: '16:00',
    reasons: [
      { state: 'good', icon: 'wind',    text: 'Rafales 14 nd — terrain de jeu confortable' },
      { state: 'good', icon: 'wave',    text: 'Mer formée — 1.0 m, période 8s' },
      { state: 'good', icon: 'compass', text: 'Vent stable orienté ESE' },
    ],
  },
}

export const NAV_TYPES    = ['Voile', 'Moteur', 'Semi-rigide', 'Kayak / paddle', 'Pêche', 'Autre'] as const
export const FREQUENCIES  = ['≤ 1× / mois', '2–4× / mois', '1× / sem.', 'Plusieurs / sem.'] as const
export const PLATFORMS    = ['iPhone', 'Android'] as const
export const PRACTICES    = ['Balade côtière', 'Sortie familiale', 'Session courte', 'Pêche côtière', 'Navigation sportive'] as const
export const FEEDBACK_TYPES = ['Bug', 'Recommandation incorrecte', 'Donnée manquante', 'Interface confuse', 'Autre'] as const
