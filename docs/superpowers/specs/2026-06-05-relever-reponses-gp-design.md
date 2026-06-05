# « ↻ Relever les réponses » — remplissage auto des emails Google Play

**Date :** 2026-06-05
**Statut :** validé (brainstorming)

## Objectif

Après l'email « demande d'email Google Play », les candidats répondent par mail avec
l'adresse de leur compte Google. Aujourd'hui l'admin recopie ces adresses à la main dans le
dashboard. On veut un bouton « ↻ Relever les réponses » dans l'onglet
« 📮 Email Google à confirmer » qui lit la boîte mail, extrait les adresses et remplit le
champ `Email Google Play` dans Notion — le candidat bascule alors automatiquement dans
« ✅ À inviter ». L'envoi de l'invitation reste un geste manuel de l'admin.

## Contexte mail

- Expéditeur Brevo : `seascope-contact@pennarstudio.fr`, **redirection** vers
  `contact@pennarstudio.fr` hébergée chez **LWS** (IMAP classique, port 993 SSL).
- Choix retenu : **bouton manuel + IMAP** (pas de webhook Brevo — dispo incertaine sur plan
  gratuit + config DNS ; pas de cron — Vercel Hobby limité à 1×/jour). L'admin clique quand
  il ouvre le dashboard.

## Principe (piloté par les candidats — idempotent)

Au clic, la server action `releverReponsesGP()` :

1. Liste les candidats en attente : statut `Accepté`, `emailGPDemande` ✓,
   `emailGooglePlay` vide.
2. Ouvre une connexion IMAP (`IMAP_HOST`, `IMAP_PORT`=993, `IMAP_USER`, `IMAP_PASSWORD`).
3. Pour chaque candidat : `SEARCH FROM <email candidature> SINCE <dateDemandeGP>` dans
   INBOX. Aucune dépendance aux flags lu/non-lu (l'admin lit ses mails normalement) ;
   relancer le bouton est sans effet de bord (champ déjà rempli → candidat plus listé).
4. Extrait l'adresse Google du corps de la réponse la plus récente (voir règles).
5. Écrit `Email Google Play` dans Notion via `prop.email()` — **uniquement si vide, jamais
   d'écrasement**.
6. Retourne un `BatchReport` (format existant) : ✓ rempli (`adresse`) / ⚠ réponse trouvée
   mais ambiguë (`info`) / — pas encore de réponse (`info`).

## Règles d'extraction (`extractEmailGP`, fonction pure)

Entrée : texte de la réponse (text/plain, ou HTML converti texte par mailparser) + adresse
d'expédition du candidat. Sortie : `{ email: string } | { ambigu: string } | null`.

1. Collecter toutes les adresses email du corps (regex), en **excluant** :
   `seascope-contact@pennarstudio.fr`, `contact@pennarstudio.fr` (liste d'exclusion
   centralisée — nos adresses apparaissent dans les citations « Le … a écrit : »).
2. Priorité : première adresse `@gmail.com` / `@googlemail.com` trouvée → retenue.
3. Sinon, exactement **une** adresse non-gmail trouvée → retenue (compte Google Workspace
   possible).
4. Sinon, **aucune** adresse dans le corps mais l'expéditeur est un gmail → son adresse
   d'envoi est retenue (cas « c'est cette adresse »).
5. Sinon (plusieurs adresses non-gmail, ou rien de fiable) → `ambigu` avec le détail,
   aucun remplissage : traitement manuel.
6. Validation format (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`) avant toute écriture Notion.

Le template de la demande GP ne contient aucune adresse email → pas de faux positifs via
la citation.

## Architecture

- **`lib/admin/imap.ts`** (nouveau) : `fetchRepliesFrom(senders: {email, since}[])` —
  connexion ImapFlow, recherche par expéditeur, retourne le corps texte du mail le plus
  récent par expéditeur. Seul fichier qui touche IMAP.
- **`lib/admin/extractEmailGP.ts`** (nouveau) : extraction pure décrite ci-dessus,
  testable sans réseau.
- **`lib/admin/actions.ts`** : `releverReponsesGP(): Promise<BatchReport>` —
  `requireAdmin()`, orchestration, écriture Notion, `revalidatePath`.
- **`components/admin/CandidaturesTable.tsx`** : bouton « ↻ Relever les réponses » visible
  dans l'onglet `emailgp` (barre au-dessus de la table, pas besoin de sélection), rapport
  affiché via le pattern existant (bandeau/liste `BatchReport`).
- **Dépendances nouvelles** : `imapflow` + `mailparser` (+ `@types/mailparser`).

## Cas limites

- Candidat répondant depuis une **autre adresse** que sa candidature : non trouvé par la
  recherche → rapport « pas de réponse », saisie manuelle (rare, assumé).
- Échec connexion IMAP : erreur claire, aucune écriture.
- Plusieurs candidats partageant l'attente : traitement séquentiel, un échec n'interrompt
  pas les autres (pattern batch existant).
- `dateDemandeGP` vide (ancienne donnée) : fallback SINCE = date de candidature, sinon
  pas de borne.

## Config & validation (avec guidage de l'admin)

1. Panel LWS → rubrique emails : serveur entrant (`mail.lws.fr` ou équivalent), port 993.
2. `.env.local` (+ env de prod) : `IMAP_HOST`, `IMAP_PORT`, `IMAP_USER`, `IMAP_PASSWORD`.
3. **`scripts/test-imap-connection.ts`** : valide la connexion et liste les N derniers
   expéditeurs de l'INBOX — exécuté AVANT d'implémenter l'action, pour dérisquer.

## Tests

- `extractEmailGP` : corpus de réponses types (gmail simple, signature contenant une autre
  adresse, réponse sans adresse depuis un gmail, multi-adresses ambiguës, HTML
  quoted-printable) — assertions dans un script `scripts/test-extract-email-gp.ts` (pas
  d'infra de test dans le repo).
- Test manuel : bouton sur données réelles (11 candidats en attente), vérification du
  rapport et des champs Notion.

## Hors scope

- Webhook Brevo entrant (full-auto instantané) — écarté.
- Cron périodique — possible évolution future, la mécanique IMAP est réutilisable.
- Marquage lu/déplacement des mails dans la boîte.
