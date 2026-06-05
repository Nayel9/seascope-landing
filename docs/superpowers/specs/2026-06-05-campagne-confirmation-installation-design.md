# Campagne « As-tu installé l'app ? » — confirmation d'installation + tickets

**Date :** 2026-06-05
**Statut :** validé (brainstorming)

## Objectif

Depuis l'onglet « 📨 Invités » du dashboard, envoyer aux testeurs invités un email leur
demandant en un clic où ils en sont :

- **« ✓ J'ai installé l'app »** → page de remerciement → statut Notion **« Actif »** ;
- **« ⚠ J'ai rencontré un problème »** → formulaire pré-identifié → ticket dans la base
  feedbacks (type « Problème installation ») + onglet de triage dédié dans le dashboard,
  pour que l'admin dépanne.

Réservé aux candidats au statut **« Invité Google Play »**.

## 1. Bouton de campagne (dashboard, onglet Invités)

- Bouton **« 📣 Demander confirmation »** : par ligne (`RowActions`, statut
  « Invité Google Play ») + en lot (barre bulk de l'onglet `invites`).
- Pattern existant des invitations : aperçu via `EmailModal` (nouveau mode `confirmation`),
  envois séquentiels `BatchReport`, un échec n'interrompt pas le lot.
- Garde anti-double-envoi : nouvelles propriétés Notion **« Confirmation demandée »**
  (checkbox) + **« Date confirmation demandée »** (date), créées par un script one-shot
  (`scripts/add-confirmation-columns.ts`, même pattern que « Motif refus »). Après envoi :
  bouton grisé « 📣 Demandé ✓ ». Mapping `Candidature.confirmationDemandee` +
  `dateConfirmationDemandee`.
- Destinataire : `emailGooglePlay || email`.

## 2. Email « confirmation d'installation »

Template `confirmationInstallEmail(c, lienInstallee, lienProbleme)` dans
`lib/admin/emails.ts`, shell/ton existants (vouvoiement, signé Nayel — SeaScope) :

- Header : « Tout roule avec la bêta ? »
- Corps : « Bonjour {prénom}, vous avez reçu votre invitation il y a quelques jours.
  Dites-nous en un clic où vous en êtes : »
- **CTA primaire** (teal plein) : « ✓ J'ai installé l'app » → `${NEXT_PUBLIC_SITE_URL}/beta/installee?t=<token>`
- **CTA secondaire** (outline) : « ⚠ J'ai rencontré un problème » → `${NEXT_PUBLIC_SITE_URL}/beta/probleme?t=<token>`
- Mention : « Votre réponse nous aide à ne laisser personne bloqué. »

## 3. Token

`lib/beta/token.ts` (nouveau) : `signCandidatureToken(id)` / `verifyCandidatureToken(t)` —
HMAC-SHA256 de l'id candidat avec `ADMIN_SESSION_SECRET` (secret existant), format
`<id>.<hmac hex>`, encodé URL-safe. Pas d'expiration. Non-forgeable ; le pire abus possible
(re-jouer son propre lien) est idempotent et sans gravité.

## 4. Pages publiques (style landing, pas le shell admin)

### `/beta/installee?t=<token>`

- **GET ne mute jamais** : les scanners d'emails (Outlook SafeLinks — beaucoup de testeurs
  hotmail/live) suivent les liens automatiquement. La page affiche « Merci {prénom} ! Un
  dernier clic pour confirmer » + bouton **« Je confirme l'installation »**.
- Le bouton soumet une server action `confirmerInstallation(token)` :
  - vérifie le token ;
  - relit le candidat ; si statut = « Invité Google Play » → `Statut = Actif` ;
  - si déjà « Actif » → idempotent, message « déjà confirmé, merci ! » ;
  - autre statut → ne change rien, message de remerciement neutre.
- Après confirmation : message « C'est noté, bonne nav ! » + rappel du formulaire de retour
  terrain (`FEEDBACK_FORM_URL`) et du groupe WhatsApp (`WHATSAPP_GROUP_URL`).

### `/beta/probleme?t=<token>`

- Formulaire pré-identifié (le token dit qui c'est, aucun email à saisir) :
  - **Étape qui bloque** (select obligatoire) : « Invitation Google » / « Installation Play
    Store » / « Ouverture de l'app » / « Autre » ;
  - **Description** (textarea obligatoire, min 10 caractères, max 2000) ;
  - **Modèle de téléphone** (texte optionnel, max 100).
- Soumission → server action `signalerProbleme(token, données)` :
  - crée une page dans la base feedbacks (`NOTION_FEEDBACK_DB_ID`) :
    `Email` (title) = email du candidat, `Type de retour` = « Problème installation »,
    `Ce qui s'est passé` = « [étape] description (téléphone : modèle) », `Statut` = Nouveau,
    `Date` = maintenant ;
  - envoie un mail de notification à `OWNER_EMAIL` (réutilise `sendBrevo`) ;
  - le candidat **reste « Invité Google Play »**.
- Page de confirmation : « Bien reçu, je reviens vers vous rapidement par email. »

### Token invalide/absent (les deux pages)

Page neutre : « Ce lien n'est plus valide — répondez simplement au mail d'invitation. »
Aucune information sur l'existence ou non d'un candidat.

## 5. Dashboard — triage des tickets

Page **Feedbacks** (`app/admin/(protected)/feedbacks/page.tsx`) :

- Nouvel onglet **« 🆘 Installation »** : `Type de retour = « Problème installation »`
  (tous statuts), à côté de « 🚨 Non traités / En cours / Tous ».
- Le compteur « 🚨 Retours non traités » de la page candidatures inclut déjà ces tickets
  (statut Nouveau) — aucun changement nécessaire.
- Triage avec les statuts existants (Nouveau → En cours → Résolu) via `FeedbackRow`.
- L'option « Problème installation » est ajoutée au select Notion « Type de retour » par le
  script one-shot.

## 6. Cas limites

- Candidat sans aucun email → exclu de l'envoi avec erreur explicite dans le rapport.
- Testeur qui clique « problème » puis, dépanné, reclique « installé » plus tard : les liens
  restent valides, le second clic le passe Actif. C'est voulu.
- Double soumission du formulaire problème → deux tickets (rare, sans gravité, triés à la main).
- `ADMIN_SESSION_SECRET` ou `NEXT_PUBLIC_SITE_URL` absent → erreur claire à l'envoi de la
  campagne, rien ne part.

## 7. Tests

- `scripts/test-beta-token.ts` : assertions sign/verify/altération/format.
- Templates ajoutés à `scripts/render-emails.ts`.
- Test manuel local : envoi de la campagne à un candidat de test → clic des deux liens →
  vérifier statut Actif, ticket créé, onglet 🆘, garde anti-double-envoi.
- `typecheck` + `build`.

## Hors scope

- Badge « problème signalé » sur la ligne candidat (page Candidatures).
- Relance automatique de la campagne ; expiration des tokens.
- Détection automatique d'installation (annulée plus tôt ce jour).
