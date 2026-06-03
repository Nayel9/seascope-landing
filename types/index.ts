export type DecisionLevel = 'bon' | 'variable' | 'delicat' | 'deconseille'
export type PersonaId = 'balade' | 'famille' | 'courte' | 'peche' | 'sport'
export type ToleranceId = 'tranquille' | 'vivante' | 'engagee'

export interface Persona {
  id: PersonaId
  name: string
  desc: string
}

export interface Tolerance {
  id: ToleranceId
  name: string
  sub: string
  bars: 1 | 2 | 3
}

export interface Reason {
  state: 'good' | 'warn' | 'bad'
  icon: 'wind' | 'wave' | 'bolt' | 'clock' | 'compass'
  text: string
}

export interface RecCard {
  kind: DecisionLevel
  pill: string
  score: string
  title: string
  window: string
  ret: string
  reasons: Reason[]
}

export interface BetaFormValues {
  firstname: string
  email: string
  region: string
  navType: string
  freq: string
  boat: string
  platform: string
  practice: string
  blocker: string
  canal: string
  canalAutre: string
  consent: boolean
}

export interface FeedbackFormValues {
  email: string
  fbtype: string
  spot: string
  what: string
  expected: string
}
