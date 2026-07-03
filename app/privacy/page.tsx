import type { Metadata } from 'next'
import { Nav } from '@/components/layout/Nav'
import { Footer } from '@/components/layout/Footer'
import { Kicker } from '@/components/ui/Kicker'

export const metadata: Metadata = {
  title: 'Politique de confidentialité — SeaScope',
  description:
    'Comment SeaScope collecte, utilise et protège vos données. Stockage local par défaut, compte et synchronisation optionnels hébergés dans l’UE, aucune revente, conformité RGPD.',
  robots: { index: true, follow: true },
}

const UPDATED = '3 juillet 2026'
const VERSION = '1.3'

// ── Helpers de mise en forme (cohérents avec le design system) ──────────────────

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="scroll-mt-24 text-[clamp(20px,2vw,26px)] leading-[1.2] tracking-[-0.015em] font-medium mt-14 mb-4 first:mt-0"
    >
      {children}
    </h2>
  )
}

function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="text-[17px] font-medium tracking-[-0.005em] mt-8 mb-3">{children}</h3>
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-[15px] leading-[1.7] text-ss-fg/72 mb-4 max-w-[72ch]">{children}</p>
}

function UL({ children }: { children: React.ReactNode }) {
  return <ul className="list-none m-0 p-0 mb-4 flex flex-col gap-2.5 max-w-[72ch]">{children}</ul>
}

function LI({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-3 items-start text-[15px] leading-[1.6] text-ss-fg/72">
      <span className="w-[5px] h-[5px] rounded-full bg-ss-teal flex-none mt-2.5" />
      <span>{children}</span>
    </li>
  )
}

export default function PrivacyPage() {
  return (
    <>
      <Nav />
      <main className="py-16 md:py-24">
        <div className="container-narrow">
          {/* En-tête */}
          <div className="flex items-center gap-3 mb-5">
            <Kicker>Confidentialité</Kicker>
          </div>
          <h1 className="text-[clamp(30px,3.6vw,44px)] leading-[1.1] tracking-[-0.02em] font-medium m-0 text-balance">
            Politique de confidentialité
          </h1>
          <p className="mt-4 font-mono text-[12px] tracking-[0.08em] text-ss-fg/50 uppercase">
            Version {VERSION} · Dernière mise à jour : {UPDATED}
          </p>

          {/* Résumé en clair */}
          <div className="mt-10 border border-ss-teal/25 bg-ss-teal/[0.05] rounded-ss-lg p-6">
            <p className="font-mono text-[11px] tracking-[0.16em] uppercase text-ss-teal mb-3">
              L&apos;essentiel, en clair
            </p>
            <UL>
              <LI>
                SeaScope fonctionne avec un minimum de données. Par défaut, vos spots, vos
                préférences et votre historique de sorties restent{' '}
                <strong className="text-ss-fg">sur votre appareil</strong>.
              </LI>
              <LI>
                Le <strong className="text-ss-fg">compte est facultatif</strong> (adresse e-mail ou
                connexion Google). Il sert à sauvegarder et synchroniser vos données entre vos
                appareils et à gérer votre abonnement. Ces données sont hébergées{' '}
                <strong className="text-ss-fg">dans l&apos;Union européenne</strong>.
              </LI>
              <LI>
                Les abonnements Premium et Premium+ sont gérés via{' '}
                <strong className="text-ss-fg">Google Play</strong>. Nous ne voyons jamais vos
                coordonnées bancaires (voir section&nbsp;2.4).
              </LI>
              <LI>
                Nous ne vendons, ne louons et n&apos;échangeons{' '}
                <strong className="text-ss-fg">jamais</strong> vos données personnelles.
              </LI>
              <LI>
                Votre position sert uniquement à récupérer les conditions marines de votre zone. Elle
                n&apos;est pas utilisée pour vous suivre ni pour constituer un profil publicitaire.
              </LI>
              <LI>
                L&apos;application mesure son usage de façon{' '}
                <strong className="text-ss-fg">strictement anonyme</strong> (hébergement dans
                l&apos;Union européenne), sans jamais rattacher ces mesures à votre compte ni à votre
                position (voir section&nbsp;3).
              </LI>
              <LI>
                Vous pouvez à tout moment demander l&apos;accès, la correction ou la suppression de vos
                données — ou supprimer votre compte :{' '}
                <a href="mailto:seascope-contact@pennarstudio.fr" className="text-ss-teal">
                  seascope-contact@pennarstudio.fr
                </a>
                .
              </LI>
            </UL>
          </div>

          {/* Corps */}
          <div className="mt-12">
            <H2 id="responsable">1. Qui est responsable de vos données</H2>
            <P>
              SeaScope est édité par <strong className="text-ss-fg">Pennar Studio</strong> (SIRET
              750&nbsp;835&nbsp;944&nbsp;00034). Pennar Studio agit en tant que responsable du
              traitement de vos données personnelles au sens du Règlement général sur la protection
              des données (RGPD).
            </P>
            <P>
              Pour toute question relative à cette politique ou à vos données, vous pouvez nous écrire
              à{' '}
              <a href="mailto:seascope-contact@pennarstudio.fr" className="text-ss-teal">
                seascope-contact@pennarstudio.fr
              </a>
              .
            </P>

            <H2 id="donnees">2. Les données que nous traitons</H2>
            <P>
              SeaScope est volontairement économe en données. Voici précisément ce que nous traitons,
              et où ces données résident.
            </P>

            <H3>2.1 Données stockées sur votre appareil (stockage local)</H3>
            <P>
              Par défaut, les données suivantes sont enregistrées{' '}
              <strong className="text-ss-fg">localement</strong> sur votre téléphone. Tant que vous
              n&apos;avez pas créé de compte et activé la synchronisation (voir §2.3), elles ne sont
              transmises à aucun serveur central :
            </P>
            <UL>
              <LI>Vos spots enregistrés (noms et coordonnées des lieux que vous suivez).</LI>
              <LI>
                Votre profil de navigation : type de bateau, pratique, tolérance, et vos seuils
                personnels (vent, vagues, rafales).
              </LI>
              <LI>Vos préférences d&apos;application (réglages, unités, affichage).</LI>
              <LI>
                Votre journal de bord, vos points d&apos;intérêt, vos trophées et, le cas échéant, les
                retours que vous notez après une sortie.
              </LI>
            </UL>

            <H3>2.2 Compte utilisateur (facultatif)</H3>
            <P>
              La création d&apos;un compte est <strong className="text-ss-fg">facultative</strong>. Elle
              vous permet de sauvegarder vos données, de les retrouver sur plusieurs appareils (voir
              §2.3) et de gérer votre abonnement. Si vous créez un compte, nous traitons :
            </P>
            <UL>
              <LI>
                <strong className="text-ss-fg">Votre adresse e-mail</strong> (obligatoire), et, si vous
                les renseignez, votre nom et une photo de profil.
              </LI>
              <LI>
                <strong className="text-ss-fg">Vos identifiants de connexion</strong> : soit un mot de
                passe (que nous ne stockons que sous forme <em>hachée</em>, jamais en clair), soit une
                connexion via <strong className="text-ss-fg">Google</strong> (le cas échéant), auquel
                cas nous conservons les jetons d&apos;authentification fournis par Google.
              </LI>
              <LI>
                <strong className="text-ss-fg">Des données de session et de sécurité</strong> : un jeton
                de session, sa date d&apos;expiration, ainsi que l&apos;adresse IP et le type d&apos;appareil
                (<em>user-agent</em>) de connexion, afin de sécuriser votre compte et de détecter les
                accès anormaux.
              </LI>
            </UL>
            <P>
              Sur votre appareil, les jetons d&apos;authentification sont conservés dans un{' '}
              <strong className="text-ss-fg">stockage sécurisé chiffré</strong> du système, jamais en
              clair. Ces données de compte sont hébergées dans l&apos;Union européenne (voir §6 et §7).
            </P>

            <H3>2.3 Synchronisation de vos données (avec un compte)</H3>
            <P>
              Si vous disposez d&apos;un compte et que la synchronisation est activée (fonctionnalité
              incluse dans l&apos;offre Premium+), les données décrites au §2.1 peuvent être{' '}
              <strong className="text-ss-fg">sauvegardées sur nos serveurs</strong> afin d&apos;être
              restaurées et partagées entre vos appareils : spots, points d&apos;intérêt, journal de
              bord, bateaux, profils, préférences, trophées et réglages de veille (Guardian).
            </P>
            <P>
              Ces données sont stockées de façon structurée, rattachées à l&apos;identifiant de votre
              compte, sur une base de données située{' '}
              <strong className="text-ss-fg">dans l&apos;Union européenne</strong> (voir §6). Lorsque
              vous supprimez un élément, la suppression est propagée à vos autres appareils. Sans
              compte, aucune de ces données ne quitte votre téléphone.
            </P>

            <H3>2.4 Achats et abonnements</H3>
            <P>
              SeaScope propose des abonnements payants (Premium et Premium+). Les paiements sont
              traités par <strong className="text-ss-fg">Google Play</strong> : nous ne recevons ni ne
              stockons vos coordonnées bancaires.
            </P>
            <UL>
              <LI>
                Nous utilisons <strong className="text-ss-fg">RevenueCat</strong> pour valider vos
                achats et suivre l&apos;état de votre abonnement. RevenueCat reçoit uniquement{' '}
                <strong className="text-ss-fg">l&apos;identifiant de votre compte SeaScope</strong> et le
                produit acheté — jamais votre e-mail, votre nom ni vos coordonnées bancaires.
              </LI>
              <LI>
                Notre serveur conserve l&apos;<strong className="text-ss-fg">état de votre abonnement</strong>{' '}
                (offre en cours, produit acheté, date d&apos;expiration) afin de débloquer les
                fonctionnalités correspondantes. Ces informations sont hébergées dans l&apos;Union
                européenne (voir §6).
              </LI>
            </UL>

            <H3>2.5 Données techniques nécessaires au fonctionnement</H3>
            <P>
              Pour vous fournir une recommandation, l&apos;application doit interroger des services de
              prévision marine. Les données suivantes transitent par le réseau :
            </P>
            <UL>
              <LI>
                <strong className="text-ss-fg">Coordonnées géographiques du spot consulté.</strong> Elles
                sont envoyées à nos services de prévision afin de récupérer les conditions marines
                correspondantes. Elles ne sont pas utilisées pour vous profiler.
              </LI>
              <LI>
                <strong className="text-ss-fg">Données techniques minimales</strong> : type d&apos;appareil,
                version du système, identifiant technique de requête, et journaux d&apos;erreur permettant
                de diagnostiquer un dysfonctionnement.
              </LI>
            </UL>

            <H3>2.6 Géolocalisation</H3>
            <P>
              Si vous l&apos;autorisez, SeaScope peut utiliser la position de votre appareil pour vous
              proposer les conditions de la zone où vous vous trouvez, ou pour faciliter
              l&apos;enregistrement d&apos;un spot. L&apos;autorisation de localisation est facultative : vous
              pouvez la refuser et saisir vos spots manuellement, et vous pouvez la révoquer à tout
              moment dans les réglages de votre téléphone. Nous n&apos;effectuons pas de suivi de position
              en arrière-plan à des fins commerciales.
            </P>

            <H3>2.7 Notifications</H3>
            <P>
              Si vous activez les alertes, SeaScope vous prévient lorsqu&apos;une fenêtre favorable
              s&apos;ouvre ou que les conditions se dégradent sur un spot suivi. Ces notifications sont{' '}
              <strong className="text-ss-fg">générées localement</strong> sur votre appareil : SeaScope
              n&apos;utilise pas de service de notification push distant et ne collecte aucun jeton
              Firebase Cloud Messaging (FCM) à cette fin. Vous pouvez les désactiver à tout moment.
            </P>

            <H3>2.8 Mesure d&apos;audience et statistiques</H3>
            <P>
              <strong className="text-ss-fg">Dans l&apos;application</strong> : SeaScope mesure l&apos;usage de
              ses fonctionnalités de façon strictement anonyme, sans publicité ni profilage. Le détail
              complet (ce qui est mesuré, ce qui ne l&apos;est jamais, où sont hébergées ces données) est
              décrit à la section&nbsp;3.
            </P>
            <P>
              <strong className="text-ss-fg">Sur notre site</strong> (cette page, la page d&apos;accueil et
              les formulaires) : nous utilisons Vercel Web Analytics et Vercel Speed Insights pour
              mesurer la fréquentation et les performances. Cette mesure est agrégée et respectueuse de
              la vie privée : pas de cookie de suivi publicitaire, pas de profil individuel, pas de
              revente.
            </P>

            <H3>2.9 Formulaires (programme beta et retours)</H3>
            <P>
              Lorsque vous candidatez à la beta ou que vous envoyez un retour depuis notre site, nous
              collectons les informations que vous saisissez :
            </P>
            <UL>
              <LI>
                <strong className="text-ss-fg">Candidature beta</strong> : prénom, adresse e-mail, région
                de navigation, type de navigation, fréquence de sortie, plateforme, pratique principale,
                et, si vous les renseignez, le modèle de votre bateau et vos freins habituels à la
                sortie.
              </LI>
              <LI>
                <strong className="text-ss-fg">Retour terrain</strong> : adresse e-mail, type de retour,
                spot concerné (facultatif), description de ce qui s&apos;est passé et de ce que vous
                attendiez.
              </LI>
            </UL>
            <P>
              Ces informations sont transmises par e-mail via notre prestataire d&apos;envoi et enregistrées
              dans notre espace de gestion du programme beta (voir section 6). Elles servent uniquement
              à sélectionner les testeurs, à communiquer avec vous et à améliorer le produit.
            </P>

            <H2 id="statistiques">3. Statistiques d&apos;utilisation anonymes (application)</H2>
            <P>
              Pour comprendre quelles fonctionnalités vous aident réellement à décider de sortir — ou
              de rester au port — l&apos;application mesure son usage de façon anonyme. Voici exactement
              ce que cela recouvre.
            </P>

            <H3>3.1 Ce qui est collecté</H3>
            <UL>
              <LI>
                <strong className="text-ss-fg">Événements d&apos;usage anonymes</strong> : consultation du
                tableau de bord et des fenêtres de navigation favorables, ouverture du détail d&apos;une
                décision, utilisation du simulateur de sortie, démarrage d&apos;une sortie, création
                d&apos;alertes, changement de spot, configuration du profil de navigation (persona,
                tolérance, type de bateau).
              </LI>
              <LI>
                <strong className="text-ss-fg">Contexte technique</strong> : identifiant anonyme aléatoire
                généré à l&apos;installation (non relié à votre identité), modèle d&apos;appareil, version du
                système et de l&apos;application, langue de l&apos;appareil.
              </LI>
            </UL>

            <H3>3.2 Ce qui n&apos;est jamais collecté</H3>
            <div className="border border-ss-teal/25 bg-ss-teal/[0.05] rounded-ss-lg p-5 mb-4 max-w-[72ch]">
              <UL>
                <LI>
                  <strong className="text-ss-fg">Votre position GPS</strong> et vos traces de navigation.
                </LI>
                <LI>
                  <strong className="text-ss-fg">Les noms de spots ou de ports</strong> que vous saisissez.
                </LI>
                <LI>
                  <strong className="text-ss-fg">Le rattachement à votre compte ou à votre identité</strong>{' '}
                  : ces statistiques ne contiennent aucune donnée nominative (nom, e-mail) et
                  l&apos;identifiant analytique, aléatoire, n&apos;est pas relié à votre compte SeaScope.
                </LI>
              </UL>
            </div>

            <H3>3.3 Pourquoi (finalité et base légale)</H3>
            <P>
              Ces statistiques servent à une seule chose : comprendre l&apos;usage des fonctionnalités pour
              améliorer l&apos;application — par exemple savoir si les recommandations de fenêtres sont
              réellement utiles. Base légale : notre intérêt légitime (art.&nbsp;6.1.f du RGPD), les
              données traitées étant anonymes.
            </P>

            <H3>3.4 Qui héberge ces données</H3>
            <P>
              Nous utilisons <strong className="text-ss-fg">PostHog</strong> (PostHog Inc.), sur son
              instance Cloud hébergée <strong className="text-ss-fg">exclusivement dans l&apos;Union
              européenne</strong> : ces données ne quittent pas l&apos;UE. Politique de confidentialité de
              PostHog :{' '}
              <a href="https://posthog.com/privacy" className="text-ss-teal" rel="noopener noreferrer" target="_blank">
                posthog.com/privacy
              </a>
              .
            </P>

            <H3>3.5 Durée de conservation</H3>
            <P>
              Les événements d&apos;usage sont conservés <strong className="text-ss-fg">30&nbsp;jours</strong>{' '}
              au maximum, puis supprimés.
            </P>

            <H3>3.6 Vos droits</H3>
            <P>
              Ces données étant anonymes, elles ne permettent pas de vous identifier ni de retrouver
              votre activité individuelle — c&apos;est pourquoi l&apos;application ne propose pas de réglage de
              désactivation. Pour toute question à ce sujet, écrivez-nous à{' '}
              <a href="mailto:seascope-contact@pennarstudio.fr" className="text-ss-teal">
                seascope-contact@pennarstudio.fr
              </a>
              .
            </P>

            <H2 id="finalites">4. Pourquoi nous traitons ces données (finalités &amp; bases légales)</H2>
            <UL>
              <LI>
                <strong className="text-ss-fg">Fournir les recommandations</strong> (conditions, fenêtre,
                heure de retour) — base légale : exécution du service que vous demandez.
              </LI>
              <LI>
                <strong className="text-ss-fg">Créer et sécuriser votre compte</strong>, vous authentifier
                et gérer vos sessions — base légale : exécution du contrat (nos conditions
                d&apos;utilisation) et notre intérêt légitime à sécuriser le service.
              </LI>
              <LI>
                <strong className="text-ss-fg">Synchroniser vos données</strong> entre vos appareils —
                base légale : exécution du service que vous activez.
              </LI>
              <LI>
                <strong className="text-ss-fg">Gérer vos achats et abonnements</strong> et débloquer les
                fonctionnalités correspondantes — base légale : exécution du contrat.
              </LI>
              <LI>
                <strong className="text-ss-fg">Géolocalisation et notifications</strong> — base légale :
                votre consentement, que vous pouvez retirer à tout moment.
              </LI>
              <LI>
                <strong className="text-ss-fg">Gérer le programme de beta-test</strong> et communiquer avec
                les testeurs — base légale : votre consentement et notre intérêt légitime à développer le
                produit.
              </LI>
              <LI>
                <strong className="text-ss-fg">Mesurer l&apos;usage anonyme de l&apos;application</strong> pour
                l&apos;améliorer (voir section&nbsp;3) — base légale : intérêt légitime (art.&nbsp;6.1.f),
                données anonymes.
              </LI>
              <LI>
                <strong className="text-ss-fg">Assurer la sécurité et le bon fonctionnement</strong>{' '}
                (diagnostic d&apos;erreurs, prévention des abus) — base légale : intérêt légitime.
              </LI>
            </UL>

            <H2 id="partage">5. Ce que nous ne faisons pas</H2>
            <UL>
              <LI>Nous ne vendons pas vos données.</LI>
              <LI>Nous ne les louons pas et ne les cédons pas à des courtiers en données.</LI>
              <LI>Nous ne créons pas de compte à votre insu : la création de compte est facultative et à votre initiative.</LI>
              <LI>Nous n&apos;utilisons aucun outil de suivi publicitaire — la mesure d&apos;usage de l&apos;application est strictement anonyme (voir section&nbsp;3) et celle du site se limite à des statistiques agrégées (voir §2.8).</LI>
              <LI>Nous n&apos;utilisons aucun identifiant publicitaire.</LI>
              <LI>Nous ne construisons aucun profil marketing ni publicitaire à partir de votre navigation en mer.</LI>
              <LI>Nous n&apos;affichons pas de publicité dans l&apos;application.</LI>
            </UL>

            <H2 id="sous-traitants">6. Avec qui nous partageons des données (sous-traitants)</H2>
            <P>
              Nous faisons appel à un petit nombre de prestataires techniques qui traitent des données
              pour notre compte, uniquement dans la mesure nécessaire au service :
            </P>
            <UL>
              <LI>
                <strong className="text-ss-fg">Notre backend SeaScope</strong> — hébergé sur Fly.io
                (région Paris, Union européenne) : relaie les coordonnées d&apos;un spot vers les services
                de prévision, et gère l&apos;authentification, la synchronisation et l&apos;état
                d&apos;abonnement des comptes.
              </LI>
              <LI>
                <strong className="text-ss-fg">Neon</strong> (Neon Inc.) — hébergement de la base de
                données (compte, données synchronisées, état d&apos;abonnement), sur une infrastructure
                située <strong className="text-ss-fg">dans l&apos;Union européenne</strong> (Francfort)&nbsp;;
                ces données ne quittent pas l&apos;UE.
              </LI>
              <LI>
                <strong className="text-ss-fg">Google</strong> (Google Ireland / Google LLC) —{' '}
                <strong className="text-ss-fg">Google Play</strong> traite le paiement de vos abonnements
                (nous ne recevons aucune donnée bancaire)&nbsp;; si vous choisissez la connexion Google,
                l&apos;authentification associée.
              </LI>
              <LI>
                <strong className="text-ss-fg">RevenueCat</strong> (RevenueCat Inc., États-Unis) — gestion
                technique des abonnements (validation des achats, statut d&apos;abonnement). Reçoit votre
                identifiant de compte SeaScope et le produit acheté, jamais votre e-mail, votre nom ni vos
                coordonnées bancaires.
              </LI>
              <LI>
                <strong className="text-ss-fg">Brevo</strong> (Sendinblue, France/UE) — envoi des e-mails
                transactionnels : vérification d&apos;adresse et réinitialisation de mot de passe, rappels
                liés à votre abonnement, et échanges liés au programme beta et aux retours.
              </LI>
              <LI>
                <strong className="text-ss-fg">Notion</strong> (Notion Labs, États-Unis) — enregistrement et
                suivi des candidatures et des retours beta.
              </LI>
              <LI>
                <strong className="text-ss-fg">Vercel</strong> (États-Unis/UE) — hébergement de notre site,
                journaux techniques associés, et mesure d&apos;audience/performance agrégée (Vercel Web
                Analytics et Speed Insights).
              </LI>
              <LI>
                <strong className="text-ss-fg">PostHog</strong> (PostHog Inc., instance Cloud Union
                européenne) — statistiques d&apos;utilisation anonymes de l&apos;application (voir
                section&nbsp;3)&nbsp;; ces données ne quittent pas l&apos;UE.
              </LI>
              <LI>
                <strong className="text-ss-fg">Open-Meteo</strong> (Union européenne) — réception des
                coordonnées d&apos;un spot pour renvoyer les prévisions météo et marines correspondantes.
              </LI>
              <LI>
                <strong className="text-ss-fg">OpenFreeMap / OpenStreetMap</strong> — fonds de carte et
                données de ports&nbsp;; les coordonnées de la zone affichée sont transmises pour charger
                la carte.
              </LI>
            </UL>

            <H2 id="transferts">7. Transferts hors Union européenne</H2>
            <P>
              Vos données de compte, de synchronisation et d&apos;abonnement sont hébergées{' '}
              <strong className="text-ss-fg">dans l&apos;Union européenne</strong> (base de données à
              Francfort, backend à Paris). Certains prestataires sont toutefois situés aux États-Unis :
              RevenueCat (gestion des abonnements), Google (paiement Google Play et connexion Google le
              cas échéant), Notion (gestion du programme beta) et Vercel (site). Lorsque des données y
              sont transférées, ce transfert est encadré par les mécanismes prévus par le RGPD (clauses
              contractuelles types et/ou adhésion au <em>Data Privacy Framework</em>). Nous limitons ces
              transferts au strict nécessaire.
            </P>

            <H2 id="conservation">8. Durée de conservation</H2>
            <UL>
              <LI>
                <strong className="text-ss-fg">Données locales</strong> : conservées sur votre appareil
                jusqu&apos;à leur suppression par vos soins ou la désinstallation de l&apos;application.
              </LI>
              <LI>
                <strong className="text-ss-fg">Compte et données synchronisées</strong> : conservés tant
                que votre compte existe&nbsp;; supprimés sur demande ou lors de la suppression de votre
                compte.
              </LI>
              <LI>
                <strong className="text-ss-fg">État d&apos;abonnement</strong> : conservé pendant la durée
                de la relation d&apos;abonnement, puis le temps requis par nos obligations comptables et
                légales.
              </LI>
              <LI>
                <strong className="text-ss-fg">Sessions</strong> (jeton, adresse IP, type d&apos;appareil) :
                jusqu&apos;à leur expiration ou votre déconnexion.
              </LI>
              <LI>
                <strong className="text-ss-fg">Candidatures et retours beta</strong> : conservés
                12&nbsp;mois maximum après la fin du programme bêta.
              </LI>
              <LI>
                <strong className="text-ss-fg">Statistiques d&apos;utilisation anonymes</strong> :
                conservées 30&nbsp;jours maximum (voir section&nbsp;3).
              </LI>
              <LI>
                <strong className="text-ss-fg">Journaux techniques</strong> : conservés 30&nbsp;jours
                maximum, à des fins de sécurité et de diagnostic.
              </LI>
            </UL>

            <H2 id="droits">9. Vos droits</H2>
            <P>
              Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification, d&apos;effacement,
              de limitation et d&apos;opposition, ainsi que du droit à la portabilité de vos données et du
              droit de retirer votre consentement à tout moment. Si vous avez un compte, vous pouvez en
              demander la suppression, ce qui entraîne l&apos;effacement des données associées. Pour exercer
              ces droits, écrivez-nous à{' '}
              <a href="mailto:seascope-contact@pennarstudio.fr" className="text-ss-teal">
                seascope-contact@pennarstudio.fr
              </a>
              . Vous pouvez également introduire une réclamation auprès de la CNIL (
              <a href="https://www.cnil.fr" className="text-ss-teal" rel="noopener noreferrer" target="_blank">
                www.cnil.fr
              </a>
              ).
            </P>

            <H2 id="securite">10. Sécurité</H2>
            <P>
              Nous mettons en œuvre des mesures techniques et organisationnelles raisonnables pour
              protéger vos données : connexions chiffrées (HTTPS), mots de passe stockés uniquement sous
              forme hachée (jamais en clair), jetons d&apos;authentification conservés dans un stockage
              sécurisé chiffré sur votre appareil, hébergement dans l&apos;Union européenne, accès restreint
              aux outils de gestion et principe de minimisation des données. Aucun système n&apos;étant
              infaillible, nous ne pouvons garantir une sécurité absolue, mais nous nous engageons à vous
              informer en cas d&apos;incident affectant vos données.
            </P>

            <H2 id="mineurs">11. Mineurs</H2>
            <P>
              SeaScope n&apos;est pas destiné aux enfants. Nous ne collectons pas sciemment de données
              concernant des personnes de moins de 15 ans. Si vous pensez qu&apos;un mineur nous a transmis
              des données, contactez-nous afin que nous les supprimions.
            </P>

            <H2 id="modifications">12. Modifications de cette politique</H2>
            <P>
              Cette politique peut évoluer, notamment au fil des nouvelles fonctionnalités. En cas de
              changement important, nous mettrons à jour la date en haut de page et, si nécessaire, vous
              en informerons par e-mail ou dans l&apos;application.
            </P>

            <H2 id="contact">13. Contact</H2>
            <P>
              Pennar Studio — SeaScope
              <br />
              <a href="mailto:seascope-contact@pennarstudio.fr" className="text-ss-teal">
                seascope-contact@pennarstudio.fr
              </a>
            </P>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
