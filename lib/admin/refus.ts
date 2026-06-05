// Motifs de refus — source de vérité unique pour le dialog admin, le template
// email (lib/admin/emails.ts), la server action refuser() et la colonne select
// « Motif refus » dans Notion.
// `h1` et `paragraphs` sont du HTML pré-encodé (entités) : littéraux uniquement,
// jamais de valeur candidat (même convention que lib/admin/emails.ts).

export interface MotifRefus {
  key: string
  label: string        // option du select Notion + libellé dans le dialog
  subject: string      // sujet du mail (UTF-8 brut, comme les autres templates)
  h1: string           // titre du header email (entités HTML)
  paragraphs: readonly string[]  // paragraphes du corps (entités HTML)
  recontact: boolean   // mail promettant un recontact → onglet « ⏳ À recontacter »
}

export const MOTIFS_REFUS = [
  {
    key: 'beta_complete',
    label: 'Beta complète',
    recontact: true,
    subject: 'Candidature SeaScope — la bêta affiche complet',
    h1: 'La b&ecirc;ta affiche complet',
    paragraphs: [
      `Merci d&#39;avoir candidat&eacute; pour tester SeaScope. La vague actuelle de la b&ecirc;ta ferm&eacute;e est <strong style="color:#f4f7f9;">au complet</strong>&nbsp;: on pr&eacute;f&egrave;re un petit groupe de testeurs qu&#39;on peut vraiment &eacute;couter.`,
      `Votre candidature est conserv&eacute;e&nbsp;: d&egrave;s qu&#39;une place se lib&egrave;re ou qu&#39;une nouvelle vague ouvre, vous serez parmi les premiers contact&eacute;s.`,
    ],
  },
  {
    key: 'ios_incompatible',
    label: 'iOS non compatible',
    recontact: true,
    subject: 'Candidature SeaScope — la version iOS arrive',
    h1: 'SeaScope n&#39;est pas encore sur iPhone',
    paragraphs: [
      `Merci d&#39;avoir candidat&eacute; pour tester SeaScope. La b&ecirc;ta actuelle est uniquement disponible sur <strong style="color:#f4f7f9;">Android</strong>, et votre candidature indique que vous &ecirc;tes sur iPhone.`,
      `Bonne nouvelle malgr&eacute; tout&nbsp;: la version iOS est pr&eacute;vue. On garde votre candidature pr&eacute;cieusement et <strong style="color:#f4f7f9;">on vous recontacte d&egrave;s que la b&ecirc;ta iOS ouvre</strong>.`,
    ],
  },
  {
    key: 'zone_non_couverte',
    label: 'Zone non couverte',
    recontact: true,
    subject: 'Candidature SeaScope — votre zone arrive bientôt',
    h1: 'Votre zone n&#39;est pas encore couverte',
    paragraphs: [
      `Merci d&#39;avoir candidat&eacute; pour tester SeaScope. Pour cette phase de b&ecirc;ta, on se concentre sur quelques zones de navigation afin de valider la fiabilit&eacute; des pr&eacute;visions localement.`,
      `Votre zone n&#39;en fait pas encore partie, mais la couverture s&#39;&eacute;tend au fil des vagues&nbsp;: on garde votre candidature et on revient vers vous d&egrave;s que votre zone est couverte.`,
    ],
  },
  {
    key: 'profil_hors_cible',
    label: 'Profil hors cible',
    recontact: false,
    subject: 'Candidature SeaScope — pas cette vague-ci',
    h1: 'Pas cette vague-ci',
    paragraphs: [
      `Merci d&#39;avoir candidat&eacute; pour tester SeaScope. Pour cette phase, on cherche des profils tr&egrave;s pr&eacute;cis (fr&eacute;quence de sortie, type de navigation) afin de tester l&#39;app dans des conditions cibl&eacute;es.`,
      `Votre candidature est conserv&eacute;e pour les prochaines vagues, o&ugrave; les crit&egrave;res s&#39;&eacute;largiront.`,
    ],
  },
  {
    key: 'candidature_incomplete',
    label: 'Candidature incomplète',
    recontact: false,
    subject: 'Candidature SeaScope — il manque quelques informations',
    h1: 'Il manque quelques infos',
    paragraphs: [
      `Merci de votre int&eacute;r&ecirc;t pour SeaScope. En l&#39;&eacute;tat, votre candidature ne nous permet pas de l&#39;&eacute;valuer&nbsp;: certaines informations sont manquantes ou semblent invalides.`,
      `Si la b&ecirc;ta vous int&eacute;resse toujours, n&#39;h&eacute;sitez pas &agrave; repostuler en compl&eacute;tant le formulaire sur le site &mdash; on l&#39;&eacute;tudiera avec plaisir.`,
    ],
  },
] as const satisfies readonly MotifRefus[]

export type MotifRefusKey = (typeof MOTIFS_REFUS)[number]['key']

/** Labels des motifs « recontactables » — sert au filtre de l'onglet ⏳ À recontacter. */
export const MOTIFS_RECONTACT_LABELS: ReadonlySet<string> = new Set(
  MOTIFS_REFUS.filter((m) => m.recontact).map((m) => m.label),
)
