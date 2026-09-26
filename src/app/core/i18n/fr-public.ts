/**
 * Public-facing French translations — eagerly bundled for fast first paint.
 *
 * Contains only the sections consumed by the public pages (home, about,
 * features, contact, login, register) and shared components visible on
 * those pages (BrandLogo, LanguageSelector, PublicNav, PublicFooter).
 *
 * The remaining sections (settings, dashboard, wellness, planning, etc.)
 * live in `fr.ts` and are lazy-loaded after first paint.
 */
export const FR_PUBLIC = {
  welcome: {
    splashSubtitle: 'Votre journée, clarifiée',
    skip: 'Passer',
    next: 'Suivant',
    start: 'Se connecter',
    slide1Title: 'Organisez votre journée',
    slide1Body: 'Planning, tâches et calendrier restent au même endroit.',
    slide2Title: 'Suivez votre équilibre',
    slide2Body: 'Sommeil, hydratation, repas et sport, sans tableau compliqué.',
    slide3Title: 'Demandez à l’assistant',
    slide3Body: 'Une question sur votre journée, une réponse à partir de vos données.',
  },
  sidebar: {
    brand: 'Digital Life Twin',
    subtitle: 'Votre journée, clarifiée',
    sections: {
      navigation: 'Navigation',
      wellbeing: 'Bien-être',
      intelligence: 'Intelligence',
    },
    nav: {
      dashboard: 'Dashboard',
      planning: 'Planning',
      tasks: 'Tâches',
      calendar: 'Calendrier',
    },
    wellbeing: {
      title: 'Bien-être',
    },
    nutrition: {
      title: 'Nutrition',
    },
    sport: {
      title: 'Sport',
    },
    ai: {
      title: 'Assistant IA',
    },
    notifications: {
      title: 'Notifications',
    },
    account: {
      title: 'Compte',
      profile: 'Profil',
    },
    settings: {
      title: 'Paramètres',
    },
    admin: {
      title: 'Administration',
    },
    descriptions: {
      dashboard: "Vue d'ensemble de votre journée et de vos objectifs.",
      planning: 'Organisation de votre temps et de vos priorités.',
      tasks: 'Gestion de vos tâches et de vos objectifs.',
      calendar: 'Vos événements et votre agenda.',
      wellness: 'Sommeil, hydratation, humeur et équilibre.',
      nutrition: 'Vos repas et vos apports nutritionnels.',
      sport: 'Vos séances et votre activité physique.',
      assistant: 'Votre assistant intelligent pour votre journée.',
      notifications: 'Rappels, alertes et recommandations.',
      profile: 'Vos informations personnelles et vos préférences.',
      settings: 'Préférences et configuration du compte.',
      admin: 'Administration et statistiques de la plateforme.',
    },
  },
  footer: {
    title: 'Digital Life Twin',
    version: 'v1.0',
  },
  header: {
    search: 'Rechercher…',
    notifications: 'Notifications',
    profile: 'Profil',
    settings: 'Paramètres',
    logout: 'Se déconnecter',
    profileMenu: 'Menu du compte',
    roleUser: 'Utilisateur',
    roleAdmin: 'Administrateur',
    admin: 'Administration',
    language: 'Langue',
    openMenu: 'Ouvrir le menu',
  },
  common: {
    save: 'Enregistrer',
    cancel: 'Annuler',
    delete: 'Supprimer',
    edit: 'Modifier',
    add: 'Ajouter',
    search: 'Rechercher',
    close: 'Fermer',
    loading: 'Chargement…',
    retry: 'Réessayer',
    empty: 'Aucune donnée',
    back: 'Retour',
    confirm: 'Confirmer',
    next: 'Suivant',
    previous: 'Précédent',
    all: 'Tout',
    reset: 'Réinitialiser',
    yes: 'Oui',
    no: 'Non',
    units: {
      minuteShort: 'min',
      hourShort: 'h',
    },
  },
  public: {
    nav: {
      home: 'Accueil',
      features: 'Fonctionnalités',
      about: 'À propos',
      contact: 'Contact',
      login: 'Se connecter',
      register: 'Commencer gratuitement',
      openMenu: 'Ouvrir le menu',
      closeMenu: 'Fermer le menu',
      primary: 'Navigation principale',
      mobile: 'Navigation mobile',
    },
    weekdaysShort: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
    footer: {
      description:
        'Digital Life Twin centralise votre planning, vos habitudes et votre bien-être pour vous aider à mieux organiser chaque journée.',
      platform: 'Plateforme',
      getStarted: 'Commencer',
      login: 'Se connecter',
      createAccount: 'Créer un compte',
      home: 'Accueil',
      copyright: '© {{year}} Digital Life Twin. Tous droits réservés.',
      terms: 'Conditions d’utilisation',
      privacy: 'Politique de confidentialité',
      disclaimer:
        'Indicateurs de bien-être — ne remplace pas un avis médical professionnel.',
    },
    legal: {
      badge: 'Mentions légales',
      terms: {
        title: 'Conditions d’utilisation',
        updated: 'Dernière mise à jour : 26 septembre 2026',
        intro:
          'Ces conditions encadrent l’usage de Digital Life Twin (ENTWIN). Créer un compte vaut acceptation.',
        sections: [
          {
            heading: 'Objet du service',
            body: 'ENTWIN aide à organiser planning, habitudes et bien-être. Ce n’est pas un dispositif médical.',
          },
          {
            heading: 'Votre compte',
            body: 'Vous êtes responsable de vos informations et de votre mot de passe. Vous pouvez le changer dans Paramètres → Sécurité.',
          },
          {
            heading: 'Contact',
            body: 'Les questions se posent depuis la page Contact.',
          },
        ],
      },
      privacy: {
        title: 'Politique de confidentialité',
        updated: 'Dernière mise à jour : 26 septembre 2026',
        intro: 'Cette politique décrit les données conservées pour votre compte et le suivi bien-être.',
        sections: [
          {
            heading: 'Données conservées',
            body: 'Profil, journaux de planning et de bien-être, et données de sécurité (mot de passe chiffré, codes de vérification).',
          },
          {
            heading: 'Vos choix',
            body: 'Vous pouvez mettre à jour votre profil, changer de mot de passe, ou nous contacter pour une suppression.',
          },
        ],
      },
    },
    home: {
      hero: {
        badge: 'Planification · Bien-être · IA',
        titleA: 'Votre quotidien,',
        titleB: 'enfin compris.',
        description:
          'Digital Life Twin centralise votre planning, vos habitudes et votre bien-être pour vous aider à mieux organiser chaque journée.',
        primaryCta: 'Commencer gratuitement',
        secondaryCta: 'Découvrir la plateforme',
        stats: {
          unified: 'espace unifié',
          modules: 'modules intégrés',
          diagnosis: 'diagnostic médical',
        },
      },
      preview: {
        productivity: 'Productivité',
        tasks: 'Tâches',
        hydration: 'Hydratation',
        sleep: 'Sommeil',
        weeklyActivity: 'Activité hebdomadaire',
      },
      pillars: {
        eyebrow: 'La plateforme',
        title: 'Un seul espace pour organiser, suivre et comprendre',
        subtitle: 'Trois piliers qui travaillent ensemble pour transformer votre quotidien.',
        planning: {
          title: 'Planification intelligente',
          description:
            'Vos tâches, événements et plages de temps centralisés dans un planning unifié, avec détection automatique des conflits et des journées surchargées.',
        },
        wellness: {
          title: 'Bien-être suivi',
          description:
            'Sommeil, hydratation, humeur, stress et fatigue suivis en douceur pour mieux comprendre l\'équilibre de votre journée.',
        },
        ai: {
          title: 'IA personnalisée',
          description:
            'Des recommandations claires et des indicateurs de confiance, basés uniquement sur vos données — jamais de diagnostic médical.',
        },
      },
      how: {
        eyebrow: 'Comment ça marche',
        title: 'Un cercle vertueux, en trois étapes',
        centralize: {
          title: 'Centralisez',
          description:
            'Planifiez vos journées, notez vos repas, vos séances et votre forme en quelques gestes.',
        },
        analyze: {
          title: 'Analysez',
          description:
            'Digital Life Twin repère les tendances : surcharge, fatigue, hydratation, sédentarité.',
        },
        act: {
          title: 'Agissez',
          description:
            'Recevez des recommandations claires pour mieux organiser chaque journée, sans stress.',
        },
      },
      planning: {
        eyebrow: 'Planning',
        title: 'Des journées organisées, sans surcharge',
        description:
          'Tâches, événements et plages de travail sur une seule timeline. Digital Life Twin détecte les conflits et les journées trop chargées avant qu\'elles ne deviennent un problème.',
        points: [
          'Une timeline quotidienne claire : tâches, événements et plages de travail',
          'Détection des conflits et des journées surchargées',
          'Temps libre calculé automatiquement pour respirer',
        ],
        link: 'En savoir plus sur le planning',
        today: 'Aujourd\'hui',
        items: {
          focus: 'Focus — Rapport trimestriel',
          focusMeta: 'Plage de travail · 2 h',
          team: 'Réunion d\'équipe',
          teamMeta: 'Événement · 45 min',
          sport: 'Séance de sport',
          sportMeta: 'Bien-être · 1 h',
          dev: 'Focus — Projet Digital Life Twin',
          devMeta: 'Plage de travail · 1 h 30',
        },
      },
      wellness: {
        eyebrow: 'Bien-être',
        title: 'Comprendre votre énergie, pas la juger',
        description:
          'Sommeil, hydratation, humeur, stress et fatigue : suivez l\'évolution de votre forme au fil des semaines. Chaque résultat est présenté comme un indicateur, jamais comme un diagnostic médical.',
        sleep: 'Sommeil',
        hydration: 'Hydratation',
        mood: 'Humeur',
        moodValue: 'Sereine',
        stress: 'Stress',
        stressValue: 'Faible',
        tags: ['Sommeil', 'Hydratation', 'Humeur', 'Stress', 'Fatigue', 'Score de bien-être'],
      },
      ai: {
        eyebrow: 'IA personnalisée',
        title: 'Des insights utiles, expliqués et transparents',
        description:
          'Chaque analyse affiche son niveau de confiance, les facteurs qui y contribuent et une recommandation concrète. Vous gardez le contrôle de vos données.',
        insights: {
          fatigue: 'Fatigue potentielle',
          hydration: 'Hydratation insuffisante',
          overload: 'Journée surchargée',
          sedentary: 'Sédentarité',
        },
        levels: {
          moderate: 'Modérée',
          follow: 'Suivi',
          high: 'Élevée',
        },
      },
      notifications: {
        eyebrow: 'Notifications',
        title: 'Les bons rappels, au bon moment',
        description:
          'Rappels de tâches, d\'événements, d\'hydratation ou de départ : l\'application vous accompagne tout au long de la journée sans jamais vous submerger.',
        items: {
          team: 'Rappel : réunion d\'équipe dans 15 minutes',
          teamTime: 'Il y a 2 min',
          teamCategory: 'Rappel',
          water: 'Pensez à boire un verre d\'eau',
          waterTime: 'Il y a 18 min',
          waterCategory: 'Bien-être',
          morning: 'Votre matinée est chargée, prévoyez une pause',
          morningTime: 'Il y a 1 h',
          morningCategory: 'IA',
        },
      },
      dashboard: {
        eyebrow: 'Vue d\'ensemble',
        title: '« Comment se passe ma journée ? »',
        subtitle: 'Un tableau de bord clair qui répond à la seule question qui compte vraiment.',
        windowLabel: 'Digital Life Twin — Tableau de bord',
        tasksTitle: 'Tâches du jour',
        tasksValue: '6 / 8',
        tasksHint: '2 restantes',
        freeTimeTitle: 'Temps libre',
        freeTimeValue: '3h 15',
        freeTimeHint: 'prévu aujourd\'hui',
        stressTitle: 'Stress',
        stressValue: 'Faible',
        stressHint: 'tendance stable',
        fatigueTitle: 'Fatigue',
        fatigueValue: 'Modérée',
        fatigueHint: 'en hausse ce soir',
      },
      benefits: {
        eyebrow: 'Pourquoi Digital Life Twin',
        title: 'Une plateforme pensée pour vous, pas pour vous surcharger',
        items: [
          'Une vue claire de votre journée en un coup d\'œil',
          'Des recommandations basées sur vos propres données',
          'Aucune donnée partagée, aucun jugement',
          'Des indicateurs de bien-être, jamais de diagnostic',
          'Mobile, tablette et ordinateur, où que vous soyez',
          'Gratuit pour commencer, sans engagement',
        ],
      },
      cta: {
        badge: 'Rejoignez Digital Life Twin',
        title: 'Prêt à reprendre le contrôle de votre journée ?',
        description:
          'Commencez gratuitement. Organisez votre planning, suivez votre bien-être et laissez l\'intelligence vous guider.',
        primary: 'Commencer gratuitement',
        secondary: 'Nous contacter',
      },
    },
    about: {
      badge: 'À propos',
      titleA: 'Comprendre sa vie,',
      titleB: 'c\'est la première étape',
      titleC: 'pour mieux la vivre.',
      description:
        'Digital Life Twin est né d\'une intuition simple : nos journées sont devenues trop complexes pour être gérées sans aide. La technologie peut offrir cette aide — à condition d\'être au service de l\'humain.',
      concept: {
        eyebrow: 'Le concept',
        title: 'Un jumeau numérique de votre quotidien',
        text1:
          'Digital Life Twin construit une représentation de votre vie quotidienne : votre planning, vos tâches, vos repas, votre activité et votre forme. En croisant ces informations, la plateforme dégage des tendances utiles — jamais des vérités absolues.',
        text2:
          'L\'objectif n\'est pas de vous surveiller, mais de vous éclairer. Vous décidez de ce que vous souhaitez partager, modifier ou ignorer.',
        link: 'Découvrir les fonctionnalités',
        domains: 'domaines de vie couverts',
        userCentered: 'centré sur l\'utilisateur',
      },
      vision: {
        eyebrow: 'Notre vision',
        title: 'La technologie au service d\'une vie mieux organisée',
        description:
          'Nous croyons que l\'intelligence artificielle peut rendre nos journées plus légères, plus claires et plus humaines — si elle reste transparente et sous contrôle.',
        values: {
          clarity: {
            title: 'Clarté',
            description:
              'Une vision simple et honnête de votre journée, sans jargon, sans jugement.',
          },
          balance: {
            title: 'Équilibre',
            description:
              'La productivité n\'a de sens que si elle respecte votre énergie et votre bien-être.',
          },
          trust: {
            title: 'Confiance',
            description:
              'Vos données vous appartiennent. Rien n\'est partagé sans votre accord explicite.',
          },
        },
      },
      data: {
        eyebrow: 'Votre contrôle',
        title: 'Transparence et maîtrise des données',
        description:
          'Le bien-être est une donnée sensible. C\'est pourquoi Digital Life Twin applique des principes stricts : expliquer chaque résultat, présenter chaque analyse comme une indication, et ne jamais prétendre remplacer un professionnel de santé.',
        cardTitle: 'Vos données vous appartiennent',
        points: [
          'Vos données restent sur votre appareil pendant la démonstration',
          'Aucune vente de données à des tiers',
          'Pas de publicité ciblée fondée sur votre bien-être',
          'Vous pouvez réinitialiser ou supprimer vos données à tout moment',
        ],
        note: 'Les indicateurs de bien-être sont des pistes à explorer, pas des vérités médicales.',
      },
      cta: {
        title: 'Prêt à voir votre quotidien autrement ?',
        description:
          'Créez votre compte gratuitement et découvrez une nouvelle façon d\'organiser vos journées.',
        primary: 'Commencer gratuitement',
      },
    },
    features: {
      badge: 'Fonctionnalités',
      titleA: 'Tout votre quotidien,',
      titleB: 'au même endroit',
      description:
        'De la planification au bien-être, en passant par l\'intelligence artificielle, chaque module a été pensé pour être simple, clair et agréable à utiliser.',
      navAria: 'Sections fonctionnalités',
      preview: 'Aperçu',
      items: {
        planning: {
          eyebrow: 'Planning',
          title: 'Un planning qui respire',
          description:
            'Tâches, événements et plages de travail sur une timeline claire. Les conflits et les journées surchargées sont signalés avant qu\'ils ne deviennent un problème.',
          points: [
            'Timeline quotidienne et vue semaine',
            'Temps libre calculé automatiquement',
            'Création rapide de tâches et d\'événements',
          ],
        },
        dashboard: {
          eyebrow: 'Dashboard',
          title: '« Comment se passe ma journée ? »',
          description:
            'Un tableau de bord pensé comme une réponse : productivité, agenda, temps libre, sommeil, humeur, stress et tendances de la semaine.',
          points: [
            'Bento-grid responsive et hiérarchisée',
            'Score de productivité quotidienne',
            'Recommandations IA intégrées',
          ],
        },
        wellness: {
          eyebrow: 'Bien-être',
          title: 'Votre équilibre, en douceur',
          description:
            'Sommeil, hydratation, humeur, stress et fatigue suivis au fil des semaines. Chaque résultat est un indicateur, jamais un diagnostic médical.',
          points: [
            'Score de bien-être quotidien',
            'Tendances hebdomadaires visuelles',
            'Recommandations prudentes et expliquées',
          ],
        },
        nutrition: {
          eyebrow: 'Nutrition',
          title: 'Des repas simples à suivre',
          description:
            'Petit-déjeuner, déjeuner, dîner et collations : visualisez vos calories, protéines, glucides et lipides au fil de la journée.',
          points: [
            'Journal des repas par jour',
            'Progression nutritionnelle quotidienne',
            'Tendances hebdomadaires',
          ],
        },
        sport: {
          eyebrow: 'Sport',
          title: 'Votre activité, valorisée',
          description:
            'Séances du jour, durée, intensité, calories et progression vers vos objectifs : restez motivé avec des données qui parlent.',
          points: [
            'Séance du jour mise en avant',
            'Activité et historique hebdomadaires',
            'Progression vers vos objectifs',
          ],
        },
        notifications: {
          eyebrow: 'Notifications',
          title: 'Les bons rappels, au bon moment',
          description:
            'Rappels de tâches, d\'événements, d\'hydratation ou de départ, organisés par catégorie et triables selon leur statut.',
          points: [
            'Catégories claires et filtres',
            'Lecture / non-lu, suppression',
            'Notifications IA personnalisées',
          ],
        },
        ai: {
          eyebrow: 'IA & Assistant',
          title: 'Une intelligence à votre service',
          description:
            'Analyse de votre fatigue, de votre hydratation, de votre charge mentale ou de votre sédentarité. Chaque insight montre son niveau de confiance et ses facteurs.',
          points: [
            'Indicateurs avec niveau de confiance',
            'Facteurs contributifs et explications',
            'Assistant conversationnel intégré',
          ],
        },
      },
      cta: {
        title: 'Toutes ces fonctionnalités, dans un seul espace',
        description:
          'Commencez gratuitement et découvrez une nouvelle façon d\'organiser vos journées.',
        primary: 'Commencer gratuitement',
      },
    },
    contact: {
      badge: 'Contact',
      titleA: 'Parlons de votre',
      titleB: 'quotidien',
      description: 'Une question, une idée, un retour ? L\'équipe Digital Life Twin vous répond.',
      coordinatesTitle: 'Nos coordonnées',
      coordinatesText:
        'Préférez le formulaire pour les questions détaillées. Vous pouvez aussi nous joindre directement.',
      emailLabel: 'E-mail',
      availabilityLabel: 'Disponibilité',
      availabilityValue: 'Lun – Ven, 9 h – 18 h (heure de Paris)',
      teamLabel: 'Équipe',
      teamValue: 'Une équipe passionnée, 100 % à distance',
      responseTime: 'Temps de réponse moyen : moins de 24 h ouvrées.',
      formTitle: 'Envoyez-nous un message',
      formHint: 'Tous les champs sont obligatoires.',
      nameLabel: 'Nom complet',
      namePlaceholder: 'Camille Dubois',
      emailPlaceholder: 'camille@exemple.fr',
      subjectLabel: 'Sujet',
      subjectPlaceholder: 'Choisissez un sujet…',
      messageLabel: 'Message',
      messagePlaceholder: 'Décrivez votre demande…',
      submit: 'Envoyer le message',
      subjects: [
        'Question sur la plateforme',
        'Retour d\'expérience',
        'Signaler un problème',
        'Partenariat',
        'Autre',
      ],
      successTitle: 'Message envoyé !',
      successText:
        'Merci pour votre message. Notre équipe vous répondra dans les plus brefs délais.',
      successAction: 'Envoyer un autre message',
    },
  },
  auth: {
    errors: {
      required: 'Ce champ est obligatoire.',
      invalidEmail: 'Adresse e-mail invalide.',
      min6: 'Au moins 6 caractères.',
      tooShort: 'Trop court.',
      invalid: 'Valeur invalide.',
      passwordMismatch: 'Les mots de passe ne correspondent pas.',
      passwordHint: '8 caractères minimum',
    },
    shell: {
      backHome: 'Retour à l\'accueil',
    },
    brand: {
      badge: 'Digital Life Twin',
      headline: 'Votre jumeau numérique, au service de vos journées',
      description:
        'Digital Life Twin analyse votre planning, vos habitudes et votre bien-être pour mieux organiser chaque journée.',
      stories: [
        {
          title: 'Planification intelligente',
          description:
            'Tâches, événements et plages de travail centralisés sur une seule timeline.',
        },
        {
          title: 'Bien-être suivi',
          description:
            'Sommeil, hydratation, humeur et stress : votre équilibre en un coup d\'œil.',
        },
        {
          title: 'IA personnalisée',
          description: 'Des recommandations claires et expliquées, jamais un diagnostic.',
        },
      ],
      stats: [
        { value: '1', label: 'espace unifié' },
        { value: '13', label: 'modules intégrés' },
        { value: '0', label: 'diagnostic médical' },
      ],
      disclaimer: 'Indicateurs de bien-être — ne remplace pas un avis médical professionnel.',
    },
    social: {
      label: 'ou continuer avec',
      google: 'Google',
      errors: {
        google_popup_closed: 'La connexion Google a été annulée.',
        google_auth_failed: 'La connexion Google a échoué. Réessayez.',
        invalid_google_token: 'Google n’a pas pu être vérifié. Réessayez.',
        account_linking_required:
          'Un compte existe déjà pour cet e-mail. Connectez-vous avec votre mot de passe.',
        google_not_configured: 'La connexion Google n’est pas configurée.',
        google_login_failed: 'La connexion Google a échoué. Réessayez.',
        google_script_failed: 'Impossible de charger Google. Vérifiez votre connexion.',
        google_email_unverified: 'Google n’a pas fourni d’e-mail vérifié.',
      },
    },
    footer: {
      terms: 'Conditions d\'utilisation',
      privacy: 'Politique de confidentialité',
      help: 'Aide',
      copyright: '© {{year}} Digital Life Twin. Tous droits réservés.',
    },
    login: {
      eyebrow: 'Espace membre',
      title: 'Bon retour 👋',
      subtitle: 'Connectez-vous à votre espace Digital Life Twin.',
      demoTitle: 'Compte de démonstration',
      demoDescription: 'Identifiants pré-remplis :',
      demoFill: 'Utiliser la démo',
      emailLabel: 'E-mail',
      emailPlaceholder: 'vous@exemple.fr',
      passwordLabel: 'Mot de passe',
      passwordPlaceholder: 'Votre mot de passe',
      showPassword: 'Afficher le mot de passe',
      hidePassword: 'Masquer le mot de passe',
      rememberMe: 'Se souvenir de moi',
      forgotPassword: 'Mot de passe oublié ?',
      forgotHint:
        'La réinitialisation de mot de passe sera disponible dans une prochaine version.',
      submit: 'Se connecter',
      continue: 'Continuer',
      steps: {
        email: { title: 'Votre e-mail', subtitle: 'Nous demanderons ensuite votre mot de passe.' },
        password: { title: 'Votre mot de passe', subtitle: 'Accédez à votre espace.' },
      },
      noAccount: 'Pas encore de compte ?',
      createAccount: 'Créer un compte',
      error: 'E-mail ou mot de passe incorrect. Vérifiez vos identifiants et réessayez.',
    },
    forgot: {
      eyebrow: 'Compte',
      title: 'Mot de passe oublié ?',
      subtitle: 'Saisissez votre e-mail. Si un compte existe, vous pourrez réinitialiser le mot de passe.',
      submit: 'Envoyer le lien',
      success: 'Si un compte existe pour cet e-mail, un lien de réinitialisation a été envoyé. Consultez votre boîte de réception.',
      continue: 'Choisir un nouveau mot de passe',
      back: 'Retour à la connexion',
      error: 'Impossible de démarrer la réinitialisation. Réessayez.',
    },
    reset: {
      eyebrow: 'Compte',
      title: 'Nouveau mot de passe',
      subtitle: 'Choisissez un mot de passe d’au moins 8 caractères.',
      passwordLabel: 'Nouveau mot de passe',
      passwordPlaceholder: 'Nouveau mot de passe',
      confirmLabel: 'Confirmer le mot de passe',
      missingToken: 'Ce lien de réinitialisation est incomplet. Demandez-en un nouveau depuis la page mot de passe oublié.',
      submit: 'Mettre à jour',
      success: 'Mot de passe mis à jour. Vous pouvez vous connecter.',
      error: 'Ce lien de réinitialisation est invalide ou a expiré.',
    },
    register: {
      eyebrow: 'Nouveau compte',
      title: 'Créer un compte',
      subtitle: 'Gratuit, sans engagement. Quelques secondes suffisent.',
      steps: {
        label: 'Étape',
        of: 'sur',
        identity: { title: 'Identité', subtitle: 'Comment vous appelez-vous ?' },
        account: {
          title: 'Votre compte',
          subtitle: 'Nom, e-mail et mot de passe.',
        },
        verify: {
          title: 'Vérifiez votre e-mail',
          subtitle: 'Saisissez le code à 6 chiffres envoyé par e-mail.',
        },
        security: { title: 'Sécurité', subtitle: 'Choisissez un mot de passe solide' },
        profile: {
          title: 'À propos de vous',
          subtitle: 'Le sexe, la taille et le poids aident à personnaliser vos indicateurs bien-être.',
        },
        terms: {
          title: 'Conditions',
          subtitle: 'Lisez et acceptez nos conditions d\'utilisation',
        },
        personalization: {
          title: 'Personnalisation',
          subtitle: 'Adaptez l\'application à vos objectifs',
        },
        goals: {
          title: 'Vos objectifs',
          subtitle: 'Sommeil, hydratation, activité — et acceptez les conditions.',
        },
      },
      confirm: {
        title: 'Récapitulatif',
        subtitle: 'Vérifiez vos informations avant de créer votre compte.',
        edit: 'Modifier',
      },
      nav: {
        back: 'Retour',
        next: 'Continuer',
      },
      summary: {
        name: 'Nom complet',
        email: 'E-mail',
        password: 'Mot de passe',
        sleep: 'Objectif de sommeil',
        water: 'Objectif d\'hydratation',
        activity: 'Objectif d\'activité',
        dailySummary: 'Résumé quotidien',
        gender: 'Sexe',
        height: 'Taille',
        weight: 'Poids',
      },
      profile: {
        gender: 'Sexe',
        dateOfBirth: 'Date de naissance',
        height: 'Taille (cm)',
        weight: 'Poids (kg)',
        occupation: 'Occupation',
        range: 'Saisissez une valeur réaliste.',
        genderOptions: [
          { value: 'FEMALE', label: 'Femme' },
          { value: 'MALE', label: 'Homme' },
        ],
        occupationOptions: [
          { value: 'STUDENT', label: 'Étudiant' },
          { value: 'EMPLOYEE', label: 'Salarié' },
          { value: 'BOTH', label: 'Étudiant et salarié' },
          { value: 'OTHER', label: 'Autre' },
        ],
      },
      personalization: {
        sleepLabel: 'Objectif de sommeil',
        sleepHint: 'par nuit',
        waterLabel: 'Objectif d\'hydratation',
        waterHint: 'par jour',
        activityLabel: 'Objectif d\'activité',
        activityHint: 'minutes actives par jour',
        summaryLabel: 'Résumé quotidien',
        summaryHint: 'Recevez un résumé de votre journée chaque soir.',
        sleepOptions: [
          { value: '7h', label: '7 h' },
          { value: '7h30', label: '7 h 30' },
          { value: '8h', label: '8 h' },
          { value: '8h30', label: '8 h 30' },
        ],
        waterOptions: [
          { value: '1500', label: '1,5 L' },
          { value: '2000', label: '2 L' },
          { value: '2500', label: '2,5 L' },
          { value: '3000', label: '3 L' },
        ],
        activityOptions: [
          { value: '30', label: '30 min' },
          { value: '45', label: '45 min' },
          { value: '60', label: '60 min' },
        ],
      },
      firstNameLabel: 'Prénom',
      firstNamePlaceholder: 'Sarah',
      lastNameLabel: 'Nom',
      lastNamePlaceholder: 'Martin',
      emailLabel: 'E-mail',
      emailPlaceholder: 'vous@exemple.fr',
      passwordLabel: 'Mot de passe',
      confirmLabel: 'Confirmer le mot de passe',
      codeLabel: 'Code de vérification',
      codePlaceholder: '000000',
      codeHint: 'Consultez votre boîte mail pour un code à 6 chiffres. Il expire dans 10 minutes.',
      resend: 'Renvoyer le code',
      emailTaken: 'Un compte existe déjà pour cet e-mail.',
      codeInvalid: 'Ce code de vérification est invalide ou expiré.',
      mailFailed: 'Impossible d’envoyer l’e-mail de vérification. Réessayez dans un instant.',
      error: 'Impossible de créer le compte. Réessayez.',
      termsAria: 'J\'accepte les conditions d\'utilisation',
      termsPrefix: 'J\'accepte les',
      termsLink: 'conditions d\'utilisation',
      termsAnd: 'et la',
      privacyLink: 'politique de confidentialité',
      termsError: 'Vous devez accepter les conditions pour continuer.',
      submit: 'Créer mon compte',
      haveAccount: 'Déjà un compte ?',
      loginLink: 'Se connecter',
      successTitle: 'Compte créé !',
      successText: 'Bienvenue dans Digital Life Twin, {{name}}. Votre espace est prêt.',
      goDashboard: 'Accéder au tableau de bord',
    },
    onboarding: {
      eyebrow: 'Bienvenue',
      title: 'Complétez votre profil',
      subtitle:
        'Google ne partage que votre nom et votre e-mail. Ajoutez le sexe, la taille, le poids et vos objectifs bien-être pour personnaliser ENTWIN.',
      submit: 'Enregistrer et continuer',
      error: 'Impossible d’enregistrer le profil. Réessayez.',
    },
  },
};
