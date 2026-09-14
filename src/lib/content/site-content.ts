import { SiteContent } from './types';
import { Locale } from '@/types';

export const SITE_CONTENT: Record<Locale, SiteContent> = {
  en: {
    brand: {
      name: 'VIREXON BIOSCIENCES',
      product: 'ZIRON',
      tagline: 'Structured Wellness & Phase-Based Nutritional Routines',
      nonMedicalDisclaimer:
        'ZIRON is a structured dietary wellness program. It is not intended to diagnose, treat, cure, or prevent any disease, psychological condition, or substance use disorder. It is not a substitute for clinical medical care or psychiatric therapy. Always consult a licensed healthcare professional regarding personal health choices.',
      manufacturingNotice: 'Manufacturing and quality documentation will be published as available.',
    },
    nav: {
      product: 'ZIRON',
      program: '90-Day Program',
      science: 'Science',
      quality: 'Quality',
      community: 'Community',
      school: 'School',
      restart: 'Restart',
      faq: 'FAQ',
      verify: 'Verify Product',
      shop: 'Shop',
      about: 'About',
      login: 'Secure Access',
      register: 'Enroll',
      verifyProduct: 'Verify Product Code',
      menu: 'Menu',
      close: 'Close',
      commandCenter: 'Command Center',
      dossier: 'Dossier',
      protocolAndProducts: 'Protocol & Products',
      standardsAndVerification: 'Standards & Verification',
      corporateGovernance: 'Corporate Governance',
      mandatoryDisclosure: 'MANDATORY REGULATORY DISCLOSURE',
      rightsReserved: 'All rights reserved.',
      algeriaMarketTag: 'ALGERIA TARGET MARKET (DZD) • VERIFIED BATCH COMPLIANCE',
    },
    home: {
      heroTag: 'STRUCTURED WELLNESS PROTOCOL',
      heroTitle: 'Phase-Based Daily Routines & Nutritional Consistency.',
      heroSubtitle:
        'A sequential 90-day protocol structured across three designated phases. Combining targeted daily intake habits, educational guidance, and individual product authenticity verification.',
      primaryCta: 'Explore ZIRON',
      secondaryCta: 'Explore the 90-Day Program',
      phasesHeader: 'Three phases. One structured journey.',
      phasesDescription:
        'An organized program framework designed to support habit formation, consistency, and daily routine over 90 days.',
      pillarTitle: 'Core Program Pillars',
      pillar1Title: 'Nutritional Focus',
      pillar1Desc:
        'Targeted compound selection formulated without proprietary ingredient masking or gratuitous filler excipients.',
      pillar2Title: 'Structured Habits',
      pillar2Desc:
        'Sequential 30-day program phases designed to encourage disciplined morning intake habits and regular routine adherence.',
      pillar3Title: 'Serialized Verification',
      pillar3Desc:
        'Unique Product Verification Codes printed on each container to verify product authenticity.',
      verificationSectionTitle: 'Product Authenticity Verification',
      verificationSectionBody:
        'Every individual ZIRON container features a unique product verification code. Verify your container prior to beginning your program.',
    },
    ziron: {
      dossierTag: 'PRODUCT SPECIFICATIONS',
      title: 'ZIRON Product System',
      subtitle:
        'Three sequential 30-day formulation containers designed for each phase of the 90-day program. Each container contains 30 capsules for a structured 30-day program phase.',
      phase1Title: 'Phase 01 — Program Phase',
      phase1Desc:
        'Container 01: 30 capsules / 30-day supply. Designed for the initial 30-day routine period, supporting consistent morning intake.',
      phase2Title: 'Phase 02 — Program Phase',
      phase2Desc:
        'Container 02: 30 capsules / 30-day supply. Designed for days 31 through 60, focusing on routine continuity and hydration habits.',
      phase3Title: 'Phase 03 — Program Phase',
      phase3Desc:
        'Container 03: 30 capsules / 30-day supply. Designed for days 61 through 90, reinforcing long-term lifestyle habits and autonomous consistency.',
      qualityCardTitle: 'Formulation Integrity & Standards',
      qualityCardBody:
        'ZIRON products are produced under disciplined quality oversight. Manufacturing and quality documentation will be published as available.',
    },
    program: {
      timelineTag: 'CHRONOLOGICAL TIMELINE',
      title: 'The 90-Day Program Structure',
      subtitle: 'A structured progression organized into three distinct 30-day phases.',
      tagline: 'Three phases. One structured journey.',
      phase1Title: 'Phase 01 — Program Phase (Days 01–30)',
      phase1Objective:
        'Establishing a structured morning intake routine, daily consistency, and foundational educational habits.',
      phase2Title: 'Phase 02 — Program Phase (Days 31–60)',
      phase2Objective:
        'Reinforcing daily hydration habits, regular physical activity routines, and peer cohort discussions.',
      phase3Title: 'Phase 03 — Program Phase (Days 61–90)',
      phase3Objective:
        'Consolidating autonomous lifestyle routines and maintaining long-term adherence beyond the program.',
    },
    science: {
      dossierTag: 'SCIENTIFIC APPROACH',
      title: 'Science & Formulation Transparency',
      subtitle:
        'We adhere to rigorous ingredient disclosure and honest communication. Evidence documentation will be published as available.',
      pillar1Title: 'Transparent Compound Selection',
      pillar1Body:
        'We prioritize bioavailable compound forms with transparent dosage disclosures, avoiding undisclosed blends.',
      pillar2Title: 'Evidence & References',
      pillar2Body:
        'Scientific references will reflect peer-reviewed literature without exaggerated clinical cure claims.',
      evidenceDisclosure: 'Evidence documentation will be published as available.',
    },
    quality: {
      assuranceTag: 'QUALITY & GOVERNANCE',
      title: 'Quality Standards & Batch Verification',
      subtitle:
        'Comprehensive oversight from ingredient sourcing to serialized packaging verification.',
      standard1Title: 'Manufacturing Standards',
      standard1Body: 'Manufacturing and quality documentation will be published as available.',
      standard2Title: 'Batch Identification',
      standard2Body:
        'Every lot is tracked through internal control protocols to verify ingredient identity and purity.',
      standard3Title: 'Product Authenticity Verification',
      standard3Body:
        'Unique product verification codes allow individuals to verify authentic packaging.',
      sampleNotice: 'SAMPLE / DEMONSTRATION DATA — NOT A PRODUCTION BATCH',
    },
    about: {
      tag: 'CORPORATE OVERVIEW',
      title: 'About VIREXON BIOSCIENCES',
      subtitle: 'Biotechnology principles applied to structured wellness and transparent nutritional design.',
      missionTitle: 'Our Mission',
      missionBody:
        'VIREXON BIOSCIENCES was established to bridge rigorous formulation discipline with practical, phase-structured daily habit protocols.',
      standardsTitle: 'Transparent Standards',
      standardsBody:
        'We believe in absolute label transparency, clear product identification, and honest, non-exaggerated communication.',
      governanceTitle: 'Corporate Governance',
      governanceBody:
        'Headquartered with an international quality focus, VIREXON BIOSCIENCES develops structured health solutions with full ingredient accountability.',
    },
    restart: {
      tag: 'PROTOCOL GUIDANCE',
      title: 'Program Restart Guide',
      subtitle: 'Clear protocols for resuming or resetting your 90-day trajectory.',
      protocolNotice:
        'If your routine has been interrupted, you can re-initiate your 90-day trajectory starting with Phase 01.',
      step1Title: 'Step 1: Assess Program Break',
      step1Body: 'Determine whether you experienced a minor pause or an extended routine disruption.',
      step2Title: 'Step 2: Obtain Fresh Phase Container',
      step2Body: 'Subjects restarting the protocol should re-engage with a fresh 30-capsule Phase 01 container.',
      step3Title: 'Step 3: Re-align Daily Timing',
      step3Body: 'Reset your morning intake schedule and log your daily progress in the companion dashboard.',
    },
    faq: {
      tag: 'KNOWLEDGE BASE',
      title: 'Frequently Asked Questions',
      subtitle: 'Essential answers regarding the ZIRON product line and 90-day program.',
      items: [
        {
          question: 'What is the capsule count per phase container?',
          answer:
            'Each phase container (Phase 01, Phase 02, and Phase 03) contains exactly 30 capsules, representing a 30-day supply. The complete bundle contains 90 capsules total (3 x 30 capsules).',
        },
        {
          question: 'Is ZIRON a medical treatment or pharmaceutical drug?',
          answer:
            'No. ZIRON is a structured dietary and lifestyle wellness protocol. It is not intended to treat, cure, or prevent any disease, addiction, or psychiatric condition. Consult a licensed physician for medical needs.',
        },
        {
          question: 'How do I verify the authenticity of my product?',
          answer:
            'Locate the Unique Product Verification Code printed on your packaging and enter it into the Product Authenticity Verification page.',
        },
        {
          question: 'What is the pricing currency?',
          answer:
            'For the initial Algeria market, pricing will be established in Algerian Dinars (DZD). Official retail prices will be configured and published prior to market distribution.',
        },
      ],
    },
    verify: {
      badge: 'PRODUCT AUTHENTICITY VERIFICATION',
      title: 'Verify Your ZIRON Product',
      subtitle:
        'Inspect your container verification code to confirm product authenticity.',
      inputLabel: 'Unique Product Verification Code',
      inputPlaceholder: 'ZR-XXXX-XXXX-XXXX',
      verifyButton: 'Verify Authenticity',
      scanQrButton: 'Scan QR Code',
      backendIntegrationNotice:
        'NOTICE: Production verification requires backend integration. The verification interface is prepared for the upcoming Firebase verification system.',
      securityNote:
        'Serialized Product Identifier ensures genuine container verification. Do not consume products with missing or defaced verification codes.',
    },
    shop: {
      tag: 'CATALOG & ORDERING',
      title: 'ZIRON Product Catalog',
      subtitle:
        'Acquire individual phase containers or the complete 90-Day Program Bundle. Pricing configured for the Algeria launch market (DZD).',
      bundleTitle: 'ZIRON 90-Day Complete Program Bundle',
      bundleSubtitle: 'Complete 3-phase kit containing all three 30-capsule containers.',
      bundleSpecs: '3 containers × 30 capsules = 90 capsules total (90-day supply)',
      addToCart: 'Select Container',
      orderBundle: 'Select Complete Bundle',
      individualTitle: 'Individual Program Phase Containers',
    },
    school: {
      heroBadge: 'CONTINUOUS MASTERY & CURRICULA',
      heroTitle: 'The ZIRON School of Biopharma & Applied Mastery',
      heroSubtitle:
        'A dynamic educational ecosystem bridging human biology, metabolic optimization, precision agriculture, digital literacy, and high-impact enterprise execution.',
      enterPortalBtn: 'Enter School Portal',
      enrollBtn: 'Enroll to Unlock Curricula',
      verifyCodeBtn: 'Verify Container Code',
      tracksAvailable: 'Curriculum Tracks Available',
      trackNumber: 'Track',
      qualificationNotice: 'Restart School requires 3 activated product containers.',
    },
    community: {
      heroBadge: 'SUBJECT COLLABORATION NETWORK',
      heroTitle: 'The ZIRON Verified Community',
      heroSubtitle:
        'A private, moderated forum connecting participants traversing the 90-day biological trajectory.',
      enterCommunityBtn: 'Enter Community',
      enrollBtn: 'Enroll for Access',
      verifyCodeBtn: 'Verify Container Code',
      shieldTitle: 'Verified Physical Ownership',
      shieldDesc:
        'Entry requires serial verification from a genuine ZIRON 30-capsule phase container, ensuring discussions remain evidence-based and authentic.',
      cohortTitle: 'Phase-Cohort Synchrony',
      cohortDesc:
        'Connect with subjects currently in Phase 01, Phase 02, or Phase 03 to compare trajectories.',
      moderationTitle: 'Scientific Oversight',
      moderationDesc:
        'Dedicated bio-scientific moderators ensure peer interactions remain constructive, safe, and aligned with evidence standards.',
    },
    footer: {
      description:
        'VIREXON BIOSCIENCES develops structured phase-based wellness protocols and verified product standards.',
      mandatoryHealthNotice:
        'HEALTH DISCLAIMER: ZIRON is a dietary wellness program and does not substitute for professional medical advice, clinical diagnosis, or psychological care. Always consult a qualified healthcare provider.',
      copyrightNotice: 'VIREXON BIOSCIENCES. All rights reserved.',
      securityTag: 'SERIALIZED PRODUCT IDENTIFIER SYSTEM',
    },
  },
  fr: {
    brand: {
      name: 'VIREXON BIOSCIENCES',
      product: 'ZIRON',
      tagline: 'Bien-être Structuré et Routines Nutritionnelles par Phases',
      nonMedicalDisclaimer:
        "ZIRON est un programme de bien-être nutritionnel structuré. Il n'est pas destiné à diagnostiquer, traiter, guérir ou prévenir une maladie, un trouble psychologique ou une dépendance. Il ne remplace pas une prise en charge médicale ou psychiatrique. Consultez toujours un professionnel de santé agréé.",
      manufacturingNotice: 'Les documents de fabrication et de qualité seront publiés dès leur disponibilité.',
    },
    nav: {
      product: 'ZIRON',
      program: 'Programme 90 Jours',
      science: 'Science',
      quality: 'Qualité',
      community: 'Communauté',
      school: 'École',
      restart: 'Restart',
      faq: 'FAQ',
      verify: 'Vérifier Produit',
      shop: 'Boutique',
      about: 'À propos',
      login: 'Connexion',
      register: 'Inscription',
      verifyProduct: 'Vérifier Code Produit',
      menu: 'Menu',
      close: 'Fermer',
      commandCenter: 'Centre de Contrôle',
      dossier: 'Dossier',
      protocolAndProducts: 'Protocole & Produits',
      standardsAndVerification: 'Normes & Vérification',
      corporateGovernance: "Gouvernance d'Entreprise",
      mandatoryDisclosure: 'DIVULGATION RÉGLEMENTAIRE OBLIGATOIRE',
      rightsReserved: 'Tous droits réservés.',
      algeriaMarketTag: 'MARCHÉ CIBLE ALGÉRIE (DZD) • CONFORMITÉ DES LOTS VÉRIFIÉE',
    },
    home: {
      heroTag: 'PROTOCOLE DE BIEN-ÊTRE STRUCTURÉ',
      heroTitle: 'Routines Quotidiennes par Phases et Régularité Nutritionnelle.',
      heroSubtitle:
        "Un protocole séquentiel de 90 jours articulé autour de trois phases déterminées. Associant habitudes de prise régulières, accompagnement pédagogique et vérification de l'authenticité.",
      primaryCta: 'Découvrir ZIRON',
      secondaryCta: 'Explorer le Programme 90 Jours',
      phasesHeader: 'Trois phases. Un parcours structuré.',
      phasesDescription:
        'Un cadre structuré conçu pour consolider la régularité, les habitudes et la routine quotidienne sur 90 jours.',
      pillarTitle: 'Piliers Fondamentaux du Programme',
      pillar1Title: 'Précision Nutritionnelle',
      pillar1Desc:
        'Sélection rigoureuse des composés sans formules exclusives dissimulées ni excipients superflus.',
      pillar2Title: 'Habitudes Structurées',
      pillar2Desc:
        'Phases séquentielles de 30 jours pour encourager des habitudes de prise matinale disciplinées.',
      pillar3Title: 'Vérification Sérialisée',
      pillar3Desc:
        'Codes uniques de vérification imprimés sur chaque boîte pour confirmer l’authenticité du produit.',
      verificationSectionTitle: 'Vérification de l’Authenticité du Produit',
      verificationSectionBody:
        'Chaque contenant ZIRON dispose d’un code de vérification unique. Vérifiez votre contenant avant d’entamer votre programme.',
    },
    ziron: {
      dossierTag: 'SPÉCIFICATIONS DU PRODUIT',
      title: 'Système Produit ZIRON',
      subtitle:
        'Trois contenants séquentiels de 30 jours conçus pour chaque phase du programme. Chaque boîte comprend 30 gélules pour une phase structurée de 30 jours.',
      phase1Title: 'Phase 01 — Phase du Programme',
      phase1Desc:
        'Contenant 01 : 30 gélules / approvisionnement de 30 jours. Conçu pour la phase initiale et l’instauration d’un horaire matinal régulier.',
      phase2Title: 'Phase 02 — Phase du Programme',
      phase2Desc:
        'Contenant 02 : 30 gélules / approvisionnement de 30 jours. Conçu pour les jours 31 à 60, axé sur la continuité de la routine et l’hydratation.',
      phase3Title: 'Phase 03 — Phase du Programme',
      phase3Desc:
        'Contenant 03 : 30 gélules / approvisionnement de 30 jours. Conçu pour les jours 61 à 90, consolidant l’autonomie d’hygiène de vie durable.',
      qualityCardTitle: 'Intégrité de Formulation & Standards',
      qualityCardBody:
        'Les produits ZIRON sont élaborés selon des règles rigoureuses de contrôle qualité. Les documents de fabrication et de qualité seront publiés dès leur disponibilité.',
    },
    program: {
      timelineTag: 'CALENDRIER CHRONOLOGIQUE',
      title: 'Structure du Programme 90 Jours',
      subtitle: 'Une progression structurée en trois phases distinctes de 30 jours.',
      tagline: 'Trois phases. Un parcours structuré.',
      phase1Title: 'Phase 01 — Phase du Programme (Jours 01–30)',
      phase1Objective:
        'Mise en place d’une routine matinale, régularité quotidienne et suivi des premiers modules pédagogiques.',
      phase2Title: 'Phase 02 — Phase du Programme (Jours 31–60)',
      phase2Objective:
        'Hydratation régulière, activité physique modérée et échanges constructifs au sein de la communauté.',
      phase3Title: 'Phase 03 — Phase du Programme (Jours 61–90)',
      phase3Objective:
        'Consolidation de l’autonomie d’hygiène de vie et maintien des habitudes bien après la fin du programme.',
    },
    science: {
      dossierTag: 'DÉMARCHE SCIENTIFIQUE',
      title: 'Science & Transparence de Formulation',
      subtitle:
        'Nous appliquons une transparence rigoureuse sur nos ingrédients. Les documents scientifiques justificatifs seront publiés dès leur disponibilité.',
      pillar1Title: 'Sélection Transparente des Composés',
      pillar1Body:
        'Nous privilégions des formes biodisponibles avec affichage quantitatif précis, sans mélanges propriétaires opaques.',
      pillar2Title: 'Preuves & Références',
      pillar2Body:
        'Les références scientifiques s’appuieront sur la littérature évaluée par les pairs, sans allégation thérapeutique excessive.',
      evidenceDisclosure: 'Les documents de preuve seront publiés dès leur disponibilité.',
    },
    quality: {
      assuranceTag: 'QUALITÉ & GOUVERNANCE',
      title: 'Normes de Qualité & Vérification par Lot',
      subtitle:
        'Surveillance méthodique, de l’approvisionnement des ingrédients à la sérialisation des contenants.',
      standard1Title: 'Normes de Fabrication',
      standard1Body: 'Les documents de fabrication et de qualité seront publiés dès leur disponibilité.',
      standard2Title: 'Identification des Lots',
      standard2Body:
        'Chaque lot fait l’objet de contrôles internes pour vérifier son identité et sa pureté.',
      standard3Title: 'Vérification de l’Authenticité',
      standard3Body:
        'Des codes uniques de vérification permettent aux utilisateurs de vérifier l’authenticité de leur emballage.',
      sampleNotice: 'DONNÉES D’EXEMPLE / DÉMONSTRATION — CECI N’EST PAS UN LOT DE PRODUCTION',
    },
    about: {
      tag: 'PRÉSENTATION DE L’ENTREPRISE',
      title: 'À propos de VIREXON BIOSCIENCES',
      subtitle: 'Principes de biotechnologie appliqués au bien-être structuré et à la clarté nutritionnelle.',
      missionTitle: 'Notre Mission',
      missionBody:
        'VIREXON BIOSCIENCES concilie rigueur de formulation et protocoles d’habitudes quotidiennes structurés en phases.',
      standardsTitle: 'Standards de Transparence',
      standardsBody:
        'Nous privilégions la clarté totale de l’étiquetage, l’identification unitaire et une communication mesurée.',
      governanceTitle: 'Gouvernance d’Entreprise',
      governanceBody:
        'Engagée dans une démarche qualité internationale, VIREXON BIOSCIENCES développe des solutions de santé avec une traçabilité complète.',
    },
    restart: {
      tag: 'GUIDE DU PROTOCOLE',
      title: 'Guide de Recommencement du Programme',
      subtitle: 'Protocoles clairs pour reprendre ou réinitialiser votre parcours de 90 jours.',
      protocolNotice:
        'Si votre routine a été interrompue, vous pouvez réinitialiser votre parcours de 90 jours à partir de la Phase 01.',
      step1Title: 'Étape 1 : Évaluer l’Interruption',
      step1Body: 'Identifiez s’il s’agit d’une brève pause ou d’une rupture prolongée de routine.',
      step2Title: 'Étape 2 : Obtenir un Nouveau Contenant',
      step2Body: 'Les participants recommençant le protocole doivent reprendre avec un nouveau contenant Phase 01 de 30 gélules.',
      step3Title: 'Étape 3 : Réajuster l’Horaire Quotidien',
      step3Body: 'Reprenez votre horaire matinal de prise et notez votre progression quotidienne.',
    },
    faq: {
      tag: 'BASE DE CONNAISSANCES',
      title: 'Foire Aux Questions',
      subtitle: 'Réponses essentielles sur la gamme ZIRON et le programme 90 jours.',
      items: [
        {
          question: 'Combien de gélules contient chaque boîte ?',
          answer:
            'Chaque boîte (Phase 01, Phase 02, et Phase 03) contient exactement 30 gélules pour 30 jours de programme. Le pack complet comprend 90 gélules au total (3 x 30 gélules).',
        },
        {
          question: 'ZIRON est-il un médicament ou un traitement médical ?',
          answer:
            'Non. ZIRON est un programme nutritionnel et d’hygiène de vie, et non un médicament ou un traitement clinique. Consultez un médecin pour tout problème de santé.',
        },
        {
          question: 'Comment vérifier l’authenticité de mon produit ?',
          answer:
            'Repérez le Code Unique de Vérification imprimé sur votre emballage et saisissez-le sur la page de vérification.',
        },
        {
          question: 'Quelle est la devise tarifaire ?',
          answer:
            'Pour le marché de lancement en Algérie, les tarifs seront configurés en Dinars Algériens (DZD). Les prix officiels seront publiés avant la distribution commerciale.',
        },
      ],
    },
    verify: {
      badge: 'VÉRIFICATION DE L’AUTHENTICITÉ DU PRODUIT',
      title: 'Vérifiez Votre Produit ZIRON',
      subtitle:
        'Vérifiez le code figurant sur votre contenant pour confirmer son authenticité.',
      inputLabel: 'Code Unique de Vérification du Produit',
      inputPlaceholder: 'ZR-XXXX-XXXX-XXXX',
      verifyButton: 'Vérifier l’Authenticité',
      scanQrButton: 'Scanner le Code QR',
      backendIntegrationNotice:
        'AVIS : La vérification en production nécessite l’intégration du serveur principal. L’interface est préparée pour le système de vérification Firebase à venir.',
      securityNote:
        'L’identifiant de produit sérialisé garantit une vérification unitaire du contenant. N’ingérez pas de produit dont le code est effacé ou altéré.',
    },
    shop: {
      tag: 'CATALOGUE & COMMANDES',
      title: 'Catalogue des Produits ZIRON',
      subtitle:
        'Commandez les contenants individuels par phase ou le pack complet du programme 90 jours. Tarification configurée pour l’Algérie (DZD).',
      bundleTitle: 'Pack Complet Programme 90 Jours ZIRON',
      bundleSubtitle: 'Kit complet en 3 phases comprenant les trois boîtes de 30 gélules.',
      bundleSpecs: '3 boîtes × 30 gélules = 90 gélules au total (approvisionnement de 90 jours)',
      addToCart: 'Sélectionner la Boîte',
      orderBundle: 'Sélectionner le Pack Complet',
      individualTitle: 'Contenants Individuels par Phase du Programme',
    },
    school: {
      heroBadge: 'MAÎTRISE CONTINUE & CURRICULUMS',
      heroTitle: 'L’École ZIRON de Biopharmacie et Maîtrise Appliquée',
      heroSubtitle:
        'Un écosystème pédagogique reliant biologie humaine, optimisation métabolique, agriculture de précision et compétences d’entreprise.',
      enterPortalBtn: 'Accéder au Portail Scolaire',
      enrollBtn: 'S’inscrire pour débloquer les cursus',
      verifyCodeBtn: 'Vérifier le Code Produit',
      tracksAvailable: 'Filières Disponibles',
      trackNumber: 'Filière',
      qualificationNotice: 'Restart School exige l’activation de 3 contenants de produits différents.',
    },
    community: {
      heroBadge: 'RÉSEAU D’ÉCHANGE DES PARTICIPANTS',
      heroTitle: 'La Communauté Vérifiée ZIRON',
      heroSubtitle:
        'Un forum privé et modéré reliant les participants engagés dans la trajectoire de 90 jours.',
      enterCommunityBtn: 'Accéder à la Communauté',
      enrollBtn: 'S’inscrire pour Accéder',
      verifyCodeBtn: 'Vérifier le Code Produit',
      shieldTitle: 'Propriété Physique Vérifiée',
      shieldDesc:
        'L’accès requiert la vérification du numéro de série d’un contenant authentique ZIRON de 30 gélules.',
      cohortTitle: 'Cohorte Synchronisée par Phase',
      cohortDesc:
        'Échangez avec des participants se trouvant dans la même phase de progression.',
      moderationTitle: 'Supervision Scientifique',
      moderationDesc:
        'Une modération dédiée veille à ce que les échanges demeurent rigoureux et bienveillants.',
    },
    footer: {
      description:
        'VIREXON BIOSCIENCES conçoit des protocoles de bien-être par phases et des standards de produits vérifiables.',
      mandatoryHealthNotice:
        'AVIS SANTÉ : ZIRON est un programme de bien-être nutritionnel et ne remplace ni un avis médical ni un suivi psychiatrique. Consultez toujours un professionnel de santé agréé.',
      copyrightNotice: 'VIREXON BIOSCIENCES. Tous droits réservés.',
      securityTag: 'SYSTÈME D’IDENTIFIANT SÉRIALISÉ DU PRODUIT',
    },
  },
  ar: {
    brand: {
      name: 'VIREXON BIOSCIENCES',
      product: 'ZIRON',
      tagline: 'عافية هيكلية وروتين غذائي موجه بالمراحل',
      nonMedicalDisclaimer:
        'ZIRON هو برنامج عافية غذائي منظم. وليس مخصصًا لتشخيص أي مرض أو اضطراب نفسي أو إدماني أو علاجه أو الوقاية منه. ولا يُعد بديلاً عن الرعاية الطبية السريرية أو العلاج النفسي. استشر دائمًا طبيبًا أو ممارسًا صحيًا مرخصًا بشأن خياراتك الصحية.',
      manufacturingNotice: 'سيتم نشر وثائق التصنيع والجودة فور توفرها واعتمادها.',
    },
    nav: {
      product: 'ZIRON',
      program: 'برنامج 90 يومًا',
      science: 'الأساس العلمي',
      quality: 'الجودة',
      community: 'المجتمع',
      school: 'المدرسة',
      restart: 'Restart',
      faq: 'الأسئلة الشائعة',
      verify: 'فحص المنتج',
      shop: 'المتجر',
      about: 'عن الشركة',
      login: 'دخول آمن',
      register: 'انضمام',
      verifyProduct: 'التحقق من رمز المنتج',
      menu: 'القائمة',
      close: 'إغلاق',
      commandCenter: 'مركز التحكم',
      dossier: 'الملف',
      protocolAndProducts: 'البروتوكول والمنتجات',
      standardsAndVerification: 'المعايير والتحقق',
      corporateGovernance: 'حوكمة الشركة',
      mandatoryDisclosure: 'إشعار تنظيمي إلزامي',
      rightsReserved: 'جميع الحقوق محفوظة.',
      algeriaMarketTag: 'سوق الجزائر المستهدف (د.ج) • مطابقة تشغيلية موثقة',
    },
    home: {
      heroTag: 'بروتوكول عافية منظم',
      heroTitle: 'روتين يومي بالمراحل وانتظام غذائي مدروس.',
      heroSubtitle:
        'بروتوكول تتابعي مدته 90 يومًا منظم عبر ثلاث مراحل محددة. يجمع بين عادات التناول اليومية المنتظمة، والتوجيه التعليمي، والتحقق من أصالة كل عبوة.',
      primaryCta: 'استكشف ZIRON',
      secondaryCta: 'استكشف برنامج الـ 90 يومًا',
      phasesHeader: 'ثلاث مراحل. رحلة واحدة.',
      phasesDescription:
        'إطار عمل برنامجي منظم صُمم لترسيخ الالتزام وبناء عادات يومية منتظمة على مدار 90 يومًا.',
      pillarTitle: 'الركائز الأساسية للبرنامج',
      pillar1Title: 'التركيز التغذوي',
      pillar1Desc:
        'انتقاء دقيق للمركبات دون خلطات سرية غير معلنة أو حشوات صناعية غير ضرورية.',
      pillar2Title: 'عادات منظمة',
      pillar2Desc:
        'مراحل متسلسلة مدة كل منها 30 يومًا لتشجيع عادات التناول الصباحي المنضبط والالتزام اليومي.',
      pillar3Title: 'تحقق تسلسلي',
      pillar3Desc:
        'رموز تحقق فريدة مطبوعة على كل عبوة لتأكيد أصالة المنتج وسلامته.',
      verificationSectionTitle: 'التحقق من أصالة المنتج',
      verificationSectionBody:
        'تحمل كل عبوة من عبوات ZIRON رمز تحقق فريدًا من نوعه. يرجى التحقق من عبوتك قبل بدء البرنامج.',
    },
    ziron: {
      dossierTag: 'مواصفات المنتج',
      title: 'نظام منتج ZIRON',
      subtitle:
        'ثلاث عبوات متسلسلة لـ 30 يومًا لكل مرحلة من مراحل البرنامج. تحتوي كل عبوة على 30 كبسولة تكفي لمرحلة برنامج مدتها 30 يومًا.',
      phase1Title: 'المرحلة الأولى — مرحلة البرنامج',
      phase1Desc:
        'العبوة 01: 30 كبسولة / إمداد لـ 30 يومًا. صُممت للفترة الأولى من الروتين ولدعم الانتظام الصباحي.',
      phase2Title: 'المرحلة الثانية — مرحلة البرنامج',
      phase2Desc:
        'العبوة 02: 30 كبسولة / إمداد لـ 30 يومًا. مخصصة للأيام من 31 إلى 60 مع التركيز على استمرارية العادات والترطيب اليومي.',
      phase3Title: 'المرحلة الثالثة — مرحلة البرنامج',
      phase3Desc:
        'العبوة 03: 30 كبسولة / إمداد لـ 30 يومًا. مخصصة للأيام من 61 إلى 90 لتعزيز الاستقلالية واستدامة نمط الحياة الصحي.',
      qualityCardTitle: 'نزاهة التركيبة ومعايير الجودة',
      qualityCardBody:
        'يتم إنتاج منتجات ZIRON وفق معايير صارمة لمراقبة الجودة. سيتم نشر وثائق التصنيع والجودة فور توفرها واعتمادها.',
    },
    program: {
      timelineTag: 'المخطط الزمني التتابعي',
      title: 'هيكل برنامج الـ 90 يومًا',
      subtitle: 'تدرج برنامجي منظم عبر ثلاث مراحل مميزة مدة كل منها 30 يومًا.',
      tagline: 'ثلاث مراحل. رحلة واحدة.',
      phase1Title: 'المرحلة الأولى — مرحلة البرنامج (الأيام 01–30)',
      phase1Objective:
        'تأسيس روتين صباحي منضبط، واستمرارية يومية، والتفاعل مع الوحدات التعليمية الأساسية.',
      phase2Title: 'المرحلة الثانية — مرحلة البرنامج (الأيام 31–60)',
      phase2Objective:
        'تعزيز الترطيب اليومي، وتنظيم النشاط البدني المعتدل، والتفاعل مع مجتمع المشاركين.',
      phase3Title: 'المرحلة الثالثة — مرحلة البرنامج (الأيام 61–90)',
      phase3Objective:
        'ترسيخ استقلالية العادات اليومية وضمان استدامتها على المدى الطويل بعد انتهاء البرنامج.',
    },
    science: {
      dossierTag: 'المنهج العلمي',
      title: 'الأساس العلمي وشفافية التركيب',
      subtitle:
        'نلتزم بالإفصاح الكامل عن المكونات والتواصل المسؤول دون ادعاءات غير مدعومة. سيتم نشر وثائق الأدلة العلمية فور توفرها.',
      pillar1Title: 'اختيار شفاف للمركبات',
      pillar1Body:
        'نحرص على انتقاء مركبات ذات توافر حيوي ملائم مع إفصاح كمي دقيق دون خلطات سرية.',
      pillar2Title: 'الأدلة والمراجع',
      pillar2Body:
        'تستند المراجع إلى الأبحاث المحكمة دون ادعاءات شمولية أو وعود علاجية مبالغ فيها.',
      evidenceDisclosure: 'سيتم نشر وثائق الأدلة العلمية فور توفرها.',
    },
    quality: {
      assuranceTag: 'الجودة والحوكمة',
      title: 'معايير الجودة والتحقق من الدفعات',
      subtitle:
        'رقابة دقيقة وشاملة من توريد المواد الأولية حتى التحقق التسلسلي من كل عبوة.',
      standard1Title: 'معايير التصنيع',
      standard1Body: 'سيتم نشر وثائق التصنيع والجودة فور توفرها واعتمادها.',
      standard2Title: 'تحديد الدفعات',
      standard2Body:
        'تخضع كل دفعة لبروتوكولات فحص داخلية للتحقق من الهوية والنقاء.',
      standard3Title: 'التحقق من أصالة المنتج',
      standard3Body:
        'يتيح رمز التحقق التسلسلي للمستخدمين التأكد من أصالة العبوة وسلامتها.',
      sampleNotice: 'بيانات تجريبية / للعرض التوضيحي فقط — ليست دفعة إنتاجية فعلية',
    },
    about: {
      tag: 'نظرة عامة على الشركة',
      title: 'عن VIREXON BIOSCIENCES',
      subtitle: 'مبادئ التكنولوجيا الحيوية المطبقة على العافية المنظمة والوضوح التغذوي.',
      missionTitle: 'رسالتنا',
      missionBody:
        'تأسست VIREXON BIOSCIENCES للمواءمة بين انضباط التركيبات وبروتوكولات العادات اليومية المنظمة بالمراحل.',
      standardsTitle: 'معايير الشفافية',
      standardsBody:
        'نؤمن بالشفافية الكاملة في البيانات الملصقة، والتعريف التسلسلي الموثوق للمنتجات، والتواصل الصادق غير المبالغ فيه.',
      governanceTitle: 'الحوكمة المؤسسية',
      governanceBody:
        'تطور VIREXON BIOSCIENCES حلولاً صحية عالية الجودة مع إمكانية التتبع والمسؤولية الكاملة عن المكونات.',
    },
    restart: {
      tag: 'إرشادات البروتوكول',
      title: 'دليل إعادة بدء البرنامج',
      subtitle: 'بروتوكولات واضحة لاستئناف مسارك في برنامج الـ 90 يومًا أو إعادة ضبطه.',
      protocolNotice:
        'إذا انقطع روتينك اليومي، يمكنك إعادة بدء مسار الـ 90 يومًا مجددًا ابتداءً من المرحلة الأولى.',
      step1Title: 'الخطوة 1: تقييم فترة الانقطاع',
      step1Body: 'حدد ما إذا كان التوقف قصيرًا أم انقطاعًا ممتدًا يتطلب إعادة البدء.',
      step2Title: 'الخطوة 2: الحصول على عبوة مرحلية جديدة',
      step2Body: 'يُنصح المشاركون الذين يعيدون بدء البروتوكول باقتناء عبوة جديدة للمرحلة 01 تحوي 30 كبسولة.',
      step3Title: 'الخطوة 3: إعادة ضبط التوقيت اليومي',
      step3Body: 'أعد ضبط جدول التناول الصباحي وسجل التزامك اليومي في لوحة المتابعة.',
    },
    faq: {
      tag: 'قاعدة المعرفة',
      title: 'الأسئلة الشائعة',
      subtitle: 'إجابات أساسية حول منتجات ZIRON وبرنامج الـ 90 يومًا.',
      items: [
        {
          question: 'كم عدد الكبسولات في كل عبوة مرحلية؟',
          answer:
            'تحتوي كل عبوة مرحلية (المرحلة 01، المرحلة 02، والمرحلة 03) على 30 كبسولة بالضبط تكفي لـ 30 يومًا. وتحتوي حزمة البرنامج الكاملة على 90 كبسولة إجمالاً (3 × 30 كبسولة).',
        },
        {
          question: 'هل ZIRON علاج طبي أو دواء صيدلاني؟',
          answer:
            'كلا. ZIRON برنامج عافية ونمط حياة صحي منظم، وليس دواءً صيدلانيًا أو علاجًا سريريًا. يُرجى استشارة طبيب مرخص بشأن أي احتياجات صحية.',
        },
        {
          question: 'كيف أتحقق من أصالة عبوة المنتج؟',
          answer:
            'اعثر على رمز التحقق الفريد المطبوع على عبوتك وأدخله في صفحة التحقق من أصالة المنتج.',
        },
        {
          question: 'ما هي العملة المعتمدة لتسعير المنتجات؟',
          answer:
            'بالنسبة لسوق الإطلاق الأول في الجزائر، سيتم تحديد الأسعار بالدينار الجزائري (DZD). وسيتم نشر الأسعار الرسمية فور اعتمادها قبل التوزيع التجاري.',
        },
      ],
    },
    verify: {
      badge: 'التحقق من أصالة المنتج',
      title: 'تحقق من منتج ZIRON',
      subtitle:
        'افحص رمز التحقق الموجود على عبوتك للتأكد من أصالة المنتج.',
      inputLabel: 'رمز التحقق الفريد للمنتج',
      inputPlaceholder: 'ZR-XXXX-XXXX-XXXX',
      verifyButton: 'التحقق من الأصالة',
      scanQrButton: 'مسح الرمز البصري QR',
      backendIntegrationNotice:
        'تنبيه: يتطلب التحقق الفعلي اكتمال الربط بالخادم الخلفي. يجري إعداد واجهة التحقق للربط مع نظام فايربيس القادم.',
      securityNote:
        'يضمن معرف المنتج التسلسلي التحقق الفردي من كل عبوة. لا تستخدم منتجات تحمل رموزًا تالفة أو غير واضحة.',
    },
    shop: {
      tag: 'الكتالوج والطلبات',
      title: 'كتالوج منتجات ZIRON',
      subtitle:
        'اطلب عبوات المراحل الفردية أو حزمة برنامج الـ 90 يومًا الكاملة. التسعير مهيأ لسوق الإطلاق في الجزائر (DZD).',
      bundleTitle: 'حزمة برنامج الـ 90 يومًا الكاملة من ZIRON',
      bundleSubtitle: 'طقم كامل في ثلاث مراحل يضم العبوات الثلاث التي تحوي 30 كبسولة لكل منها.',
      bundleSpecs: '3 عبوات × 30 كبسولة = 90 كبسولة إجمالاً (إمداد لـ 90 يومًا)',
      addToCart: 'اختيار العبوة',
      orderBundle: 'اختيار الحزمة الكاملة',
      individualTitle: 'عبوات مراحل البرنامج الفردية',
    },
    school: {
      heroBadge: 'التعلم المستمر والمناهج التطبيقية',
      heroTitle: 'مدرسة ZIRON للعلوم الحيوية والتمكن التطبيقي',
      heroSubtitle:
        'منظومة تعليمية متكاملة تربط بين البيولوجيا البشرية، والتغذية الحيوية، والزراعة الدقيقة، ومحو الأمية الرقمية، وبناء المشاريع ذات الأثر.',
      enterPortalBtn: 'دخول بوابة المدرسة',
      enrollBtn: 'الانضمام لفتح المناهج',
      verifyCodeBtn: 'التحقق من رمز العبوة',
      tracksAvailable: 'مسارات تعليمية متاحة',
      trackNumber: 'المسار',
      qualificationNotice: 'تتطلب مدرسة Restart تفعيل 3 عبوات منتجات مختلفة.',
    },
    community: {
      heroBadge: 'شبكة تواصل المشاركين',
      heroTitle: 'مجتمع ZIRON المعتمد',
      heroSubtitle:
        'منتدى خاص ومراقب يجمع المشاركين خلال مسار الـ 90 يومًا لتبادل الخبرات وتنسيق البروتوكول.',
      enterCommunityBtn: 'دخول المجتمع',
      enrollBtn: 'الانضمام للحصول على الوصول',
      verifyCodeBtn: 'التحقق من رمز العبوة',
      shieldTitle: 'ملكية موثقة للمنتج',
      shieldDesc:
        'يتطلب الدخول التحقق التسلسلي من عبوة حقيقية تحوي 30 كبسولة من ZIRON لضمان مصداقية المشاركات وواقعيتها.',
      cohortTitle: 'توافق المراحل التتابعية',
      cohortDesc:
        'تواصل مع مشاركين يمرون حاليًا بنفس مرحلتك (المرحلة 01، المرحلة 02، أو المرحلة 03) لمقارنة النتائج.',
      moderationTitle: 'إشراف علمي متخصص',
      moderationDesc:
        'يشرف خبراء ومختصون على سلامة المعلومات وضمان التزام النقاشات بالمعايير العلمية السليمة.',
    },
    footer: {
      description:
        'تطور VIREXON BIOSCIENCES بروتوكولات عافية بالمراحل ومعايير منتجات موثقة.',
      mandatoryHealthNotice:
        'إخلاء مسؤولية صحي: ZIRON هو برنامج عافية غذائي ولا يغني عن الاستشارة الطبية المتخصصة أو التشخيص السريري أو الرعاية النفسية. استشر دائمًا ممارسًا صحيًا مرخصًا.',
      copyrightNotice: 'VIREXON BIOSCIENCES. جميع الحقوق محفوظة.',
      securityTag: 'نظام معرف المنتج التسلسلي',
    },
  },
};

export function getSiteContent(locale: Locale): SiteContent {
  return SITE_CONTENT[locale] || SITE_CONTENT.en;
}
