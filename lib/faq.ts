// Questions fréquentes — partagées entre la section FAQ et le JSON-LD FAQPage (Task 11).

export interface FaqItem {
  q: string
  a: string
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    q: "En quoi SeaScope est-il différent d'une application météo classique ?",
    a: "Une application météo vous donne des chiffres — vent, température, pression. SeaScope les interprète à votre place : elle analyse vent, vagues, marées, courants et sécurité en même temps, puis vous dit simplement « vous pouvez sortir, voici la meilleure fenêtre ». Vous n'avez plus à jongler entre cinq sources pour prendre une décision.",
  },
  {
    q: 'Puis-je utiliser SeaScope gratuitement ?',
    a: "Oui, et sans limite de temps. Les fonctions essentielles — sécurité, météo de base, carte, journal de bord et verdict de décision — sont gratuites pour toujours. L'abonnement Premium débloque l'analyse avancée, les prévisions étendues et le Guardian intelligent.",
  },
  {
    q: 'Pourquoi un abonnement Premium est-il nécessaire ?',
    a: "Les données marines haute résolution (Météo-France AROME, SHOM, modèles de courants) ont un coût d'accès réel. L'abonnement nous permet de maintenir des serveurs fiables, d'intégrer de nouvelles sources et de continuer à développer SeaScope sans publicité ni revente de données.",
  },
  {
    q: "D’où viennent les données météo et marines ?",
    a: "SeaScope s'appuie sur Météo-France AROME pour les prévisions côtières haute résolution, Open-Meteo pour la couverture mondiale, et le SHOM pour les données officielles de marée et de courant. Chaque source est choisie pour sa fiabilité dans le contexte de la navigation de plaisance.",
  },
  {
    q: 'SeaScope sera-t-il disponible sur iPhone ?',
    a: "Oui, c'est prévu. Nous avons commencé par Android pour valider l'application avec des vrais utilisateurs. La version iOS est en cours de développement et sera annoncée dès que nous aurons une date précise.",
  },
  {
    q: 'Les données affichées sont-elles fiables pour prendre des décisions de sécurité ?',
    a: "SeaScope utilise des sources institutionnelles reconnues et agrège plusieurs modèles pour réduire les incertitudes. Cela dit, aucune application ne remplace le jugement du skipper et les règles de prudence en mer. SeaScope est un outil d'aide à la décision — la responsabilité finale reste la vôtre.",
  },
]
