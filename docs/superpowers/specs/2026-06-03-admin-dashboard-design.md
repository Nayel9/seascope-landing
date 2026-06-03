# Backoffice admin `/admin` — gestion bêta SeaScope

**Date :** 2026-06-03
**Statut :** validé (brainstorming + maquette interactive)

## Objectif

Dashboard admin protégé dans l'app `seascope-landing`, branché sur les deux bases Notion
(candidatures `NOTION_BETA_DB_ID`, feedbacks `NOTION_FEEDBACK_DB_ID`), qui automatise le
workflow bêta que Notion gratuit ne peut pas automatiser : envoi des emails d'invitation et
de relance via Brevo, mises à jour de statuts/dates/cases en un clic, export CSV Google Play.

Volumétrie cible : 20–50 candidats, admin solo. Tout choix technique privilégie la simplicité.

## Architecture

Tout-en-un Next.js 16 App Router (existant) :

- **Server Components** pour toutes les lectures (query Notion côté serveur ; aucun token
  ni donnée brute Notion n'atteint le client).
- **Server Actions** pour toutes les mutations (qualification, invitation, relance, export).
- Réutilisation des patterns existants de `app/api/beta/route.ts` : `fetch` direct API Notion
  (version `2022-06-28`), `sendBrevo`, `esc()`. Pas de SDK Notion, pas de nouvelle dépendance.
- Pages admin en rendu dynamique (`force-dynamic`) + `revalidatePath` après chaque action.

### Arborescence

```
app/admin/
  layout.tsx                 — shell nav (Candidatures / Feedbacks / Export CSV / déconnexion)
  page.tsx                   — redirect → /admin/candidatures
  login/page.tsx             — formulaire mot de passe
  candidatures/page.tsx      — pipeline candidatures (onglets + KPIs)
  candidatures/export/page.tsx — export Google Play
  candidatures/export/csv/route.ts — GET authentifié, télécharge le CSV
  feedbacks/page.tsx         — triage retours
lib/admin/
  auth.ts                    — login(), logout(), requireAdmin(), signature HMAC cookie
  notion.ts                  — notionFetch, queryCandidatures, queryFeedbacks, updatePage, mappers
  brevo.ts                   — sendBrevo (factorisé depuis les routes existantes)
  emails.ts                  — templates invitation + relance (HTML marine), esc() sur toutes valeurs
  actions.ts                 — Server Actions ('use server')
components/admin/            — composants client (table, barre bulk, modal aperçu, boutons)
```

## Auth

- `POST` login : Server Action compare le mot de passe à `ADMIN_PASSWORD` (comparaison
  timing-safe, `crypto.timingSafeEqual`), pose un cookie `ss_admin` httpOnly + Secure +
  SameSite=Lax, valeur `exp.HMAC-SHA256(exp, ADMIN_SESSION_SECRET)`, validité 30 jours.
- `requireAdmin()` appelé **en tête de chaque page admin, Server Action et route handler
  admin** ; cookie absent/invalide/expiré → `redirect('/admin/login')` (pages) ou erreur 401
  (route CSV). Pas de middleware : défense au plus près des données.
- Logout : suppression du cookie.

## Couche Notion (`lib/admin/notion.ts`)

- `notionFetch(path, init)` : wrapper Authorization + Notion-Version + gestion erreur.
- `queryCandidatures()` / `queryFeedbacks()` : `POST /v1/databases/:id/query`, pagination
  `has_more`/`next_cursor`, tri par date de candidature / date de retour.
- `updatePage(pageId, properties)` : `PATCH /v1/pages/:id`.
- Mappers Notion → types TS plats `Candidature` et `Feedback`. Noms de propriétés exacts :
  - Candidatures : `Prénom` (title), `Email`, `Région`, `Bateau`, `Source`, `Plateforme`,
    `Fréquence`, `Pratique`, `Type de navigation`, `Statut`, `Raison de renoncement`,
    `Date de candidature`, `Email Google Play`, `Export Google Play`, `Invitation envoyée`,
    `Date invitation envoyée`, `Lien de téléchargement envoyé`, `Relance envoyée`,
    `Date relance`, `Canal de recrutement`, `Priorité bêta`, `Retours beta` (relation).
  - Feedbacks : `Email` (title), `Date`, `Type de retour`, `Spot`, `Ce qui s'est passé`,
    `Ce qu'on attendait`, `Statut`, `Impact`, `Priorité`, `Testeur` (relation),
    `Plateforme / Appareil`, `Version app`.
- Statuts candidature : `Nouveau`, `En cours`, `En attente`, `Accepté`, `Refusé`,
  `Invité Google Play`, `Actif`, `Inactif`.

## Écrans

Style : sombre marine cohérent avec la landing (`#0E2236` fond, `#061425` nav, `#5EEAD4`
accent, cards `#13314a`), Tailwind.

### `/admin/candidatures`

- **Rangée KPI** (6 cartes cliquables → onglet correspondant) : À traiter, À inviter,
  Invités, À relancer (ambre), Actifs, Retours non traités (ambre, → /admin/feedbacks).
- **Onglets** : 📋 À traiter (Nouveau + En cours + En attente) · ✅ À inviter (Accepté,
  invitation non envoyée) · 📨 Invités (Invité Google Play) · 🔁 À relancer (calculé) ·
  🟢 Actifs · ❌ Refusés/Inactifs · Tous.
- **Colonnes** : ☑ sélection, Candidat (prénom, email, région), Profil (type nav, fréquence,
  pratique), Email Google Play (input inline, pré-rempli avec `Email` à l'acceptation),
  Priorité bêta (select inline), Canal de recrutement (select inline, onglet À traiter),
  Statut (chip colorée), Actions.
- **Actions par ligne — boutons explicites avec libellés** (style maquette v1) :
  - À traiter : `✓ Accepter` · `✕ Refuser` · `⏸ Attente`
  - Accepté : `✉️ Envoyer invitation` (désactivé + « Invité ✓ » si `Invitation envoyée`)
  - Invité : `🟢 Marquer actif` · `🔁 Relancer` (désactivé + « Relancé ✓ » si `Relance envoyée`)
- **Badge « À relancer »** : `⚠ J+N sans retour` sur les invités dont
  `Date invitation envoyée` ≥ 5 jours, relation `Retours beta` vide, `Relance envoyée` non
  cochée. N = jours écoulés.
- **Sélection multiple** : case d'en-tête (lignes de l'onglet visible), barre d'actions
  groupées sticky en bas, **contextuelle à l'onglet** (mêmes actions que par ligne, appliquées
  à la sélection). Changer d'onglet vide la sélection.
- **Modal d'aperçu** (envoi simple ou batch) : destinataires en chips, aperçu du rendu HTML
  de l'email (template réel), récap des mises à jour Notion qui suivront, boutons Annuler /
  Confirmer. Batch : envois **séquentiels** ; un échec n'interrompt pas les suivants ;
  rapport final par destinataire (réussi / échoué + raison).

### Effets d'une invitation confirmée (par destinataire)

1. Envoi Brevo du template invitation (placeholders : prénom, email Google Play,
   `GOOGLE_PLAY_URL`, `FEEDBACK_FORM_URL`).
2. `PATCH` Notion : `Invitation envoyée` ✓, `Lien de téléchargement envoyé` ✓,
   `Date invitation envoyée` = aujourd'hui, `Statut` = `Invité Google Play`.
3. Si Brevo réussit mais Notion échoue : erreur explicite « email parti, mise à jour Notion
   échouée pour X — corriger à la main » (pas de rollback silencieux). Si Brevo échoue :
   aucune écriture Notion.

Relance : même mécanique avec le template relance → `Relance envoyée` ✓,
`Date relance` = aujourd'hui.

Garde-fou anti-double-envoi : l'action revérifie `Invitation envoyée` / `Relance envoyée`
côté serveur juste avant l'envoi (pas seulement le bouton désactivé).

### `/admin/candidatures/export`

- Liste : `Statut = Accepté` **et** `Email Google Play` renseigné **et** `Export Google Play`
  non coché.
- `⬇ Télécharger le CSV (N emails)` : GET `/admin/candidatures/export/csv` (authentifié),
  `text/csv`, **un email par ligne, sans en-tête** (format liste de testeurs Google Play
  Console), `Content-Disposition: attachment; filename="seascope-testeurs-YYYY-MM-DD.csv"`.
- `☑ Marquer comme exportés` : Server Action distincte, coche `Export Google Play` sur les
  mêmes lignes (re-requêtées serveur). Deux étapes volontaires : on ne marque pas tant que
  l'import Console n'est pas fait.

### `/admin/feedbacks`

- Onglets : 🚨 Non traités (Nouveau + À investiguer) · En cours · Tous.
- Colonnes : Testeur (email/titre + date + spot), Type (chip), Description (tronquée),
  Impact / Priorité / Statut (selects inline → Server Action), lien `Notion ↗` vers la page
  du retour pour le détail complet.
- Pas d'édition du contenu du retour dans le dashboard (lecture + qualification seulement).

### `/admin/login`

Formulaire minimal centré (logo ⚓ SeaScope Admin, champ mot de passe, bouton). Message
d'erreur générique « Mot de passe incorrect ». Pas de rate-limiting v1 (admin solo,
mot de passe fort requis).

## Emails (`lib/admin/emails.ts`)

Portage TS des deux templates validés dans la page Notion « Ops : workflow & templates » :

- **Invitation** — objet « Votre accès à la bêta SeaScope est ouvert », HTML fond `#0b1d2a`,
  carte `#102a3c`, CTA `#1ec8a5` « Rejoindre la bêta sur Google Play », bloc « Comment
  installer », lien formulaire de retour, paragraphe « retours honnêtes, pas des compliments ».
- **Relance** — objet « Premier retour SeaScope ? », les 4 questions, CTA « Répondre en
  5 minutes », mention « répondez simplement à cet email ».

Toutes les valeurs candidat passent par `esc()`. Expéditeur : `BREVO_SENDER` /
`BREVO_SENDER_NAME` existants.

## Variables d'environnement (nouvelles)

| Var | Rôle |
|---|---|
| `ADMIN_PASSWORD` | mot de passe de login |
| `ADMIN_SESSION_SECRET` | clé HMAC des cookies de session |
| `GOOGLE_PLAY_URL` | lien d'opt-in du test fermé Google Play |
| `FEEDBACK_FORM_URL` | lien public du formulaire Notion « Retour d'expérience » |

`.env.example` mis à jour. `validateEnv`-style check au démarrage de chaque action.

## Gestion d'erreurs

- Server Actions retournent `{ ok: true } | { ok: false, error: string }` ; affichage inline
  (bandeau rouge au-dessus de la table / dans le modal), pas de lib de toast.
- Erreurs Notion/Brevo loggées `console.error('[admin]', …)` (visibles dans Vercel logs).
- Batch : rapport par destinataire dans le modal après exécution.

## Vérification

1. `pnpm typecheck` + `pnpm lint` verts.
2. Smoke test dev : login (bon/mauvais mdp, accès direct URL sans cookie), qualification
   (statut mis à jour dans Notion), aperçu invitation **sans envoi**, envoi réel sur une
   candidature de test avec email perso → vérifier réception Brevo + cases/date/statut
   Notion, export CSV (contenu + marquage), édition feedback.
3. Pas d'infra de tests automatisés dans le repo : hors périmètre v1.

## Hors périmètre v1 (YAGNI)

Multi-utilisateurs/rôles, cron de relance automatique, édition des templates depuis l'UI,
statistiques graphiques, rate-limiting login, webhooks Notion, i18n.
