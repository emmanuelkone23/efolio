/*
 * ─────────────────────────────────────────────────────────────
 *  VOTRE CONTENU — c'est le seul fichier à modifier.
 * ─────────────────────────────────────────────────────────────
 *  • Photos : déposez vos fichiers dans  images/  (portrait)
 *             et  images/projets/  (réalisations), puis écrivez
 *             leur chemin ci-dessous. Tant qu'une image est
 *             absente, le site affiche un visuel de remplacement
 *             qui indique le chemin attendu.
 *  • Documents (CV, diplômes…) : déposez les PDF dans  documents/
 *  • Les textes, chiffres et projets marqués « exemple » sont
 *    là pour vous montrer le rendu : remplacez-les par les vôtres.
 */
window.PORTFOLIO = {
  nom: "Koné Emmanuel",
  initiales: "KE",
  metier: "Développeur web Full-Stack",
  accroche:
    "Je conçois et développe des applications web robustes, du modèle de données jusqu'à l'écran de celui qui s'en sert tous les jours.",
  localisation: "Abidjan, Côte d'Ivoire",
  fuseauHoraire: "Africa/Abidjan", // pour l'heure locale affichée en bas de l'accueil
  disponibilite: "Disponible pour de nouveaux projets",
  photo: "images/portrait.jpg",

  apropos: {
    titre: "Du besoin métier au produit en ligne, sans perdre le fil.",
    paragraphes: [
      "Je suis développeur full-stack. J'aime les projets où le code sert un vrai métier : une boutique qui doit expédier ses colis, un livreur qui doit savoir où aller, un gérant qui veut voir ses chiffres en un coup d'œil.",
      "Je m'occupe de toute la chaîne : base de données, logique serveur, interface, mise en ligne. J'utilise des outils de pointe pour la sécurité, et mon code est versionné proprement et pensé pour être repris par quelqu'un d'autre.",
      "Ce qui me distingue : je pose les bonnes questions avant d'écrire la première ligne, et je livre par étapes pour que vous voyiez le produit avancer."
    ]
  },

  // Chiffres clés — à ajuster
  chiffres: [
    { valeur: 2, suffixe: "", label: "années d'expérience" },
    { valeur: 1, suffixe: "", label: "plateforme complète réalisée" }
  ],

  // Parcours : du plus récent au plus ancien
  parcours: [
    {
      periode: "2 ans d'expérience",
      type: "Expérience",
      titre: "Développeur Full-Stack",
      lieu: "Plateforme de livraison",
      texte:
        "Conception et développement d'une plateforme de ramassage et de livraison : espaces boutique et livreur, tableaux de bord, suivi des colis, sécurité des sessions."
    },
    {
      periode: "Formation",
      type: "Diplôme",
      titre: "Brevet de Technicien Supérieur en Développement d'Applications",
      lieu: "Pigier Côte d'Ivoire",
      texte: "Développement d'applications, bases de données, réseaux et gestion de projet."
    }
  ],

  // niveau : de 1 à 5 (laisser vide pour ne pas afficher de niveau)
  competences: [
    {
      groupe: "Back-end",
      items: [
        { nom: "PHP 8", niveau: 5 },
        { nom: "MySQL / MariaDB", niveau: 4 },
        { nom: "API REST", niveau: 4 },
        { nom: "Sécurité web", niveau: 4 }
      ]
    },
    {
      groupe: "Front-end",
      items: [
        { nom: "HTML & CSS", niveau: 5 },
        { nom: "JavaScript", niveau: 4 },
        { nom: "Interfaces mobiles", niveau: 5 },
        { nom: "Three.js / WebGL", niveau: 3 }
      ]
    },
    {
      groupe: "Outils",
      items: [
        { nom: "Git & GitHub", niveau: 4 },
        { nom: "Outils de sécurité", niveau: 4 },
        { nom: "Apache / WAMP", niveau: 4 },
        { nom: "Serveurs Linux", niveau: 3 }
      ]
    },
    {
      groupe: "Savoir-être",
      items: [
        { nom: "Autonomie" },
        { nom: "Rigueur" },
        { nom: "Écoute du client" },
        { nom: "Sens du produit" }
      ]
    }
  ],

  // Réalisations — image : couverture ; galerie : photos affichées dans la fiche détaillée
  projets: [
    {
      titre: "Plateforme de livraison",
      categorie: "Application web",
      annee: "2026",
      role: "Conception, développement, mise en ligne",
      resume: "Ramassage, suivi et tableaux de bord pour les boutiques partenaires et les livreurs.",
      description: [
        "Une plateforme complète pour organiser les livraisons : les boutiques demandent un ramassage, les livreurs voient leurs courses, l'administration suit tout en temps réel.",
        "Chaque rôle a son tableau de bord. L'interface est pensée d'abord pour le téléphone, avec un guide vidéo pour les nouveaux partenaires."
      ],
      stack: ["PHP", "MySQL", "JavaScript", "Sécurité web"],
      image: "images/projets/livraison.jpg",
      galerie: ["images/projets/livraison-1.jpg"],
      lien: ""
    }
  ],

  // Documentation : comment vous travaillez
  methode: [
    { titre: "Écouter", texte: "Comprendre le métier, les utilisateurs et les contraintes avant d'écrire une ligne de code." },
    { titre: "Concevoir", texte: "Modèle de données, parcours et maquettes validés ensemble." },
    { titre: "Développer", texte: "Code versionné, analysé et livré par étapes visibles." },
    { titre: "Accompagner", texte: "Mise en ligne, sauvegardes, prise en main et suivi." }
  ],

  contact: {
    email: "yayaleroro225@gmail.com",
    telephone: "+225 05 02 04 65 50",
    reseaux: [
      { nom: "GitHub", url: "https://github.com/emmanuelkone23" },
      { nom: "LinkedIn", url: "https://www.linkedin.com/" },
      { nom: "WhatsApp", url: "https://wa.me/2250502046550" }
    ]
  }
};
