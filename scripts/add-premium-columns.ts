// Ajout one-shot des propriétés « Premium+ offert » (checkbox) et
// « Date Premium+ offert » (date) à la base candidatures Notion. Idempotent.
// Usage: node --experimental-strip-types --env-file=.env.local scripts/add-premium-columns.ts

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
      'Premium+ offert': { checkbox: {} },
      'Date Premium+ offert': { date: {} },
    },
  }),
})

if (!res.ok) throw new Error(`Notion error ${res.status}: ${await res.text()}`)

console.log('Propriétés « Premium+ offert » + « Date Premium+ offert » créées/à jour.')
