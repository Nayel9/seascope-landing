// Ajout one-shot des propriétés « Confirmation demandée » (checkbox) et
// « Date confirmation demandée » (date) à la base candidatures Notion. Idempotent.
// Usage: node --experimental-strip-types --env-file=.env.local scripts/add-confirmation-columns.ts

const token = process.env.NOTION_TOKEN
const dbId = process.env.NOTION_BETA_DB_ID

if (!token || !dbId) throw new Error('Variables manquantes: NOTION_TOKEN, NOTION_BETA_DB_ID')

const res = await fetch(`https://api.notion.com/v1/databases/${dbId}`, {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Notion-Version': '2022-06-28',
  },
  body: JSON.stringify({
    properties: {
      'Confirmation demandée': { checkbox: {} },
      'Date confirmation demandée': { date: {} },
    },
  }),
})

if (!res.ok) throw new Error(`Notion error ${res.status}: ${await res.text()}`)

console.log('Propriétés « Confirmation demandée » + « Date confirmation demandée » créées/à jour.')
