# Refus avec motif + email adapté — dashboard admin

**Date :** 2026-06-05
**Statut :** validé (brainstorming)

## Objectif

Aujourd'hui, cliquer « ✕ Refuser » dans le dashboard admin passe juste le statut Notion à
`Refusé` : aucun email n'est envoyé au candidat, aucun motif n'est tracé. On veut qu'au clic
sur Refuser, l'admin choisisse un **motif de refus**, voie un **aperçu du mail** généré en
fonction du motif, puis confirme — ce qui met à jour Notion (statut + motif) et envoie le
mail via Brevo.

Cas déclencheur : un candidat sur iPhone alors que la beta est Android-only.

## Motifs de refus

Source de vérité unique : config dans `lib/admin/refus.ts`.

| Clé | Label (select Notion + dialog) | Ton du mail |
|---|---|---|
| `beta_complete` | Beta complète | Trop d'inscrits pour cette vague ; candidature conservée pour la prochaine. |
| `ios_incompatible` | iOS non compatible | SeaScope est Android-only pour l'instant ; on le recontacte dès que la version iOS arrive. |
| `zone_non_couverte` | Zone non couverte | Sa zone de navigation n'est pas encore couverte par la beta. |
| `profil_hors_cible` | Profil hors cible | Cette phase cible des profils précis (fréquence/type de navigation) ; candidature conservée. |
| `candidature_incomplete` | Candidature incomplète | Infos manquantes ou invalides ; il peut repostuler en complétant le formulaire. |

Chaque mail garde le ton existant : tutoiement, signé « Nayel — SeaScope », même shell HTML
que les templates actuels (`lib/admin/emails.ts`), `esc()` sur toute valeur utilisateur.

## Architecture

- **`lib/admin/refus.ts`** (nouveau) : `MOTIFS_REFUS` — `{ key, label, subject, body(prenom) }`.
  Alimente le dialog, le template email et la colonne Notion.
- **`lib/admin/emails.ts`** : ajout `refusEmail(prenom, motifKey)` réutilisant le shell HTML.
- **`lib/admin/actions.ts`** :
  - `previewRefusEmail(id, motifKey)` → `{ subject, html }` pour l'aperçu (requireAdmin en tête).
  - `refuser(ids: string[], motifKey, envoyerEmail: boolean)` → pour chaque candidat :
    statut `Refusé` + select `Motif refus` dans Notion, puis envoi Brevo si demandé.
    Gestion d'erreur **par candidat** : un échec n'interrompt pas le lot, les échecs partiels
    sont remontés dans le résultat (pas d'échec silencieux).
- **`components/admin/RefusDialog.tsx`** (nouveau) : dialog client —
  1. choix du motif (radios) ;
  2. aperçu du mail (iframe `srcdoc`, mis à jour au changement de motif) ;
  3. case « Envoyer le mail de refus » cochée par défaut (décochable pour spam/doublon) ;
  4. bouton « Refuser et envoyer » (ou « Refuser sans mail » si décoché).
  En lot : aperçu basé sur le 1er candidat sélectionné, mention « personnalisé pour chacun
  des N candidats ».
- **`components/admin/CandidaturesTable.tsx`** : les deux boutons « ✕ Refuser » (action par
  ligne + barre bulk) ouvrent `RefusDialog` au lieu d'appeler `qualifier()`/`qualifierEnLot()`
  directement.

## Notion

- Nouvelle colonne **select « Motif refus »** dans la base candidatures (`NOTION_BETA_DB_ID`),
  options = labels des motifs. Créée via l'API Notion (`PATCH /v1/databases/:id`) par un
  script one-shot dans `scripts/` (même pattern que les scripts admin existants) ; pas de
  manipulation manuelle.
- Type `Candidature` : nouveau champ `motifRefus: string`, mappé depuis le select.
- Affichage du motif dans l'onglet « ❌ Refusés » (colonne ou chip), pour pouvoir filtrer et
  relancer plus tard (ex : tous les `iOS non compatible` à la sortie iOS).

## Cas limites

- **Candidat sans email** : refus possible ; le dialog signale qu'aucun mail ne sera envoyé.
- **Échec Brevo** : le statut Notion est mis à jour d'abord ; l'erreur d'envoi est remontée
  clairement à l'admin (candidat marqué Refusé mais mail non parti).
- **Refus en lot** : motif unique pour toute la sélection, mail personnalisé (prénom) par
  candidat.

## Tests

- Templates de refus ajoutés au script existant de rendu local / envoi de test des emails
  (`scripts/`).
- Tests unitaires sur `refusEmail()` (échappement HTML, contenu par motif) si une infra de
  test existe.

## Hors scope

- Nouveau statut « Liste d'attente iOS » (écarté : le motif stocké suffit pour relancer).
- Motif libre / texte personnalisé dans le mail.
- Relance automatique des refusés iOS à la sortie de la version iOS.
