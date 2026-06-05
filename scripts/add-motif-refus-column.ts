// Ajout one-shot de la colonne select « Motif refus » à la base candidatures Notion.
// Idempotent : relancer le script met à jour les options sans toucher aux données.
// Usage: node --experimental-strip-types --env-file=.env.local scripts/add-motif-refus-column.ts
import { MOTIFS_REFUS } from '../lib/admin/refus.ts'

const token = process.env.NOTION_TOKEN
const dbId = process.env.NOTION_BETA_DB_ID
if (!token || !dbId) throw new Error('Variables manquantes: NOTION_TOKEN, NOTION_BETA_DB_ID')

const colors = ['red', 'orange', 'yellow', 'blue', 'gray']
const res = await fetch(`https://api.notion.com/v1/databases/${dbId}`, {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Notion-Version': '2022-06-28',
  },
  body: JSON.stringify({
    properties: {
      'Motif refus': {
        select: { options: MOTIFS_REFUS.map((m, i) => ({ name: m.label, color: colors[i % colors.length] })) },
      },
    },
  }),
})
if (!res.ok) throw new Error(`Notion error ${res.status}: ${await res.text()}`)
console.log('Colonne « Motif refus » créée/à jour. Options :', MOTIFS_REFUS.map((m) => m.label).join(' · '))
