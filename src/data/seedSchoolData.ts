import { SchoolCourse, SchoolModule, SchoolLesson } from '@/types/models';

export const SEED_COURSES: SchoolCourse[] = [
  {
    id: 'seed-course-precision-ag',
    categoryId: 'seed-agriculture',
    slug: 'precision-cultivation-bio-systems',
    title: {
      en: 'Precision Cultivation & Regenerative Bio-Systems',
      fr: 'Culture de Précision & Bio-Systèmes Régénératifs',
      ar: 'الزراعة الدقيقة والأنظمة الحيوية التجديدية',
    },
    description: {
      en: 'Microbial biomass optimization, substrate balance, and high-efficiency moisture cycles for modern yield resilience.',
      fr: 'Optimisation de la biomasse microbienne, équilibre des substrats et cycles d\'humidité pour la résilience moderne.',
      ar: 'تحسين الكتلة الحيوية الميكروبية وتوازن التربة ودورات الرطوبة عالية الكفاءة للمرونة الإنتاجية الحديثة.',
    },
    difficulty: 'INTERMEDIATE',
    estimatedHours: 6,
    displayOrder: 1,
    isPublished: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'seed-course-digital-operations',
    categoryId: 'seed-digital-skills',
    slug: 'operational-data-architecture',
    title: {
      en: 'Operational Data Architecture & Modern Tooling',
      fr: 'Architecture de Données Opérationnelles & Outils Modernes',
      ar: 'بنية البيانات التشغيلية والأدوات الحديثة',
    },
    description: {
      en: 'Structured data schemas, real-time workflow synchronization, and automated enterprise logic frameworks.',
      fr: 'Schémas de données structurées, synchronisation des flux de travail et automatisation opérationnelle.',
      ar: 'مخططات البيانات المنظمة ومزامنة تدفقات العمل وأطر المنطق المؤسسي الآلي.',
    },
    difficulty: 'FOUNDATIONAL',
    estimatedHours: 4,
    displayOrder: 1,
    isPublished: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'seed-course-analytical-execution',
    categoryId: 'seed-skills',
    slug: 'structured-cognitive-execution',
    title: {
      en: 'Structured Cognitive Execution & Problem Decomposition',
      fr: 'Exécution Cognitive Structurée & Décomposition des Problèmes',
      ar: 'التنفيذ المعرفي المنظم وتفكيك المشكلات المعقدة',
    },
    description: {
      en: 'Systematic root-cause diagnosis, decision matrices, and disciplined execution under asymmetric constraints.',
      fr: 'Diagnostic systématique des causes profondes, matrices de décision et exécution rigoureuse.',
      ar: 'تشخيص الأسباب الجذرية المنهجي، ومصفوفات اتخاذ القرار، والتنفيذ المنضبط في ظل القيود غير المتماثلة.',
    },
    difficulty: 'FOUNDATIONAL',
    estimatedHours: 5,
    displayOrder: 1,
    isPublished: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'seed-course-venture-economics',
    categoryId: 'seed-entrepreneurship',
    slug: 'micro-enterprise-economics',
    title: {
      en: 'Micro-Enterprise Economics & Unit Viability',
      fr: 'Économie des Micro-Entreprises & Viabilité Unitaire',
      ar: 'اقتصاديات المشاريع الصغيرة وجدوى الوحدة',
    },
    description: {
      en: 'Contribution margins, break-even mechanics, and cash flow governance for emerging distributed ventures.',
      fr: 'Marges sur coûts variables, point mort et gestion de trésorerie pour les entreprises distribuées.',
      ar: 'هوامش المساهمة، وحسابات نقطة التعادل، وإدارة التدفق النقدي للمشاريع الناشئة.',
    },
    difficulty: 'INTERMEDIATE',
    estimatedHours: 6,
    displayOrder: 1,
    isPublished: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

export const SEED_MODULES: SchoolModule[] = [
  // Modules for seed-course-precision-ag
  {
    id: 'mod-ag-1',
    courseId: 'seed-course-precision-ag',
    title: {
      en: 'Module 1: Substrate Formulation & Soil Biology',
      fr: 'Module 1: Formulation des Substrats & Biologie du Sol',
      ar: 'الوحدة 1: صياغة الركائز والبيولوجيا الزراعية',
    },
    description: {
      en: 'Analyzing microbial colonization and mineral availability in closed and open-loop agricultural beds.',
      fr: 'Analyse de la colonisation microbienne et disponibilité minérale.',
      ar: 'تحليل الاستعمار الميكروبي وتوافر المعادن في بيئات الزراعة المغلقة والمفتوحة.',
    },
    displayOrder: 1,
    isPublished: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'mod-ag-2',
    courseId: 'seed-course-precision-ag',
    title: {
      en: 'Module 2: Automated Hydration & Thermal Regulation',
      fr: 'Module 2: Hydratation Automatisée & Régulation Thermique',
      ar: 'الوحدة 2: الري المؤتمت والتحكم الحراري',
    },
    description: {
      en: 'Designing low-energy pulse irrigation circuits with atmospheric feedback modulation.',
      fr: 'Conception de circuits d\'irrigation pulsée basse énergie avec régulation atmosphérique.',
      ar: 'تصميم دوائر الري النبضي منخفضة الطاقة مع التعديل التكيفي وفق الظروف الجوية.',
    },
    displayOrder: 2,
    isPublished: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },

  // Modules for seed-course-digital-operations
  {
    id: 'mod-digital-1',
    courseId: 'seed-course-digital-operations',
    title: {
      en: 'Module 1: Relational Schema Design & State Integrity',
      fr: 'Module 1: Conception de Schémas Relationnels & Intégrité des Données',
      ar: 'الوحدة 1: تصميم المخططات العلائقية وسلامة البيانات',
    },
    description: {
      en: 'Standardizing entity boundaries, primary identifiers, and ACID constraints.',
      fr: 'Standardisation des entités, identifiants et contraintes ACID.',
      ar: 'توحيد حدود الكيانات والمعرفات الأساسية وقيود سلامة البيانات.',
    },
    displayOrder: 1,
    isPublished: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'mod-digital-2',
    courseId: 'seed-course-digital-operations',
    title: {
      en: 'Module 2: Workflow Automation & Event Dispatch',
      fr: 'Module 2: Automatisation des Flux & Traitement des Événements',
      ar: 'الوحدة 2: أتمتة تدفقات العمل ومعالجة الأحداث',
    },
    description: {
      en: 'Trigger-based execution pipelines and asynchronous synchronization protocols.',
      fr: 'Pipelines d\'exécution événementiels et protocoles asynchrones.',
      ar: 'مسارات التنفيذ القائمة على المحفزات وبروتوكولات المزامنة غير المتزامنة.',
    },
    displayOrder: 2,
    isPublished: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

export const SEED_LESSONS: SchoolLesson[] = [
  // Lessons for mod-ag-1
  {
    id: 'les-ag-101',
    courseId: 'seed-course-precision-ag',
    moduleId: 'mod-ag-1',
    title: {
      en: 'Foundations of Microbial Inoculation',
      fr: 'Fondements de l\'Inoculation Microbienne',
      ar: 'أسس التلقيح الميكروبي الزراعي',
    },
    contentMarkdown: {
      en: `### Microbial Inoculation and Soil Substrate Dynamics

Soil health in modern precision agriculture relies fundamentally on active bacterial and fungal consortia. Rather than relying on synthetic nitrogen influxes, regenerative bio-systems leverage:

1. **Beneficial Rhizobacteria (PGPR)**: Colonial strains that mobilize locked phosphorus and produce endogenous phytohormones.
2. **Mycorrhizal Networks**: Fungal hyphae extending the physical root absorption surface area by up to 800%.
3. **Humic-Fulvic Chelation**: Protecting trace cations (Iron, Zinc, Manganese) from oxidation and leaching.

#### Practical Field Protocol:
- Verify substrate base moisture at **60-65% field capacity** before introducing liquid inoculants.
- Ensure ambient temperature exceeds **14°C** to support initial spore germination and active root association.
- Record baseline electrical conductivity (EC) to avoid initial osmotic shock.`,
      fr: `### Dynamique de l'inoculation microbienne

La vitalité des sols en agriculture régénérative repose sur les consortiums bactériens et fongiques actifs.`,
      ar: `### ديناميكيات التلقيح الميكروبي وخصوبة التربة

تعتمد الزراعة الدقيقة الحديثة على التفاعل الحيوي بين الكائنات الحية الدقيقة المفيدة وجذور النباتات.`,
    },
    durationMinutes: 20,
    displayOrder: 1,
    isPublished: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'les-ag-102',
    courseId: 'seed-course-precision-ag',
    moduleId: 'mod-ag-1',
    title: {
      en: 'Trace Mineral Balancing & Cation Exchange',
      fr: 'Équilibre des Oligo-Éléments & Capacité d\'Échange Cationique',
      ar: 'موازنة المعادن النادرة وسعة التبادل الكاتيوني',
    },
    contentMarkdown: {
      en: `### Cation Exchange Capacity (CEC) and Mineral Availability

Cation Exchange Capacity measures the total amount of exchangeable cations that a soil substrate can hold. Key ratios for optimal cellular transport include:

- **Calcium (Ca)**: 65% to 70% of base saturation.
- **Magnesium (Mg)**: 12% to 15% of base saturation.
- **Potassium (K)**: 3% to 5% of base saturation.

Balancing these proportions prevents antagonist lockouts where excess potassium suppresses magnesium uptake, leading to chlorosis.`,
      fr: `### Capacité d'Échange Cationique (CEC)`,
      ar: `### سعة التبادل الكاتيوني وتوازن المعادن`,
    },
    durationMinutes: 25,
    displayOrder: 2,
    isPublished: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },

  // Lessons for mod-ag-2
  {
    id: 'les-ag-201',
    courseId: 'seed-course-precision-ag',
    moduleId: 'mod-ag-2',
    title: {
      en: 'Pulse Irrigation Circuit Configuration',
      fr: 'Configuration des Circuits d\'Irrigation Pulsée',
      ar: 'تهيئة دوائر الري النبضي الدقيقة',
    },
    contentMarkdown: {
      en: `### High-Frequency Pulse Irrigation Principles

Rather than large periodic flooding, pulse irrigation delivers micro-volumes calibrated to the exact evapotranspiration (ET) demand of the crop.

#### Implementation Steps:
1. Divide daily volumetric requirements into **4 to 6 discrete pulses**.
2. Avoid runoff by limiting each pulse duration to the soil's infiltration threshold (typically 4-8 minutes).
3. Integrate capillary pressure sensors to trigger pulses before matric potential drops below -30 kPa.`,
      fr: `### Principes de l'irrigation pulsée`,
      ar: `### مبادئ الري النبضي عالي الكفاءة`,
    },
    durationMinutes: 20,
    displayOrder: 1,
    isPublished: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'les-ag-202',
    courseId: 'seed-course-precision-ag',
    moduleId: 'mod-ag-2',
    title: {
      en: 'Thermal Regulation & Microclimate Optimization',
      fr: 'Régulation Thermique & Optimisation du Microclimat',
      ar: 'التنظيم الحراري وتحسين المناخ الموضعي',
    },
    contentMarkdown: {
      en: `### Vapor Pressure Deficit (VPD) Management

Vapor Pressure Deficit determines the rate of plant transpiration and nutrient transportation through the xylem.

- **Vegetative Stage Target**: 0.8 to 1.1 kPa
- **Flowering / Fruit Stage Target**: 1.2 to 1.5 kPa

Maintaining VPD within these boundaries prevents stomatal closure during thermal peaks, ensuring continuous photosynthesis without dehydration stress.`,
      fr: `### Gestion du Déficit de Pression de Vapeur (VPD)`,
      ar: `### إدارة عجز ضغط البخار (VPD)`,
    },
    durationMinutes: 30,
    displayOrder: 2,
    isPublished: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },

  // Lessons for mod-digital-1
  {
    id: 'les-dig-101',
    courseId: 'seed-course-digital-operations',
    moduleId: 'mod-digital-1',
    title: {
      en: 'Entity-Relationship Modeling & Schema Boundaries',
      fr: 'Modélisation Entité-Relation & Limites de Schéma',
      ar: 'نمذجة العلاقات بين الكيانات وحدود المخطط',
    },
    contentMarkdown: {
      en: `### Fundamentals of Clean Data Architecture

When designing data structures for distributed operations, enforce strict domain boundaries:

- **Entity Isolation**: Avoid mega-objects combining inventory, transactions, and customer profile data into one document.
- **Immutable Audit Trails**: State transitions should be appended rather than overwritten.
- **Deterministic Keying**: Use natural compound identifiers (e.g., \`userId_courseId\`) to eliminate duplication and race conditions.`,
      fr: `### Principes d'architecture de données propres`,
      ar: `### أساسيات هندسة البيانات النظيفة`,
    },
    durationMinutes: 20,
    displayOrder: 1,
    isPublished: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'les-dig-102',
    courseId: 'seed-course-digital-operations',
    moduleId: 'mod-digital-1',
    title: {
      en: 'Event Sourcing & Transaction Boundaries',
      fr: 'Event Sourcing & Limites de Transaction',
      ar: 'توريد الأحداث وحدود المعاملات',
    },
    contentMarkdown: {
      en: `### Implementing Atomic Transactions in Cloud Databases

Transactions ensure multi-document updates either succeed together or fail together.

#### Best Practices:
1. Always perform **all reads before any writes** within a transaction closure.
2. Minimize the duration of locked documents to avoid high-concurrency contention.
3. Validate business constraints authoritatively on the server side, never relying on client validation alone.`,
      fr: `### Transactions atomiques dans les bases de données cloud`,
      ar: `### تنفيذ المعاملات الذرية في قواعد البيانات السحابية`,
    },
    durationMinutes: 25,
    displayOrder: 2,
    isPublished: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];
