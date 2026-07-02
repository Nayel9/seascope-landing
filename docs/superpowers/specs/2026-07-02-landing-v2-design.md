# Design — Landing SeaScope V2 (lancement Google Play)

- **Date** : 2026-07-02
- **Statut** : design validé, prêt pour plan d'implémentation
- **Dépôt** : `seascope-landing` (Next.js App Router, Vercel)

## 1. Objectif & positionnement

Refonte complète de la landing publique pour le **lancement officiel** (fin de la phase bêta),
optimisée **conversion → Google Play**.

Repositionnement clé : SeaScope n'est **plus** « une app météo » mais **« un assistant de
décision pour les plaisanciers »**. Il agrège météo, vent, vagues, marées, courants,
réglementation, sécurité, mouillage pour répondre à : **« Puis-je sortir aujourd'hui ? »**.
Le visiteur doit saisir cette promesse en **< 5 s**.

Cible : plaisanciers, semi-rigides, pêcheurs loisir, navigateurs côtiers, débutants. Ton :
confiance, simplicité, sécurité, modernité. Éviter le jargon.

## 2. Décisions validées

| Sujet | Décision |
| --- | --- |
| Source des prix | **Module unique `lib/pricing.ts`** dans la landing, miroir de `seaScope/lib/paywall/offerings.ts`. Sections Tarifs, Comparatif et FAQ lisent d'ici. |
| Contenu bêta | **Retirer** de la page publique `BetaForm`, `FeedbackForm`, `FeedbackLoop` (fichiers supprimés). |
| Infra conservée | `/admin`, `/redeem`, `/privacy` et les routes API restent **intacts**. Pas de capture d'email public (CTA = télécharger). |
| Identité | **Conservée** : tokens navy `#061425` / teal `#5EEAD4` / couleurs verdict, Geist, primitives UI existantes. Exécution montée en gamme (Linear/Vercel). |

## 3. Architecture de l'information (narration au scroll)

| # | Section (composant) | Promesse | Capture(s) |
| --- | --- | --- | --- |
| 1 | **Hero** (`Hero`) | « Puis-je sortir aujourd'hui ? » → verdict clair. 1 CTA Google Play | `dashboard-decision` (22601) |
| 2 | **Le problème** (`Problem`) | Fini de jongler entre 5 applis météo/cartes/marées | — (illustratif) |
| 3 | **Décider en secondes** (`Decide`) | Score, verdict, créneaux idéaux, retour conseillé, simulateur | `forecast-today` (22605) + 22601 |
| 4 | **Préparer ses sorties** (`Prepare`) | Aujourd'hui · 7 jours · météo détaillée · planning | `forecast-7days` (22606) + `weather` (22608) |
| 5 | **Explorer** (`Explore`) — très visuel | Carte : spots, balises, vent, pluie, courants, bathy, POI | `map` (22614), grand format |
| 6 | **Naviguer** (`Navigate`) | IGN, AIS, Journal, Mouillage | `navigation` (22615) |
| 7 | **Sécurité — Guardian** (`Security`) — au centre | Guardian Watch, verdict mouillage, alertes, surveillance d'ancre | 22601 (bandeau mouillage) + `guardian` (22617) |
| 8 | **Comparatif** (`Comparison`) | Tableau Gratuit / Premium / Premium+ (complet, hiérarchie conservée) | réf. 22621/22623 |
| 9 | **Tarifs** (`Pricing`) | Cartes de prix depuis `lib/pricing.ts` | réf. 22619 |
| 10 | **Pourquoi SeaScope** (`Story`) | Histoire fondateur (plaisancier récent), ton humain | — |
| 11 | **FAQ** (`FAQ`) | Accordéon, 6 questions du brief | — |
| 12 | **CTA final** (`FinalCta`) | Google Play (+ slot App Store futur) | — |

Bandeau **sources de données** (Météo-France AROME / Open-Meteo / SHOM, capture 22617) intégré
en élément de confiance léger dans §7 ou avant la FAQ.

## 4. Structure de code

- **Page** `app/page.tsx` : recompose les 12 sections ci-dessus. Retire les imports/rendu de
  `BetaForm`, `FeedbackForm`, `FeedbackLoop` (fichiers supprimés).
- **Sections** `components/sections/` : réécriture/renommage → `Hero`, `Problem`, `Decide`,
  `Prepare`, `Explore`, `Navigate`, `Security`, `Comparison`, `Pricing`, `Story`, `FAQ`,
  `FinalCta`.
- **Primitives UI** `components/ui/` : réutiliser `Button`, `SectionHeader`, `Reveal`, `Pill`,
  `Chip`, `Kicker`, `Callout`. Ajouter : `PhoneMock` (device frame + capture, barre d'état OS
  rognée), `PricingCard`, `ComparisonTable`, `FeatureRow` (alternance image/texte), `Accordion`,
  `StoreButton` (Google Play + slot App Store désactivé).
- **Layout** : `Nav` (ancres des nouvelles sections + CTA Google Play), `Footer` (mentions,
  lien `/privacy`).

## 5. Module tarifs — source unique (`lib/pricing.ts`)

Miroir de `seaScope/lib/paywall/offerings.ts`. Contenu :

- `PRODUCTS` (5) : `premiumMonthly` 5,99 €/`P1M` · `premiumAnnual` 39,99 €/`P1Y` ·
  `premiumPlusMonthly` 9,99 €/`P1M` · `premiumPlusAnnual` 69,99 €/`P1Y` ·
  `premiumPlusSeason` 24,99 €/`P4M_NON_RENEWING`.
- `OFFERINGS` : `premium` { annual (mis en avant, badge « Économisez 44 % »), monthly } ;
  `premium_plus` { annual (mis en avant, « Économisez 42 % »), season (« Pass saison · 4 mois »),
  monthly }.
- `monthlyEquivalentEUR(productId)` → « soit X €/mois » (annuel/12).
- `formatEUR(n)` → « 39,99 € » (virgule FR).
- Commentaire en tête pointant vers `seaScope/lib/paywall/offerings.ts` comme source à recopier.
- **Test node** `scripts/test-pricing.ts` (style `test-beta-token.ts`) : vérifie la présence des 5
  produits, les 2 offerings, la cohérence des badges d'économie (annuel < 12×mensuel) et le
  format FR.

Sections **Tarifs**, **Comparatif** et **FAQ** (prix cités) lisent exclusivement ce module → zéro
divergence.

## 6. Pipeline assets

Les 11 captures (`C:/Users/nvainer/Downloads/Seascope_files/*.jpg`) →
1. **rognage** de la barre d'état OS (haut) ;
2. resize + conversion **webp** optimisé ;
3. sortie `public/screens/<nom-sémantique>.webp` (`dashboard-decision`, `forecast-today`,
   `forecast-7days`, `weather`, `map`, `navigation`, `guardian`, `settings-sources`,
   `paywall-tarifs`, `paywall-comparatif`, `paywall-avantages`) ;
4. rendu via **`next/image`** (dimensions explicites, `loading="lazy"` sauf hero, `alt`
   descriptif) dans `PhoneMock`.

Outil : `sharp` (présent dans le projet) via un script `scripts/prepare-screens.ts`.

## 7. Technique / SEO / accessibilité

- **Stack** : Next.js App Router + Tailwind (tokens existants), `next/image`, `next/font` (Geist).
  Composants serveur par défaut ; `Reveal`/accordéon en client.
- **SEO** : `metadata` (title/description autour de « assistant de décision plaisance · météo
  marine · sécurité bateau »), OpenGraph + Twitter card (image hero), **JSON-LD**
  `SoftwareApplication` (nom, catégorie, OS Android, offre gratuite) + `FAQPage` (généré depuis les
  Q/R de la FAQ). Headings sémantiques (un seul `h1`), mots-clés du brief intégrés
  naturellement (météo marine, plaisance, mouillage, prévisions marines, navigation, sécurité
  bateau).
- **A11y** : contraste AA sur fond navy, focus visibles, `alt` sur toutes les captures,
  `prefers-reduced-motion` neutralise les animations `Reveal`.
- **Perf** : images webp dimensionnées, animations CSS légères, pas de JS lourd.
- **Responsive** : mobile-first ; `PhoneMock` en pile sur mobile, alternance côte-à-côte sur
  desktop.

## 8. Tests / vérification

- `pnpm typecheck` (0 erreur) + `pnpm build` (le filet principal d'une landing).
- Test node `scripts/test-pricing.ts` (cohérence tarifs).
- Revue visuelle : rendu local (`pnpm dev`) + capture(s) responsive (Playwright/Chrome DevTools
  possible) avant validation.

## 9. Hors-scope / limites connues

- **App Store** : bouton présent mais désactivé (« Bientôt sur iOS ») — pas de build iOS.
- **i18n** : FR uniquement (comme l'actuel).
- Les prix affichés sont les **prix catalogue de repli** (FR) ; en magasin, RevenueCat localise —
  cohérent avec le comportement de l'app.
- Contenu marketing (textes définitifs) : premières versions rédigées dans l'implémentation, à
  affiner ensuite avec l'utilisateur.
