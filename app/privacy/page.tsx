import type { Metadata } from 'next'
import { Nav } from '@/components/layout/Nav'
import { Footer } from '@/components/layout/Footer'
import { Kicker } from '@/components/ui/Kicker'

export const metadata: Metadata = {
  title: 'Politique de confidentialité — SeaScope',
  description:
    'Comment SeaScope collecte, utilise et protège vos données. Stockage local par défaut, aucune revente, conformité RGPD.',
  robots: { index: true, follow: true },
}

const UPDATED = '2 juin 2026'
const VERSION = '1.1'

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
                SeaScope est conçu pour fonctionner avec un minimum de données. Vos spots, vos
                préférences et votre historique de sorties restent <strong className="text-ss-fg">sur votre
                appareil</strong>.
              </LI>
              <LI>
                Nous ne vendons, ne louons et n&apos;échangeons <strong className="text-ss-fg">jamais</strong> vos
                données personnelles.
              </LI>
              <LI>
                Votre position sert uniquement à récupérer les conditions marines de votre zone. Elle
                n&apos;est pas utilisée pour vous suivre ni pour constituer un profil publicitaire.
              </LI>
              <LI>
                Les informations que vous nous confiez via les formulaires (candidature beta, retours)
                servent uniquement à gérer le programme de test.
              </LI>
              <LI>
                Vous pouvez à tout moment demander l&apos;accès, la correction ou la suppression de vos
                données :{' '}
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
              Par défaut, les données suivantes sont enregistrées <strong className="text-ss-fg">localement</strong>{' '}
              sur votre téléphone et ne sont pas transmises à un serveur central ni associées à un
              compte :
            </P>
            <UL>
              <LI>Vos spots enregistrés (noms et coordonnées des lieux que vous suivez).</LI>
              <LI>
                Votre profil de navigation : type de bateau, pratique, tolérance, et vos seuils
                personnels (vent, vagues, rafales).
              </LI>
              <LI>Vos préférences d&apos;application (réglages, unités, affichage).</LI>
              <LI>
                Votre historique de recommandations et, le cas échéant, les retours que vous notez
                après une sortie.
              </LI>
            </UL>

            <H3>2.2 Données techniques nécessaires au fonctionnement</H3>
            <P>
              Pour vous fournir une recommandation, l&apos;application doit interroger des services de
              prévision marine. Les données suivantes transitent par le réseau :
            </P>
            <UL>
              <LI>
                <strong className="text-ss-fg">Coordonnées géographiques du spot consulté.</strong> Elles
                sont envoyées à nos services de prévision afin de récupérer les conditions marines
                correspondantes. Elles ne sont pas associées à votre identité ni conservées pour vous
                profiler.
              </LI>
              <LI>
                <strong className="text-ss-fg">Données techniques minimales</strong> : type d&apos;appareil,
                version du système, identifiant technique de requête, et journaux d&apos;erreur permettant
                de diagnostiquer un dysfonctionnement.
              </LI>
            </UL>

            <H3>2.3 Géolocalisation</H3>
            <P>
              Si vous l&apos;autorisez, SeaScope peut utiliser la position de votre appareil pour vous
              proposer les conditions de la zone où vous vous trouvez, ou pour faciliter
              l&apos;enregistrement d&apos;un spot. L&apos;autorisation de localisation est facultative : vous
              pouvez la refuser et saisir vos spots manuellement, et vous pouvez la révoquer à tout
              moment dans les réglages de votre téléphone. Nous n&apos;effectuons pas de suivi de position
              en arrière-plan à des fins commerciales.
            </P>

            <H3>2.4 Notifications</H3>
            <P>
              Si vous activez les alertes, SeaScope vous prévient lorsqu&apos;une fenêtre favorable
              s&apos;ouvre ou que les conditions se dégradent sur un spot suivi. En version bêta, ces
              notifications sont <strong className="text-ss-fg">uniquement locales</strong> : elles sont
              générées sur votre appareil. SeaScope <strong className="text-ss-fg">n&apos;utilise aucun
              service de notification push distant</strong>, ne collecte aucun jeton Firebase Cloud
              Messaging (FCM) et ne transmet aucune donnée utilisateur pour les notifications. Vous
              pouvez les désactiver à tout moment.
            </P>

            <H3>2.5 Mesure d&apos;audience et statistiques</H3>
            <P>
              <strong className="text-ss-fg">Dans l&apos;application</strong> : SeaScope n&apos;utilise aucun
              outil d&apos;analyse d&apos;audience, de suivi comportemental ou de publicité.
            </P>
            <P>
              <strong className="text-ss-fg">Sur notre site</strong> (cette page, la page d&apos;accueil et
              les formulaires) : nous utilisons Vercel Web Analytics et Vercel Speed Insights pour
              mesurer la fréquentation et les performances. Cette mesure est agrégée et respectueuse de
              la vie privée : pas de cookie de suivi publicitaire, pas de profil individuel, pas de
              revente.
            </P>

            <H3>2.6 Formulaires (programme beta et retours)</H3>
            <P>
              Lorsque vous candidatez à la beta fermée ou que vous envoyez un retour depuis notre site,
              nous collectons les informations que vous saisissez :
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
              dans notre espace de gestion du programme beta (voir section 5). Elles servent uniquement
              à sélectionner les testeurs, à communiquer avec vous et à améliorer le produit.
            </P>

            <H2 id="finalites">3. Pourquoi nous traitons ces données (finalités &amp; bases légales)</H2>
            <UL>
              <LI>
                <strong className="text-ss-fg">Fournir les recommandations</strong> (conditions, fenêtre,
                heure de retour) — base légale : exécution du service que vous demandez.
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
                <strong className="text-ss-fg">Assurer la sécurité et le bon fonctionnement</strong>{' '}
                (diagnostic d&apos;erreurs, prévention des abus) — base légale : intérêt légitime.
              </LI>
            </UL>

            <H2 id="partage">4. Ce que nous ne faisons pas</H2>
            <UL>
              <LI>Nous ne vendons pas vos données.</LI>
              <LI>Nous ne les louons pas et ne les cédons pas à des courtiers en données.</LI>
              <LI>Nous ne créons aucun compte utilisateur.</LI>
              <LI>Nous n&apos;utilisons aucun outil de suivi comportemental ou publicitaire (la mesure d&apos;audience du site se limite à des statistiques agrégées — voir §2.5).</LI>
              <LI>Nous n&apos;utilisons aucun identifiant publicitaire.</LI>
              <LI>Nous ne construisons aucun profil marketing ni publicitaire à partir de votre navigation en mer.</LI>
              <LI>Nous n&apos;affichons pas de publicité dans l&apos;application.</LI>
            </UL>

            <H2 id="sous-traitants">5. Avec qui nous partageons des données (sous-traitants)</H2>
            <P>
              Nous faisons appel à un petit nombre de prestataires techniques qui traitent des données
              pour notre compte, uniquement dans la mesure nécessaire au service :
            </P>
            <UL>
              <LI>
                <strong className="text-ss-fg">Brevo</strong> (Sendinblue, France/UE) — envoi des e-mails
                transactionnels liés au programme beta et aux retours.
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
                <strong className="text-ss-fg">Open-Meteo</strong> (Union européenne) — réception des
                coordonnées d&apos;un spot pour renvoyer les prévisions météo et marines correspondantes.
              </LI>
              <LI>
                <strong className="text-ss-fg">OpenFreeMap / OpenStreetMap</strong> — fonds de carte et
                données de ports&nbsp;; les coordonnées de la zone affichée sont transmises pour charger
                la carte.
              </LI>
              <LI>
                <strong className="text-ss-fg">Notre backend SeaScope</strong> — proxy qui relaie les
                coordonnées d&apos;un spot vers les services de prévision&nbsp;; il ne reçoit aucun
                identifiant de compte (l&apos;application n&apos;en crée pas).
              </LI>
            </UL>

            <H2 id="transferts">6. Transferts hors Union européenne</H2>
            <P>
              Certains prestataires (notamment Notion et Vercel) sont situés aux États-Unis. Lorsque
              des données y sont transférées, ce transfert est encadré par les mécanismes prévus par le
              RGPD (clauses contractuelles types et/ou adhésion au <em>Data Privacy Framework</em>).
              Nous limitons ces transferts au strict nécessaire.
            </P>

            <H2 id="conservation">7. Durée de conservation</H2>
            <UL>
              <LI>
                <strong className="text-ss-fg">Données locales</strong> : conservées sur votre appareil
                jusqu&apos;à leur suppression par vos soins ou la désinstallation de l&apos;application.
              </LI>
              <LI>
                <strong className="text-ss-fg">Candidatures et retours beta</strong> : conservés
                12&nbsp;mois maximum après la fin du programme bêta.
              </LI>
              <LI>
                <strong className="text-ss-fg">Journaux techniques</strong> : conservés 30&nbsp;jours
                maximum, à des fins de sécurité et de diagnostic.
              </LI>
            </UL>

            <H2 id="droits">8. Vos droits</H2>
            <P>
              Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification, d&apos;effacement,
              de limitation et d&apos;opposition, ainsi que du droit à la portabilité de vos données et du
              droit de retirer votre consentement à tout moment. Pour exercer ces droits, écrivez-nous
              à{' '}
              <a href="mailto:seascope-contact@pennarstudio.fr" className="text-ss-teal">
                seascope-contact@pennarstudio.fr
              </a>
              . Vous pouvez également introduire une réclamation auprès de la CNIL (
              <a href="https://www.cnil.fr" className="text-ss-teal" rel="noopener noreferrer" target="_blank">
                www.cnil.fr
              </a>
              ).
            </P>

            <H2 id="securite">9. Sécurité</H2>
            <P>
              Nous mettons en œuvre des mesures techniques et organisationnelles raisonnables pour
              protéger vos données : connexions chiffrées (HTTPS), accès restreint aux outils de
              gestion, et principe de minimisation des données. Aucun système n&apos;étant infaillible,
              nous ne pouvons garantir une sécurité absolue, mais nous nous engageons à vous informer en
              cas d&apos;incident affectant vos données.
            </P>

            <H2 id="mineurs">10. Mineurs</H2>
            <P>
              SeaScope n&apos;est pas destiné aux enfants. Nous ne collectons pas sciemment de données
              concernant des personnes de moins de 15 ans. Si vous pensez qu&apos;un mineur nous a transmis
              des données, contactez-nous afin que nous les supprimions.
            </P>

            <H2 id="modifications">11. Modifications de cette politique</H2>
            <P>
              Cette politique peut évoluer, notamment au passage de la beta à la version publique. En
              cas de changement important, nous mettrons à jour la date en haut de page et, si
              nécessaire, vous en informerons par e-mail ou dans l&apos;application.
            </P>

            <H2 id="contact">12. Contact</H2>
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
