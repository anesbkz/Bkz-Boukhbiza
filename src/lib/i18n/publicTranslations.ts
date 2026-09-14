import { Locale } from '@/types';

export interface PublicTranslations {
  home: {
    heroBadge: string;
    heroTitle: string;
    heroSubtitle: string;
    discoverBtn: string;
    exploreBtn: string;
    heroNotice: string;
    ecosystemTag: string;
    ecosystemTitle: string;
    ecosystemSubtitle: string;
    ecosystemItems: Array<{
      step: string;
      title: string;
      desc: string;
      cta: string;
      route: string;
    }>;
    trajectoryTag: string;
    trajectoryTitle: string;
    trajectorySubtitle: string;
    trajectoryPhases: Array<{
      phaseNum: string;
      title: string;
      days: string;
      capsules: string;
      sealColor: string;
      sealBadge: string;
      desc: string;
      focus: string[];
    }>;
    skillsTag: string;
    skillsTitle: string;
    skillsSubtitle: string;
    skillsItems: Array<{
      id: string;
      title: string;
      desc: string;
    }>;
    qualityTag: string;
    qualityTitle: string;
    qualitySubtitle: string;
    qualityItems: Array<{
      title: string;
      desc: string;
    }>;
    faqTag: string;
    faqTitle: string;
    faqSubtitle: string;
    viewAllFaqsBtn: string;
    disclaimerTitle: string;
    disclaimerBody: string;
  };
  program: {
    badge: string;
    title: string;
    subtitle: string;
    docRef: string;
    phases: Array<{
      phaseNum: string;
      name: string;
      period: string;
      capsules: string;
      sealColor: string;
      sealBadge: string;
      summary: string;
      focusItems: string[];
      milestone: string;
    }>;
    dailyScheduleTag: string;
    dailyScheduleTitle: string;
    dailyScheduleSubtitle: string;
    dailySlots: Array<{
      time: string;
      action: string;
      desc: string;
    }>;
    methodologyTag: string;
    methodologyTitle: string;
    methodologyBody: string;
    trackingTag: string;
    trackingTitle: string;
    trackingBody: string;
  };
  science: {
    tag: string;
    title: string;
    subtitle: string;
    docId: string;
    tenetsTag: string;
    tenetsTitle: string;
    tenetsSubtitle: string;
    tenets: Array<{
      title: string;
      desc: string;
    }>;
    evidenceTag: string;
    evidenceTitle: string;
    evidenceSubtitle: string;
    evidenceItems: Array<{
      title: string;
      desc: string;
      status: string;
    }>;
    disclaimerTag: string;
    disclaimerTitle: string;
    disclaimerBody: string;
  };
  quality: {
    tag: string;
    title: string;
    subtitle: string;
    standardRef: string;
    gatesTag: string;
    gatesTitle: string;
    gatesSubtitle: string;
    gates: Array<{
      num: string;
      title: string;
      desc: string;
    }>;
    registryTag: string;
    registryTitle: string;
    registrySubtitle: string;
    simulatorLabel: string;
    simulatorBtn: string;
    simulatorResultTitle: string;
    simulatorResultBody: string;
    sampleBadge: string;
  };
  restart: {
    tag: string;
    title: string;
    subtitle: string;
    principleTag: string;
    principleTitle: string;
    principleBody: string;
    stepsTag: string;
    stepsTitle: string;
    stepsSubtitle: string;
    steps: Array<{
      stepNum: string;
      title: string;
      desc: string;
      action: string;
    }>;
    guidelinesTitle: string;
    guidelines: string[];
    restartKitBtn: string;
  };
  verify: {
    badge: string;
    title: string;
    subtitle: string;
    inputLabel: string;
    inputPlaceholder: string;
    verifyBtn: string;
    useDemoCodeBtn: string;
    scanQrBtn: string;
    demoNote: string;
    qrModalTitle: string;
    qrModalDesc: string;
    qrCloseBtn: string;
    securityTitle: string;
    securityDesc: string;
    verifiedStatus: string;
    verifiedHeadline: string;
    verifiedBody: string;
    nextStepLabel: string;
    activateBtn: string;
  };
  shop: {
    tag: string;
    marketTag: string;
    title: string;
    subtitle: string;
    deliveryTag: string;
    codTag: string;
    discreetPackagingTag: string;
    bundleSectionTitle: string;
    bundleCapsulesInfo: string;
    bundleSpecs: string[];
    orderBundleBtn: string;
    individualSectionTitle: string;
    individualSectionSubtitle: string;
    selectPhaseBtn: string;
    modalTitle: string;
    modalSubtitle: string;
    fullNameLabel: string;
    phoneLabel: string;
    wilayaLabel: string;
    confirmOrderBtn: string;
    cancelBtn: string;
    orderSuccessTitle: string;
    orderSuccessDesc: string;
    closeBtn: string;
  };
  faq: {
    tag: string;
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    allFilter: string;
    categories: Array<{
      id: string;
      label: string;
    }>;
    items: Array<{
      category: string;
      question: string;
      answer: string;
    }>;
  };
}

export const PUBLIC_TRANSLATIONS: Record<Locale, PublicTranslations> = {
  en: {
    home: {
      heroBadge: 'VIREXON BIOSCIENCES • ZIRON',
      heroTitle: 'A premium biotechnology-inspired wellness program.',
      heroSubtitle:
        'A structured 90-day trajectory uniting targeted daily nutritional routines, applied educational curricula, and cryptographic product authentication. Crafted for disciplined personal habit formation.',
      discoverBtn: 'Discover ZIRON',
      exploreBtn: 'Explore the Program',
      heroNotice:
        'Structured dietary wellness program. Non-medical supplement regimen. No clinical cure claims.',
      ecosystemTag: 'ECOSYSTEM FOUNDATION',
      ecosystemTitle: 'More than a supplement. A comprehensive transformation system.',
      ecosystemSubtitle:
        'ZIRON combines precision bio-nutritional formulations with structured habit engineering, practical skills education, and peer community accountability into a single coherent protocol.',
      ecosystemItems: [
        {
          step: '01 / COMPOUND',
          title: 'Bio-Formulation',
          desc: 'Three sequential 30-capsule containers formulated with bioavailable compounds, without filler excipients.',
          cta: '3 x 30-Day Containers',
          route: 'ziron',
        },
        {
          step: '02 / PROTOCOL',
          title: 'Structured Program',
          desc: '90 days of organized daily routine, morning consistency habits, hydration checkpoints, and sleep alignment.',
          cta: 'Day 01–90 Framework',
          route: 'program',
        },
        {
          step: '03 / TRACKING',
          title: 'Customer Journey',
          desc: 'A personalized digital dossier to log adherence, monitor trajectory milestones, and track habit metrics.',
          cta: 'Personalized Hub',
          route: 'app',
        },
        {
          step: '04 / CURRICULUM',
          title: 'ZIRON School',
          desc: 'Accredited practical curricula covering digital tools, entrepreneurship, sustainable agriculture, and trade skills.',
          cta: 'Restart Academy',
          route: 'school',
        },
        {
          step: '05 / NETWORK',
          title: 'Peer Community',
          desc: 'Private moderated exchange for verified participants with linked containers, offering cohort mutual accountability.',
          cta: 'Private Cohorts',
          route: 'community',
        },
      ],
      trajectoryTag: 'SEQUENTIAL 3-MONTH ARCHITECTURE',
      trajectoryTitle: 'The 90-Day Trajectory',
      trajectorySubtitle:
        'Three organized 30-day blocks designed to transition from habit foundation through regenerative stabilization to self-directed mastery.',
      trajectoryPhases: [
        {
          phaseNum: 'PHASE 01',
          title: 'Foundation & Baseline Habits',
          days: 'Days 01–30',
          capsules: 'Container 01 • 30 Capsules',
          sealColor: '#D62828',
          sealBadge: 'Red Tamper-Evident Seal',
          desc: 'Anchoring morning intake discipline, circadian water intake, and foundational cognitive baseline routines.',
          focus: [
            'Fixed morning capsule intake routine',
            'Minimum 2.5L daily hydration regimen',
            'Digital adherence check-in logging',
            'Access to Restart Academy Track 01',
          ],
        },
        {
          phaseNum: 'PHASE 02',
          title: 'Regeneration & Rhythm',
          days: 'Days 31–60',
          capsules: 'Container 02 • 30 Capsules',
          sealColor: '#F28C28',
          sealBadge: 'Orange Tamper-Evident Seal',
          desc: 'Reinforcing metabolic consistency, physical stamina checkpoints, and cohort mutual discussions.',
          focus: [
            'Sustained nutritional intake rhythm',
            'Structured 30-minute daily activity',
            'Peer community discussion engagement',
            'Progress review milestone checkpoint',
          ],
        },
        {
          phaseNum: 'PHASE 03',
          title: 'Mastery & Self-Sufficiency',
          days: 'Days 61–90',
          capsules: 'Container 03 • 30 Capsules',
          sealColor: '#2E9E45',
          sealBadge: 'Green Tamper-Evident Seal',
          desc: 'Consolidating autonomous lifestyle discipline that persists indefinitely beyond the formal program.',
          focus: [
            'Independent habit execution autonomy',
            'Completion of practical academy modules',
            'Issuance of 90-Day Protocol Certificate',
            'Long-term sustainable routine integration',
          ],
        },
      ],
      skillsTag: 'CONTINUOUS EDUCATION & SKILLS',
      skillsTitle: 'Restart Academy & Practical Curricula',
      skillsSubtitle:
        'The ZIRON program extends beyond daily nutrition. Participants unlock targeted practical courses to build enduring vocational and entrepreneurial resilience.',
      skillsItems: [
        {
          id: 'digital',
          title: 'Digital Skills & Tech',
          desc: 'Applied digital literacy, cloud tools, workflow automation, and modern computing fundamentals.',
        },
        {
          id: 'entrepreneurship',
          title: 'Entrepreneurship & Ventures',
          desc: 'Lean venture validation, micro-enterprise operations, customer discovery, and startup discipline.',
        },
        {
          id: 'agritech',
          title: 'Agriculture & Soil Systems',
          desc: 'Sustainable crop cycles, modern irrigation, agro-ecological management, and soil vitality.',
        },
        {
          id: 'beekeeping',
          title: 'Apiculture & Hive Economy',
          desc: 'Colony health management, seasonal hive cycles, sustainable extraction, and value-added honey products.',
        },
        {
          id: 'trades',
          title: 'Practical Trades & Craft',
          desc: 'Hands-on technical maintenance, fabrication safety standards, and artisanal trade execution.',
        },
        {
          id: 'business',
          title: 'Financial & Business Literacy',
          desc: 'Cashflow planning, cost accounting, commercial agreements, and compliant bookkeeping.',
        },
      ],
      qualityTag: 'MANUFACTURING & SERIALIZATION',
      qualityTitle: 'Cryptographic Authentication & Quality Governance',
      qualitySubtitle:
        'Every ZIRON container features an individualized tamper-evident seal and a unique cryptographic serial code verified against our secure ledger.',
      qualityItems: [
        {
          title: 'Raw Material Testing',
          desc: 'Assayed for purity, heavy metals, and botanical identity prior to batch blending.',
        },
        {
          title: 'Unit-Level Serialization',
          desc: 'Individual tamper-evident seal and verifiable serial code on every container.',
        },
        {
          title: 'Independent Verification',
          desc: 'Cryptographic ledger lookup prevents counterfeiting and confirms genuine origin.',
        },
      ],
      faqTag: 'KNOWLEDGE REPOSITORY',
      faqTitle: 'Frequently Asked Questions',
      faqSubtitle:
        'Clear, factual answers regarding formulation science, protocol guidelines, and verification.',
      viewAllFaqsBtn: 'View All Questions & Answers',
      disclaimerTitle: 'IMPORTANT HEALTH & REGULATORY STATEMENT',
      disclaimerBody:
        'ZIRON is a structured dietary wellness and habit formation program formulated by VIREXON BIOSCIENCES. It is not intended to diagnose, treat, cure, or prevent any disease, clinical condition, or substance use disorder. ZIRON is not a substitute for licensed medical care or therapy.',
    },
    program: {
      badge: 'VIREXON BEHAVIORAL FRAMEWORK',
      title: 'The 90-Day Sequential Protocol',
      subtitle:
        'A structured three-month behavioral and nutritional trajectory combining phase-formulated dietary supplementation with daily habit engineering.',
      docRef: 'PROTOCOL CHARTER: VX-PRG-90D-REV3',
      phases: [
        {
          phaseNum: 'PHASE 01',
          name: 'Foundation & Baseline Routine',
          period: 'Days 01–30',
          capsules: 'Container 01 • 30 Capsules',
          sealColor: '#D62828',
          sealBadge: 'Red Tamper-Evident Seal',
          summary:
            'Focuses on establishing non-negotiable morning intake regularity, baseline circadian rhythm alignment, and routine check-in habits.',
          focusItems: [
            'Fixed morning intake (07:00–08:30)',
            '2.5L daily baseline water intake',
            'Evening sleep routine consistency',
            'Initial container code registration & verification',
          ],
          milestone: 'Phase 01 Adherence Record & Milestone Badge',
        },
        {
          phaseNum: 'PHASE 02',
          name: 'Regeneration & Momentum',
          period: 'Days 31–60',
          capsules: 'Container 02 • 30 Capsules',
          sealColor: '#F28C28',
          sealBadge: 'Orange Tamper-Evident Seal',
          summary:
            'Expands physical stamina, daily exercise integration, and peer community accountability checkpoints.',
          focusItems: [
            'Sustained morning nutritional consistency',
            '30-minute structured daily physical exercise',
            'Weekly participation in verified peer cohort forums',
            'Mid-point protocol reflection and habit calibration',
          ],
          milestone: 'Phase 02 Continuity Certificate & Midpoint Badge',
        },
        {
          phaseNum: 'PHASE 03',
          name: 'Mastery & Autonomous Habituation',
          period: 'Days 61–90',
          capsules: 'Container 03 • 30 Capsules',
          sealColor: '#2E9E45',
          sealBadge: 'Green Tamper-Evident Seal',
          summary:
            'Consolidates long-term autonomic habits, independent wellness management, and completion of practical vocational modules.',
          focusItems: [
            'Autonomous lifestyle execution without external cues',
            'Completion of Restart Academy curriculum track',
            'Synthesis of personal nutrition and wellness framework',
            'Final protocol evaluation and graduation review',
          ],
          milestone: 'Official VIREXON 90-Day Protocol Graduation Certificate',
        },
      ],
      dailyScheduleTag: 'OPERATIONAL PROTOCOL',
      dailyScheduleTitle: 'Daily Program Rhythm & Checkpoints',
      dailyScheduleSubtitle:
        'A clear timetable structure engineered for effortless daily execution and habit permanence.',
      dailySlots: [
        {
          time: '07:00 – 08:30',
          action: 'Morning Intake & Hydration',
          desc: 'Take 1 capsule with a full glass of water (350ml) following a nutritious breakfast.',
        },
        {
          time: '12:30 – 14:00',
          action: 'Midday Hydration Checkpoint',
          desc: 'Log midday water milestone (1.5L cumulative) and complete balanced nutritional lunch.',
        },
        {
          time: '17:30 – 19:00',
          action: 'Physical Movement & Skill Practice',
          desc: '30 minutes of moderate physical activity or 20 minutes in Restart Academy modules.',
        },
        {
          time: '21:30 – 22:30',
          action: 'Evening Reflection & Digital Log',
          desc: 'Confirm daily adherence on your Customer Portal and wind down for restorative sleep.',
        },
      ],
      methodologyTag: 'BEHAVIORAL PHILOSOPHY',
      methodologyTitle: 'Why 90 Days of Sequential Structure?',
      methodologyBody:
        'Neurobehavioral research demonstrates that complex lifestyle modifications require a minimum of 66 to 90 consecutive days to transition from deliberate cognitive effort to automatic neural habit loops. By partitioning this progression into three distinct 30-day phases with physical containers and visual feedback, ZIRON prevents protocol fatigue and reinforces measurable daily adherence.',
      trackingTag: 'ADHERENCE & ACCOUNTABILITY',
      trackingTitle: 'Integrated Digital Monitoring',
      trackingBody:
        'Every participant gains access to the personal Customer Portal upon verifying their initial container code. The portal tracks daily completion streaks, unlocks milestone certificates, and provides direct access to the Restart School curriculum.',
    },
    science: {
      tag: 'VIREXON SCIENTIFIC CHARTER',
      title: 'Formulation Science & Biochemical Discipline',
      subtitle:
        'Applying rigorous biotechnology principles, transparent compound disclosure, and physiological synergy to dietary wellness.',
      docId: 'DOCUMENT ID: VX-SCI-CHARTER-01',
      tenetsTag: 'CORE TENETS',
      tenetsTitle: 'Four Pillars of Scientific Integrity',
      tenetsSubtitle:
        'Every decision behind ZIRON is governed by disciplined biochemistry, safety margins, and evidence-informed ingredient selection.',
      tenets: [
        {
          title: 'Bioavailable Compound Selection',
          desc: 'Nutrients are selected strictly in molecular forms with verified gastrointestinal uptake and physiological utilization.',
        },
        {
          title: 'Absence of Proprietary Blends',
          desc: 'Complete quantitative disclosure on every commercial label. Zero hidden ingredient complexes or deceptive filler formulas.',
        },
        {
          title: 'Physiological Alignment',
          desc: 'Ingredient balances are designed to support endogenous metabolic homeostasis rather than shocking neurochemical pathways.',
        },
        {
          title: 'Batch Reproducibility',
          desc: 'Standardized manufacturing protocols ensure chemical uniformity and potency consistency across all production lots.',
        },
      ],
      evidenceTag: 'EVIDENCE & DOCUMENTATION',
      evidenceTitle: 'Analytical Dossiers & Research Register',
      evidenceSubtitle:
        'Documentation regarding raw material purity, analytical assays, and nutritional literature.',
      evidenceItems: [
        {
          title: 'Compound Identity & Heavy Metal Screening',
          desc: 'Independent spectrometry screening for lead, arsenic, cadmium, and mercury on all ingredient lots.',
          status: 'Documented Compliance',
        },
        {
          title: 'Microbial Safety Standards',
          desc: 'Total plate count, yeast, mold, and pathogen testing complying with international pharmacopeial limits.',
          status: 'Verified Laboratory Standard',
        },
        {
          title: 'Dissolution & Absorption Profiles',
          desc: 'Vegetarian capsule disintegration tested within 15 minutes in simulated gastric conditions.',
          status: 'cGMP Protocol Standard',
        },
      ],
      disclaimerTag: 'ETHICAL BOUNDARIES',
      disclaimerTitle: 'Medical Disclaimers & Non-Clinical Scope',
      disclaimerBody:
        'VIREXON BIOSCIENCES does not make medical, pharmaceutical, or therapeutic claims. ZIRON is a dietary nutritional supplement formulated to support overall wellness, metabolic consistency, and healthy lifestyle habits. It is not formulated to diagnose, cure, treat, or prevent any illness, chronic condition, or clinical disorder. Always consult with a licensed physician regarding your medical regimen.',
    },
    quality: {
      tag: 'VIREXON QUALITY GOVERNANCE',
      title: 'Quality Assurance & Batch Traceability',
      subtitle:
        'End-to-end quality architecture ensuring compound purity, manufacturing compliance, and individual container verification.',
      standardRef: 'STANDARDS REGISTER: ISO-GMP-ALG-2026',
      gatesTag: 'QUALITY GATES',
      gatesTitle: 'Multi-Stage Quality Architecture',
      gatesSubtitle:
        'From raw ingredient assay to tamper-evident sealed packaging, each production run traverses five strict gates.',
      gates: [
        {
          num: 'GATE 01',
          title: 'Raw Material Quarantine & Assay',
          desc: 'Incoming botanical and mineral compounds are quarantined and tested for identity, purity, and safety before release to production.',
        },
        {
          num: 'GATE 02',
          title: 'cGMP Controlled Formulation',
          desc: 'Encapsulation and blending occur within climate-regulated cleanroom facilities adhering to Current Good Manufacturing Practices.',
        },
        {
          num: 'GATE 03',
          title: 'In-Process Analytical Verification',
          desc: 'Automated weight checks, capsule integrity tests, and periodic assay sampling are conducted throughout the encapsulation run.',
        },
        {
          num: 'GATE 04',
          title: 'Cryptographic Serialization',
          desc: 'Every container is assigned a globally unique serialized code laser-printed beneath a secure scratch-off authenticity seal.',
        },
        {
          num: 'GATE 05',
          title: 'Tamper-Evident Final Assembly',
          desc: 'Induction-sealed cap liner and tamper-evident outer neck band ensure container integrity during transit across all 58 Algerian wilayas.',
        },
      ],
      registryTag: 'BATCH REPRODUCIBILITY',
      registryTitle: 'Lot Verification & Sample Registry',
      registrySubtitle:
        'Inspect batch test simulated parameters and verify production consistency.',
      simulatorLabel: 'Sample Lot: ZR-BATCH-2026-A1',
      simulatorBtn: 'Simulate Batch Lookup',
      simulatorResultTitle: 'Lot Status: VERIFIED COMPLIANT',
      simulatorResultBody:
        'Microbial assay: NEGATIVE • Heavy metals: BELOW DETECTION LIMITS • Potency: 100.4% OF TARGET • Tamper verification: SECURE',
      sampleBadge: 'VERIFIED LABORATORY ASSAY',
    },
    restart: {
      tag: 'BEHAVIORAL ADHERENCE FRAMEWORK',
      title: 'The Restart Protocol',
      subtitle:
        'A structured, non-punitive framework for navigating routine interruptions and re-establishing nutritional consistency.',
      principleTag: 'CORE ADHERENCE PRINCIPLE',
      principleTitle: 'A Routine Interruption Is an Operational Data Point, Not a Moral Failure',
      principleBody:
        'Traditional wellness regimens often induce psychological collapse after a single missed day. The ZIRON Restart Protocol reframes interruptions as normal operational variances, offering structured reset checkpoints without shame or friction.',
      stepsTag: 'RECOVERY WORKFLOW',
      stepsTitle: 'The 3-Step Reset Sequence',
      stepsSubtitle:
        'If you miss two or more consecutive days, execute this standardized recovery protocol.',
      steps: [
        {
          stepNum: '01',
          title: 'Assess the Interruption Duration',
          desc: 'Determine whether the gap was brief (1–2 days) or extended (3+ days) to calibrate capsule resumption pacing.',
          action: 'Log interruption in Customer Portal',
        },
        {
          stepNum: '02',
          title: 'Recalibrate Timing Without Doubling Dosage',
          desc: 'Never consume two capsules simultaneously to make up for a missed day. Simply resume the standard single-capsule morning routine.',
          action: 'Resume single morning dose',
        },
        {
          stepNum: '03',
          title: 'Re-engage Cohort & Curriculum',
          desc: 'Re-access your Restart Academy course modules and check in with your peer community cohort for mutual accountability.',
          action: 'Check in on Community Board',
        },
      ],
      guidelinesTitle: 'Key Restart Principles',
      guidelines: [
        'Never double dose after a missed day',
        'Maintain baseline water hydration even during protocol pauses',
        'Record missed days transparently in your digital journey log',
        'Focus on total 90-day consistency rather than unbroken perfection',
      ],
      restartKitBtn: 'Order Replacement / Restart Phase Container',
    },
    verify: {
      badge: 'VIREXON AUTHENTICATION GATEWAY',
      title: 'Product Security & Code Verification',
      subtitle:
        'Verify the cryptographic authenticity of your ZIRON container before initial use.',
      inputLabel: 'Unique Product Verification Code',
      inputPlaceholder: 'ZR-XXXX-XXXX-XXXX',
      verifyBtn: 'Verify Authenticity',
      useDemoCodeBtn: 'Insert Sample Code',
      scanQrBtn: 'Scan Container QR Code',
      demoNote:
        'Demo verification codes are available for testing. Real containers carry unique codes beneath the tamper-evident scratch-off seal.',
      qrModalTitle: 'Optical Container Scanner',
      qrModalDesc:
        'Align your camera with the QR code printed on the side of your authentic ZIRON container.',
      qrCloseBtn: 'Close Scanner',
      securityTitle: 'Tamper-Evident Security System',
      securityDesc:
        'Each genuine ZIRON container features an individualized cryptographic security seal. Do not accept containers with broken seals or damaged codes.',
      verifiedStatus: 'AUTHENTIC PRODUCT VERIFIED',
      verifiedHeadline: 'Official VIREXON BIOSCIENCES Container',
      verifiedBody:
        'This product code matches a verified production batch. You may safely register this container to your personal Customer Portal.',
      nextStepLabel: 'Next Recommended Step:',
      activateBtn: 'Link Container to Customer Portal',
    },
    shop: {
      tag: 'COMMERCIAL DISTRIBUTION REGISTRY',
      marketTag: 'TERRITORY: ALGERIA (DZD) • 58 WILAYAS',
      title: 'Official ZIRON Product Catalog',
      subtitle:
        'Authentic serialized containers engineered for structured 30-day and 90-day protocol adherence. All orders shipped across all 58 Algerian wilayas with Cash on Delivery and discreet outer packaging.',
      deliveryTag: '58 Wilayas Delivery',
      codTag: 'Cash on Delivery (Paiement à la livraison)',
      discreetPackagingTag: '100% Discreet Packaging',
      bundleSectionTitle: 'Featured 90-Day Complete Protocol Bundle',
      bundleCapsulesInfo: '3 containers × 30 capsules = 90 capsules total (90-day supply)',
      bundleSpecs: [
        'Complete 3-phase kit (Phase 01, Phase 02, and Phase 03)',
        '3 individual serialized product verification codes',
        'Full 90-day access to Customer Portal & Restart School',
        'Priority delivery across all 58 Algerian wilayas',
      ],
      orderBundleBtn: 'Order 90-Day Complete Bundle',
      individualSectionTitle: 'Individual 30-Day Phase Containers',
      individualSectionSubtitle:
        'Order sequential containers individually to progress phase by phase.',
      selectPhaseBtn: 'Order Container',
      modalTitle: 'Confirm Delivery Order',
      modalSubtitle:
        'Provide your contact information. Payment is processed via Cash on Delivery upon physical inspection.',
      fullNameLabel: 'Full Name',
      phoneLabel: 'Phone Number (Mobile)',
      wilayaLabel: 'Wilaya (Delivery Province)',
      confirmOrderBtn: 'Submit Cash on Delivery Order',
      cancelBtn: 'Cancel',
      orderSuccessTitle: 'Order Registered Successfully',
      orderSuccessDesc:
        'Our logistics team will contact you by telephone within 24 hours to confirm dispatch to your specified wilaya address.',
      closeBtn: 'Close',
    },
    faq: {
      tag: 'KNOWLEDGE BASE',
      title: 'Frequently Asked Questions',
      subtitle:
        'Direct, unambiguous answers regarding formulations, the 90-day protocol, authentication, and clinical disclaimers.',
      searchPlaceholder: 'Search questions by keyword...',
      allFilter: 'All Questions',
      categories: [
        { id: 'all', label: 'All Questions' },
        { id: 'product', label: 'Product & Formulation' },
        { id: 'program', label: '90-Day Program' },
        { id: 'shipping', label: 'Ordering & Wilayas' },
        { id: 'verification', label: 'Authenticity & Verification' },
        { id: 'safety', label: 'Health & Safety Disclaimers' },
      ],
      items: [
        {
          category: 'product',
          question: 'What is ZIRON?',
          answer:
            'ZIRON is a sequential 90-day dietary wellness system created by VIREXON BIOSCIENCES. It couples clean, bioavailable micronutrient formulations with structured morning routines to support behavioral consistency, hydration, and long-term habit consolidation.',
        },
        {
          category: 'product',
          question: 'How many capsules are included in each container?',
          answer:
            'Each phase container contains exactly 30 vegetarian capsules, providing a 30-day supply taken at one capsule per day. The complete 90-Day Bundle includes three phase containers (Phase 01, Phase 02, and Phase 03) totaling 90 capsules.',
        },
        {
          category: 'product',
          question: 'What is in the formula and are there proprietary blends?',
          answer:
            'VIREXON BIOSCIENCES strictly avoids undisclosed proprietary blends. Formulas use bioavailable nutrients without artificial dyes or redundant fillers. Detailed quantitative specifications and analytical testing dossiers will be published as commercial batches are registered.',
        },
        {
          category: 'program',
          question: 'How is the 90-day program structured?',
          answer:
            'The program is divided into three sequential 30-day phases: Phase 01 (Foundation & Baseline Habits), Phase 02 (Regeneration & Momentum), and Phase 03 (Mastery & Autonomous Habituation). Each phase corresponds to one specific 30-capsule container.',
        },
        {
          category: 'program',
          question: 'What should I do if I miss a day?',
          answer:
            'Follow the ZIRON Restart Protocol. Never double your dose the next day. Simply resume taking one capsule the following morning with water. A missed day is an operational data point, not a moral failure.',
        },
        {
          category: 'shipping',
          question: 'Do you deliver across all 58 Algerian wilayas?',
          answer:
            'Yes. We deliver to all 58 wilayas of Algeria via express courier with Cash on Delivery (Paiement à la livraison) and 100% discreet packaging.',
        },
        {
          category: 'shipping',
          question: 'What currency is used for pricing?',
          answer:
            'All official pricing is denominated in Algerian Dinars (DZD). Current individual containers are 3,500 DZD, and the complete 90-Day Bundle is 9,500 DZD.',
        },
        {
          category: 'verification',
          question: 'How do I verify that my container is genuine?',
          answer:
            'Scratch off the silver security panel on the side of your container to reveal your unique Product Verification Code. Enter it on our Product Verification page or scan the QR code to confirm authenticity.',
        },
        {
          category: 'verification',
          question: 'What happens when I link my container to my account?',
          answer:
            'Linking your container unlocks access to the Customer Portal, adherence streak tracking, personalized milestone certificates, peer community forums, and the Restart School curricula.',
        },
        {
          category: 'safety',
          question: 'Is ZIRON a medication or pharmaceutical treatment?',
          answer:
            'No. ZIRON is a dietary nutritional wellness program. It is not a pharmaceutical drug and is not intended to diagnose, treat, cure, or prevent any illness, disease, or psychiatric condition. Always consult a licensed healthcare professional.',
        },
      ],
    },
  },

  fr: {
    home: {
      heroBadge: 'VIREXON BIOSCIENCES • ZIRON',
      heroTitle: 'Un programme de bien-être haut de gamme inspiré par les biotechnologies.',
      heroSubtitle:
        'Une trajectoire structurée de 90 jours associant routines nutritionnelles quotidiennes ciblées, cursus éducatif appliqué et authentification cryptographique des produits. Conçu pour ancrer des habitudes durables.',
      discoverBtn: 'Découvrir ZIRON',
      exploreBtn: 'Explorer le Programme',
      heroNotice:
        'Programme de bien-être nutritionnel structuré. Régime de compléments non médical. Aucune allégation thérapeutique.',
      ecosystemTag: "FONDATION DE L'ÉCOSYSTÈME",
      ecosystemTitle: 'Plus qu’un complément. Un système global de transformation.',
      ecosystemSubtitle:
        'ZIRON associe des formulations bio-nutritionnelles de précision à l’ingénierie des habitudes, à la formation pratique et à la responsabilité communautaire.',
      ecosystemItems: [
        {
          step: '01 / COMPOSITION',
          title: 'Bio-Formulation',
          desc: 'Trois flacons séquentiels de 30 gélules formulés avec des composés biodisponibles, sans excipients de remplissage.',
          cta: '3 Flacons de 30 Jours',
          route: 'ziron',
        },
        {
          step: '02 / PROTOCOLE',
          title: 'Programme Structuré',
          desc: '90 jours d’organisation quotidienne : prise matinale régulière, hydratation suivie et alignement du sommeil.',
          cta: 'Cadre Jours 01–90',
          route: 'program',
        },
        {
          step: '03 / SUIVI',
          title: 'Parcours Participant',
          desc: 'Un dossier numérique personnalisé pour consigner l’assiduité, suivre les jalons et évaluer vos progrès.',
          cta: 'Espace Personnel',
          route: 'app',
        },
        {
          step: '04 / CURRICULUM',
          title: 'École ZIRON',
          desc: 'Formations pratiques certifiantes couvrant les outils numériques, l’entrepreneuriat, l’agro-écologie et l’artisanat.',
          cta: 'Restart Academy',
          route: 'school',
        },
        {
          step: '05 / COMMUNAUTÉ',
          title: 'Réseau de Pairs',
          desc: 'Échanges privés modérés réservés aux participants vérifiés, favorisant l’entraide et la motivation réciproque.',
          cta: 'Cohortes Privées',
          route: 'community',
        },
      ],
      trajectoryTag: 'ARCHITECTURE SÉQUENTIELLE SUR 3 MOIS',
      trajectoryTitle: 'La Trajectoire de 90 Jours',
      trajectorySubtitle:
        'Trois phases organisées de 30 jours pour passer de l’ancrage des habitudes à la régénération, puis à l’autonomie complète.',
      trajectoryPhases: [
        {
          phaseNum: 'PHASE 01',
          title: 'Fondation & Habitudes de Base',
          days: 'Jours 01–30',
          capsules: 'Flacon 01 • 30 Gélules',
          sealColor: '#D62828',
          sealBadge: 'Sceau d’Inviolabilité Rouge',
          desc: 'Instauration d’une discipline de prise matinale, régulation de l’hydratation et premières routines quotidiennes.',
          focus: [
            'Prise régulière de la gélule chaque matin',
            'Hydratation minimale de 2,5 L par jour',
            'Enregistrement de l’assiduité sur l’espace personnel',
            'Accès au premier module de la Restart Academy',
          ],
        },
        {
          phaseNum: 'PHASE 02',
          title: 'Régénération & Rythme',
          days: 'Jours 31–60',
          capsules: 'Flacon 02 • 30 Gélules',
          sealColor: '#F28C28',
          sealBadge: 'Sceau d’Inviolabilité Orange',
          desc: 'Renforcement de la vitalité, activité physique mesurée et échanges enrichissants avec les membres de la cohorte.',
          focus: [
            'Maintien de la régularité nutritionnelle',
            'Session quotidienne d’activité physique de 30 min',
            'Échanges au sein de la communauté vérifiée',
            'Bilan intermédiaire d’étape et réajustement',
          ],
        },
        {
          phaseNum: 'PHASE 03',
          title: 'Maîtrise & Autonomie',
          days: 'Jours 61–90',
          capsules: 'Flacon 03 • 30 Gélules',
          sealColor: '#2E9E45',
          sealBadge: 'Sceau d’Inviolabilité Vert',
          desc: 'Consolidation des réflexes sains pour garantir des habitudes durables bien au-delà de la fin du programme.',
          focus: [
            'Autonomie complète sans rappels externes',
            'Validation des modules professionnels de l’école',
            'Attribution du Certificat Officiel 90 Jours',
            'Intégration d’un mode de vie équilibré pérenne',
          ],
        },
      ],
      skillsTag: 'FORMATION CONTINUE & COMPÉTENCES',
      skillsTitle: 'Restart Academy & Cursus Pratiques',
      skillsSubtitle:
        'Le programme ZIRON dépasse la nutrition quotidienne. Les participants débloquent des formations pratiques pour renforcer leur autonomie économique.',
      skillsItems: [
        {
          id: 'digital',
          title: 'Compétences Numériques & Tech',
          desc: 'Maîtrise des outils informatiques, automatisation de travail et gestion de flux modernes.',
        },
        {
          id: 'entrepreneurship',
          title: 'Entrepreneuriat & Projets',
          desc: 'Création de micro-entreprises, validation de marché, gestion commerciale et discipline d’exécution.',
        },
        {
          id: 'agritech',
          title: 'Agriculture & Systèmes Vivants',
          desc: 'Cycles de culture durables, gestion moderne de l’irrigation et vitalité des sols.',
        },
        {
          id: 'beekeeping',
          title: 'Apiculture & Économie de la Ruche',
          desc: 'Santé des colonies, cycles saisonniers, récolte éthique et valorisation des produits de la ruche.',
        },
        {
          id: 'trades',
          title: 'Métiers Pratiques & Artisanat',
          desc: 'Maintenance technique, normes de sécurité en atelier et réalisation d’ouvrages artisanaux.',
        },
        {
          id: 'business',
          title: 'Gestion & Éducation Financière',
          desc: 'Gestion de trésorerie, calcul des coûts de revient et comptabilité élémentaire.',
        },
      ],
      qualityTag: 'FABRICATION & SÉRIALISATION',
      qualityTitle: 'Sécurité Cryptographique & Gouvernance Qualité',
      qualitySubtitle:
        'Chaque flacon ZIRON bénéficie d’un sceau d’inviolabilité et d’un numéro de série unique vérifiable sur notre registre sécurisé.',
      qualityItems: [
        {
          title: 'Contrôle des Matières Premières',
          desc: 'Analyse rigoureuse de la pureté, des métaux lourds et de l’identité botanique de chaque lot.',
        },
        {
          title: 'Sérialisation Unitaire',
          desc: 'Sceau inviolable individuel et code de vérification cryptographique sur chaque boîte.',
        },
        {
          title: 'Vérification en Ligne',
          desc: 'Authentification immédiate pour écarter toute contrefaçon et garantir l’origine officielle.',
        },
      ],
      faqTag: 'RÉPERTOIRE DE CONNAISSANCES',
      faqTitle: 'Foire Aux Questions',
      faqSubtitle:
        'Des réponses claires et précises sur la science des formulations, le protocole et la traçabilité.',
      viewAllFaqsBtn: 'Consulter Toutes les Questions',
      disclaimerTitle: 'AVERTISSEMENT RÉGLEMENTAIRE ET DE SANTÉ',
      disclaimerBody:
        'ZIRON est un programme de bien-être nutritionnel et de formation d’habitudes développé par VIREXON BIOSCIENCES. Il n’est pas destiné à diagnostiquer, traiter, guérir ou prévenir une maladie ou une pathologie médicale. ZIRON ne se substitue pas à une consultation médicale.',
    },
    program: {
      badge: 'CADRE COMPORTEMENTAL VIREXON',
      title: 'Le Protocole Séquentiel de 90 Jours',
      subtitle:
        'Une progression comportementale et nutritionnelle sur trois mois combinant prise par phase et structuration des routines.',
      docRef: 'CHARTE DU PROTOCOLE : VX-PRG-90D-REV3',
      phases: [
        {
          phaseNum: 'PHASE 01',
          name: 'Fondation & Routine de Base',
          period: 'Jours 01–30',
          capsules: 'Flacon 01 • 30 Gélules',
          sealColor: '#D62828',
          sealBadge: 'Sceau Rouge d’Inviolabilité',
          summary:
            'Établissement du réflexe de prise matinale, régulation du cycle éveil-sommeil et hydratation constante.',
          focusItems: [
            'Prise matinale fixe (entre 07h00 et 08h30)',
            'Consommation quotidienne minimale de 2,5 L d’eau',
            'Régularité des horaires de sommeil le soir',
            'Enregistrement et vérification du code du flacon',
          ],
          milestone: 'Attestation d’Assiduité Phase 01',
        },
        {
          phaseNum: 'PHASE 02',
          name: 'Régénération & Élan',
          period: 'Jours 31–60',
          capsules: 'Flacon 02 • 30 Gélules',
          sealColor: '#F28C28',
          sealBadge: 'Sceau Orange d’Inviolabilité',
          summary:
            'Développement de l’endurance physique, intégration d’exercices réguliers et échanges communautaires.',
          focusItems: [
            'Assiduité nutritionnelle continue',
            '30 minutes d’exercice physique structuré chaque jour',
            'Participation aux échanges hebdomadaires de la cohorte',
            'Point d’étape à mi-parcours et bilan des ressentis',
          ],
          milestone: 'Certificat de Continuité Phase 02',
        },
        {
          phaseNum: 'PHASE 03',
          name: 'Maîtrise & Autonomie',
          period: 'Jours 61–90',
          capsules: 'Flacon 03 • 30 Gélules',
          sealColor: '#2E9E45',
          sealBadge: 'Sceau Vert d’Inviolabilité',
          summary:
            'Consolidation de l’autonomie complète et validation des modules professionnels d’apprentissage.',
          focusItems: [
            'Maintien naturel des habitudes sans effort conscient',
            'Validation complète du cursus à l’école Restart',
            'Synthèse personnelle du programme de vitalité',
            'Évaluation finale et remise du diplôme du protocole',
          ],
          milestone: 'Certificat Officiel de Fin de Protocole 90 Jours',
        },
      ],
      dailyScheduleTag: 'PROTOCOLE OPÉRATIONNEL',
      dailyScheduleTitle: 'Rythme Quotidien & Repères Horaires',
      dailyScheduleSubtitle:
        'Une structure claire et facile à intégrer dans votre vie quotidienne pour ancrer vos réflexes.',
      dailySlots: [
        {
          time: '07h00 – 08h30',
          action: 'Prise Matinale & Hydratation',
          desc: 'Prendre 1 gélule avec un grand verre d’eau (350 ml) après un petit-déjeuner équilibré.',
        },
        {
          time: '12h30 – 14h00',
          action: 'Repère d’Hydratation du Midi',
          desc: 'Atteindre le palier de 1,5 L d’eau et savourer un repas nourrissant.',
        },
        {
          time: '17h30 – 19h00',
          action: 'Activité Physique & Apprentissage',
          desc: '30 minutes d’exercice modéré ou 20 minutes d’étude sur les modules de l’école Restart.',
        },
        {
          time: '21h30 – 22h30',
          action: 'Bilan de Soirée & Sommeil Réparateur',
          desc: 'Valider votre journée sur votre espace participant et préparer une nuit de repos.',
        },
      ],
      methodologyTag: 'PHILOSOPHIE COMPORTEMENTALE',
      methodologyTitle: 'Pourquoi 90 Jours Séquentiels ?',
      methodologyBody:
        'Les recherches en neurosciences démontrent qu’un changement durable de mode de vie exige entre 66 et 90 jours d’efforts répétés pour s’ancrer en circuits neuronaux automatiques. En divisant cette période en trois étapes de 30 jours avec des repères concrets, ZIRON évite la lassitude et garantit une progression mesurable.',
      trackingTag: 'SUIVI & ENGAGEMENT',
      trackingTitle: 'Suivi Numérique Intégré',
      trackingBody:
        'Chaque participant accède à son espace personnel après vérification de son flacon. Ce portail permet d’enregistrer sa régularité, de débloquer des certificats et de suivre les cours de l’École Restart.',
    },
    science: {
      tag: 'CHARTE SCIENTIFIQUE VIREXON',
      title: 'Science des Formulations & Rigueur Biochimique',
      subtitle:
        'Application des principes stricts des biotechnologies, transparence totale des ingrédients et synergie physiologique.',
      docId: 'IDENTIFIANT DU DOCUMENT : VX-SCI-CHARTER-01',
      tenetsTag: 'FONDEMENTS SCIENTIFIQUES',
      tenetsTitle: 'Les Quatre Piliers d’Intégrité',
      tenetsSubtitle:
        'Chaque décision formulatoire obéit à des critères rigoureux de sécurité, de pureté et d’adéquation physiologique.',
      tenets: [
        {
          title: 'Sélection de Composés Biodisponibles',
          desc: 'Les nutriments sont choisis sous des formes moléculaires optimisées pour l’assimilation digestive.',
        },
        {
          title: 'Zéro Mélange Secret',
          desc: 'Transparence quantitative totale sur nos emballages, sans complexe breveté opaque ni excipients inutiles.',
        },
        {
          title: 'Respect de la Physiologie',
          desc: 'Des dosages équilibrés pour soutenir l’homéostasie naturelle sans perturber le métabolisme.',
        },
        {
          title: 'Reproductibilité des Lots',
          desc: 'Des protocoles de fabrication rigoureusement standardisés pour assurer une efficacité constante.',
        },
      ],
      evidenceTag: 'PREUVES & CONFORMITÉ',
      evidenceTitle: 'Dossiers Analytiques & Contrôles',
      evidenceSubtitle:
        'Documentation sur la pureté des matières premières et les analyses en laboratoire indépendant.',
      evidenceItems: [
        {
          title: 'Contrôle de Pureté & Métaux Lourds',
          desc: 'Analyses spectrales systématiques (plomb, arsenic, cadmium, mercure) sur chaque lot.',
          status: 'Conformité Validée',
        },
        {
          title: 'Sécurité Microbiologique',
          desc: 'Numération des germes, levures et moisissures selon les standards des pharmacopées internationales.',
          status: 'Normes de Laboratoire Conformes',
        },
        {
          title: 'Profil de Dissolution des Gélules',
          desc: 'Désagrégation complète des gélules végétales en moins de 15 minutes en milieu gastrique simulé.',
          status: 'Standard cGMP Conforme',
        },
      ],
      disclaimerTag: 'CADRE ÉTHIQUE',
      disclaimerTitle: 'Mentions Légales & Portée Non Médicale',
      disclaimerBody:
        'VIREXON BIOSCIENCES ne formule aucune allégation médicale ou thérapeutique. ZIRON est un complément nutritionnel destiné à soutenir la vitalité générale et des habitudes saines. Il n’est pas formulé pour traiter ou guérir une quelconque maladie. Demandez toujours l’avis de votre médecin.',
    },
    quality: {
      tag: 'GOUVERNANCE QUALITÉ VIREXON',
      title: 'Assurance Qualité & Traçabilité des Lots',
      subtitle:
        'Une architecture de contrôle garantissant la pureté des composés et la sérialisation unitaire de chaque flacon.',
      standardRef: 'REGISTRE DES NORMES : ISO-GMP-ALG-2026',
      gatesTag: 'ÉTAPES DE CONTRÔLE',
      gatesTitle: 'Architecture en Cinq Étapes Qualité',
      gatesSubtitle:
        'De l’analyse des matières premières au conditionnement scellé, chaque production franchit cinq étapes strictes.',
      gates: [
        {
          num: 'ÉTAPE 01',
          title: 'Quarantaine & Contrôle des Ingrédients',
          desc: 'Les matières premières sont isolées et testées pour vérifier leur identité et leur pureté avant fabrication.',
        },
        {
          num: 'ÉTAPE 02',
          title: 'Fabrication Conforme aux Normes cGMP',
          desc: 'L’encapsulation et le mélange sont réalisés en salles blanches sous atmosphère et hygrométrie contrôlées.',
        },
        {
          num: 'ÉTAPE 03',
          title: 'Contrôles Analytiques en Cours de Ligne',
          desc: 'Vérification automatique des poids et de la résistance mécanique des gélules tout au long du cycle.',
        },
        {
          num: 'ÉTAPE 04',
          title: 'Sérialisation Cryptographique',
          desc: 'Attribution d’un numéro de série unique imprimé sous un bandeau de sécurité à gratter.',
        },
        {
          num: 'ÉTAPE 05',
          title: 'Conditionnement avec Témoin d’Inviolabilité',
          desc: 'Opercule scellé par induction et bague de sécurité thermique assurant une intégrité totale jusqu’au client.',
        },
      ],
      registryTag: 'REPRODUCTIBILITÉ DES LOTS',
      registryTitle: 'Registre d’Analyse des Lots',
      registrySubtitle:
        'Consultez les paramètres analytiques simulés d’un lot de production.',
      simulatorLabel: 'Lot témoin : ZR-BATCH-2026-A1',
      simulatorBtn: 'Simuler la Recherche de Lot',
      simulatorResultTitle: 'Statut du Lot : CONFORME ET VALIDÉ',
      simulatorResultBody:
        'Microbiologie : NÉGATIF • Métaux lourds : SOUS LE SEUIL DÉTECTABLE • Dosage : 100,4% DE LA CIBLE • Intégrité : VÉRIFIÉE',
      sampleBadge: 'ANALYSE EN LABORATOIRE CONFORME',
    },
    restart: {
      tag: 'GESTION DE L’ASSIDUITÉ',
      title: 'Le Protocole Recommencer',
      subtitle:
        'Un cadre structuré et bienveillant pour surmonter les interruptions de routine et reprendre son élan sans culpabilité.',
      principleTag: 'PRINCIPE FONDAMENTAL',
      principleTitle: 'Un Oubli Est Une Information, Pas Un Échec Personnel',
      principleBody:
        'Beaucoup abandonnent leur routine après un simple oubli. Le protocole Recommencer de ZIRON aborde les aléas de la vie avec pragmatisme, en proposant une reprise claire sans culpabilité ni découragement.',
      stepsTag: 'MÉTHODE DE REPRISE',
      stepsTitle: 'Les 3 Étapes Pour Recommencer',
      stepsSubtitle:
        'Si vous avez manqué deux jours consécutifs ou plus, appliquez cette procédure simple.',
      steps: [
        {
          stepNum: '01',
          title: 'Évaluer la Durée de l’Interruption',
          desc: 'Distinguez un oubli ponctuel (1 à 2 jours) d’une pause prolongée pour calibrer sereinement la reprise.',
          action: 'Signaler la pause sur l’espace personnel',
        },
        {
          stepNum: '02',
          title: 'Reprendre Sans Jamais Doubler la Dose',
          desc: 'Ne prenez jamais deux gélules le même jour pour compenser. Reprenez simplement une gélule le lendemain matin.',
          action: 'Prendre 1 gélule le matin',
        },
        {
          stepNum: '03',
          title: 'Renouer avec la Communauté et les Cours',
          desc: 'Consultez les modules de l’école Restart et échangez avec vos pairs pour retrouver l’élan du groupe.',
          action: 'Participer aux discussions',
        },
      ],
      guidelinesTitle: 'Règles Clés Pour Repartir',
      guidelines: [
        'Ne jamais doubler la dose quotidienne après un oubli',
        'Maintenir une bonne hydratation même pendant les interruptions',
        'Noter honnêtement vos oublis dans votre journal de bord',
        'Viser la régularité sur 90 jours plutôt qu’une perfection rigide',
      ],
      restartKitBtn: 'Commander un Flacon de Reprise',
    },
    verify: {
      badge: 'PORTAIL D’AUTHENTICITÉ VIREXON',
      title: 'Sécurité Produit & Vérification du Code',
      subtitle:
        'Vérifiez l’authenticité cryptographique de votre flacon ZIRON avant la première utilisation.',
      inputLabel: 'Code Unique de Vérification Produit',
      inputPlaceholder: 'ZR-XXXX-XXXX-XXXX',
      verifyBtn: 'Vérifier l’Authenticité',
      useDemoCodeBtn: 'Insérer un Code Exemple',
      scanQrBtn: 'Scanner le Code QR du Flacon',
      demoNote:
        'Des codes de démonstration sont disponibles pour tester la fonctionnalité. Les vrais flacons disposent d’un code sous la pastille à gratter.',
      qrModalTitle: 'Scanner Optique de Flacon',
      qrModalDesc:
        'Orientez votre caméra vers le QR code imprimé sur le côté de votre flacon authentique ZIRON.',
      qrCloseBtn: 'Fermer le Scanner',
      securityTitle: 'Système d’Inviolabilité Garanti',
      securityDesc:
        'Chaque flacon ZIRON possède un scellé cryptographique individuel. N’utilisez pas un flacon dont le sceau est déchiré ou illisible.',
      verifiedStatus: 'PRODUIT AUTHENTIQUE CONFIRMÉ',
      verifiedHeadline: 'Flacon Officiel VIREXON BIOSCIENCES',
      verifiedBody:
        'Ce code correspond à un lot de production certifié. Vous pouvez lier ce flacon en toute sécurité à votre espace participant.',
      nextStepLabel: 'Étape suivante recommandée :',
      activateBtn: 'Lier le Flacon à Mon Espace Personnel',
    },
    shop: {
      tag: 'DISTRIBUTION OFFICIELLE',
      marketTag: 'TERRITOIRE : ALGÉRIE (DZD) • 58 WILAYAS',
      title: 'Catalogue Officiel des Produits ZIRON',
      subtitle:
        'Flacons sérialisés authentiques conçus pour un suivi rigoureux sur 30 et 90 jours. Livraison dans les 58 wilayas avec paiement à la livraison et emballage discret.',
      deliveryTag: 'Livraison 58 Wilayas',
      codTag: 'Paiement à la livraison (Cash on Delivery)',
      discreetPackagingTag: 'Emballage 100% Discret',
      bundleSectionTitle: 'Pack Complet Protocole 90 Jours',
      bundleCapsulesInfo: '3 flacons × 30 gélules = 90 gélules au total (cure complète de 90 jours)',
      bundleSpecs: [
        'Kit complet en 3 phases (Phase 01, Phase 02 et Phase 03)',
        '3 codes de vérification cryptographiques uniques',
        'Accès intégral au portail participant et à l’école Restart',
        'Livraison prioritaire sur l’ensemble des 58 wilayas',
      ],
      orderBundleBtn: 'Commander le Pack Complet 90 Jours',
      individualSectionTitle: 'Flacons Individuels par Phase (30 Jours)',
      individualSectionSubtitle:
        'Commandez vos flacons un par un pour progresser étape par étape dans votre protocole.',
      selectPhaseBtn: 'Commander le Flacon',
      modalTitle: 'Confirmer Votre Commande',
      modalSubtitle:
        'Indiquez vos coordonnées. Le règlement s’effectue en espèces à la réception de votre colis après vérification.',
      fullNameLabel: 'Nom et Prénom',
      phoneLabel: 'Numéro de Téléphone (Mobile)',
      wilayaLabel: 'Wilaya de Livraison',
      confirmOrderBtn: 'Valider la Commande (Paiement à la Livraison)',
      cancelBtn: 'Annuler',
      orderSuccessTitle: 'Commande Enregistrée avec Succès',
      orderSuccessDesc:
        'Notre équipe logistique vous contactera par téléphone sous 24 heures pour confirmer l’expédition vers votre wilaya.',
      closeBtn: 'Fermer',
    },
    faq: {
      tag: 'BASE DE CONNAISSANCES',
      title: 'Foire Aux Questions',
      subtitle:
        'Des réponses directes et transparentes sur les formulations, le protocole, la vérification et les aspects réglementaires.',
      searchPlaceholder: 'Rechercher une question par mot-clé...',
      allFilter: 'Toutes les Questions',
      categories: [
        { id: 'all', label: 'Toutes les Questions' },
        { id: 'product', label: 'Produits & Formulations' },
        { id: 'program', label: 'Programme 90 Jours' },
        { id: 'shipping', label: 'Commandes & Wilayas' },
        { id: 'verification', label: 'Authenticité & Sécurité' },
        { id: 'safety', label: 'Avertissements & Santé' },
      ],
      items: [
        {
          category: 'product',
          question: 'Qu’est-ce que ZIRON exactement ?',
          answer:
            'ZIRON est un programme de bien-être nutritionnel de 90 jours développé par VIREXON BIOSCIENCES. Il combine des micronutriments biodisponibles et un rituel matinal structuré pour développer la régularité, l’énergie et de bonnes habitudes de vie.',
        },
        {
          category: 'product',
          question: 'Combien de gélules contient chaque flacon ?',
          answer:
            'Chaque flacon de phase renferme exactement 30 gélules végétales, soit 30 jours de prise à raison d’une gélule par matin. Le pack complet 90 jours réunit les 3 flacons, soit un total de 90 gélules.',
        },
        {
          category: 'product',
          question: 'Existe-t-il des mélanges secrets ou des ingrédients cachés ?',
          answer:
            'VIREXON BIOSCIENCES exclut formellement tout mélange secret non quantifié. Nos formules emploient des composés rigoureusement dosés, sans colorants artificiels ni excipients inutiles.',
        },
        {
          category: 'program',
          question: 'Comment s’organise le programme sur 90 jours ?',
          answer:
            'Le programme se divise en trois phases séquentielles de 30 jours : Phase 01 (Fondation et réflexes du matin), Phase 02 (Régénération et régularité physique) et Phase 03 (Maîtrise et autonomie). Chaque phase s’appuie sur son flacon dédié.',
        },
        {
          category: 'program',
          question: 'Que faire si j’oublie de prendre ma gélule ?',
          answer:
            'Appliquez le protocole Recommencer. Ne doublez jamais la dose le lendemain. Reprenez simplement une gélule le matin suivant avec de l’eau. Un oubli est un incident de parcours, pas un échec.',
        },
        {
          category: 'shipping',
          question: 'Livrez-vous dans toutes les 58 wilayas d’Algérie ?',
          answer:
            'Oui, la livraison couvre l’ensemble des 58 wilayas d’Algérie par transporteur express, avec paiement en espèces à la livraison et emballage discret.',
        },
        {
          category: 'shipping',
          question: 'Quelle est la monnaie utilisée pour les tarifs ?',
          answer:
            'Tous les prix sont exprimés en Dinars Algériens (DZD). Les flacons individuels sont au prix de 3 500 DZD et le pack complet de 90 jours est proposé à 9 500 DZD.',
        },
        {
          category: 'verification',
          question: 'Comment vérifier l’authenticité de mon flacon ?',
          answer:
            'Grattez la bande grise de sécurité sur le côté du flacon pour découvrir votre code unique. Saisissez-le dans la section Vérification de notre site ou scannez le QR code pour valider son authenticité.',
        },
        {
          category: 'verification',
          question: 'Que m’apporte l’activation de mon flacon sur mon compte ?',
          answer:
            'L’enregistrement débloque votre portail de suivi, l’historique d’assiduité, vos certificats de progression, l’accès à la communauté de pairs et les cours de l’École Restart.',
        },
        {
          category: 'safety',
          question: 'ZIRON est-il un médicament ?',
          answer:
            'Non. ZIRON est un complément nutritionnel de bien-être. Ce n’est pas un médicament et il ne prétend ni guérir, ni prévenir une quelconque affection clinique. Consultez toujours un professionnel de santé agréé.',
        },
      ],
    },
  },

  ar: {
    home: {
      heroBadge: 'فايركسون للعلوم الحيوية • زيرون',
      heroTitle: 'برنامج عافية متكامل ومبتكر مستوحى من العلوم الحيوية.',
      heroSubtitle:
        'مسار منظم على مدار 90 يومًا يجمع بين روتين التغذية الصباحي المنتظم، والمناهج التعليمية التطبيقية، والتحقق الرقمي من أصالة كل عبوة. صُمم لترسيخ عادات يومية منضبطة ومستدامة.',
      discoverBtn: 'استكشف ZIRON',
      exploreBtn: 'استكشف تفاصيل البرنامج',
      heroNotice:
        'برنامج عافية ونمط حياة صحي منظم. مكمل غذائي غير دوائي. لا توجد ادعاءات علاجية سريرية.',
      ecosystemTag: 'أساس المنظومة المتكاملة',
      ecosystemTitle: 'أكثر من مجرد مكمل غذائي. نظام متكامل لبناء العادات.',
      ecosystemSubtitle:
        'يجمع ZIRON بين التركيبات الحيوية الدقيقة، وهندسة العادات اليومية، والتعليم التطبيقي، والتواصل الداعم مع مجتمع المشاركين ضمن بروتوكول واحد متماسك.',
      ecosystemItems: [
        {
          step: '01 / التركيبة الحيوية',
          title: 'التركيبة الدقيقة',
          desc: 'ثلاث عبوات متتالية تحوي كل منها 30 كبسولة بمركبات ذات توافر حيوي مثبت ودون حشوات صناعية غير ضرورية.',
          cta: '3 عبوات × 30 يومًا',
          route: 'ziron',
        },
        {
          step: '02 / البروتوكول',
          title: 'البرنامج المنظم',
          desc: '90 يومًا من الانضباط اليومي: روتين صباحي محدد، شرب منتظم للماء، وتنظيم ساعات النوم والراحة.',
          cta: 'خارطة الأيام 01–90',
          route: 'program',
        },
        {
          step: '03 / التتبع والمتابعة',
          title: 'مسار المشارك',
          desc: 'سجل رقمي مخصص لتوثيق الالتزام اليومي، ومتابعة المراحل المنجزة، وقياس استمرارية العادات الصحية.',
          cta: 'لوحة المتابعة الشخصية',
          route: 'app',
        },
        {
          step: '04 / التعليم التطبيقي',
          title: 'مدرسة ZIRON',
          desc: 'مناهج تدريبية عملية تشمل المهارات الرقمية، ريادة الأعمال المصغرة، الزراعة المستدامة، والحرف اليدوية.',
          cta: 'أكاديمية Restart',
          route: 'school',
        },
        {
          step: '05 / المجتمع',
          title: 'مجتمع الأقران',
          desc: 'منتدى تواصل خاص ومنضبط مخصص للمشاركين الموثقين فقط لدعم الالتزام المتبادل وتبادل التجارب.',
          cta: 'أفواج المشاركين',
          route: 'community',
        },
      ],
      trajectoryTag: 'الهيكل التتابعي على مدار 3 أشهر',
      trajectoryTitle: 'مسار الـ 90 يومًا المنظم',
      trajectorySubtitle:
        'ثلاث مراحل منظمة مدة كل منها 30 يومًا للانتقال بتدرج من تأسيس العادات إلى استعادة التوازن ثم التمكن والاستقلالية.',
      trajectoryPhases: [
        {
          phaseNum: 'المرحلة 01',
          title: 'التأسيس وبناء الروتين القاعدي',
          days: 'الأيام 01–30',
          capsules: 'العبوة 01 • 30 كبسولة',
          sealColor: '#D62828',
          sealBadge: 'ختم الأمان القرمزي ضد التلاعب',
          desc: 'ترسيخ الانضباط في تناول الكبسولة صباحًا، وشرب كميات كافية من الماء، وتنظيم روتين الاستيقاظ.',
          focus: [
            'الالتزام اليومي بموعد التناول الصباحي الثابت',
            'شرب 2.5 لتر من الماء على الأقل يوميًا',
            'تسجيل الالتزام في اللوحة الرقمية للمشارك',
            'فتح المسار التدريبي الأول في مدرسة Restart',
          ],
        },
        {
          phaseNum: 'المرحلة 02',
          title: 'استعادة النشاط وبناء الزخم',
          days: 'الأيام 31–60',
          capsules: 'العبوة 02 • 30 كبسولة',
          sealColor: '#F28C28',
          sealBadge: 'ختم الأمان الكهرماني ضد التلاعب',
          desc: 'تعزيز الحيوية البدنية، وإدراج نشاط حركي يومي معتدل، والمشاركة الفاعلة مع مجتمع الأقران.',
          focus: [
            'استدامة الانتظام الغذائي الصباحي',
            'ممارسة 30 دقيقة من النشاط الحركي اليومي',
            'التفاعل الإيجابي مع أعضاء الفوج في المجتمع',
            'مراجعة وتقييم إنجاز منتصف مدة البرنامج',
          ],
        },
        {
          phaseNum: 'المرحلة 03',
          title: 'التمكن والاستقلالية الذاتية',
          days: 'الأيام 61–90',
          capsules: 'العبوة 03 • 30 كبسولة',
          sealColor: '#2E9E45',
          sealBadge: 'ختم الأمان الزمردي ضد التلاعب',
          desc: 'ترسيخ العادات الصحية لتصبح جزءًا تلقائيًا من نمط حياتك يستمر معك طويلاً بعد نهاية البرنامج.',
          focus: [
            'الاستقلالية في أداء العادات دون حاجة لمحفز خارجي',
            'إتمام المسارات التطبيقية في مدرسة ZIRON',
            'نيل شهادة إتمام برنامج الـ 90 يومًا الرسمية',
            'استدامة نمط الحياة المتوازن على المدى الطويل',
          ],
        },
      ],
      skillsTag: 'التعلم المستمر والمهارات الحياتية',
      skillsTitle: 'أكاديمية Restart والمناهج التطبيقية',
      skillsSubtitle:
        'يتجاوز برنامج ZIRON مجرد التغذية اليومية، حيث يتيح للمشاركين مسارات تدريبية تطبيقية لبناء مرونة مهنية وريادية مستدامة.',
      skillsItems: [
        {
          id: 'digital',
          title: 'المهارات الرقمية والتكنولوجيا',
          desc: 'محو الأمية الرقمية، واستخدام أدوات السحابة، وأتمتة مسارات العمل اليومية والمهنية.',
        },
        {
          id: 'entrepreneurship',
          title: 'ريادة الأعمال والمشاريع المصغرة',
          desc: 'إطلاق المشاريع الناشئة، وتحديد العملاء، وإدارة التكاليف والمبيعات بانضباط ومثابرة.',
        },
        {
          id: 'agritech',
          title: 'الزراعة وأنظمة التربة المستدامة',
          desc: 'دورات المحاصيل المتجددة، والري الذكي، وإدارة الخصوبة البيولوجية للتربة الزراعية.',
        },
        {
          id: 'beekeeping',
          title: 'تربية النحل واقتصاد الخلية',
          desc: 'إدارة صحة المستعمرات، وتدوير الخلايا الموسمي، وجني العسل الطبيعي وفق معايير بيئية.',
        },
        {
          id: 'trades',
          title: 'الحرف والمهارات التقنية',
          desc: 'الصيانة التقنية العملية، ومعايير السلامة المهنية، والتمكن من الأعمال الحرفية.',
        },
        {
          id: 'business',
          title: 'الإدارة والثقافة المالية',
          desc: 'التخطيط المالي، ومحاسبة التكاليف، وإدارة التدفقات النقدية والموازنات البسيطة.',
        },
      ],
      qualityTag: 'التصنيع والتحقق التسلسلي',
      qualityTitle: 'التحقق الأمني المشفر وضمان الجودة',
      qualitySubtitle:
        'تحمل كل عبوة من عبوات ZIRON ختم أمان غير قابل للتلاعب ورمزًا تسلسليًا مشفرًا ومسجلاً للتحقق من أصل المنتج.',
      qualityItems: [
        {
          title: 'فحص المواد الأولية',
          desc: 'تحاليل مخبرية دقيقة للنقاء، وخلو المكونات من المعادن الثقيلة، والتأكد من الهوية الحيوية.',
        },
        {
          title: 'ترميز تسلسلي فريد',
          desc: 'ختم أمان فردي ورمز تحقق مشفر خاص بكل عبوة لضمان عدم استنساخها.',
        },
        {
          title: 'تحقق رقمي فوري',
          desc: 'فحص فوري في قاعدة البيانات لتأكيد أصالة العبوة ومطابقتها للمواصفات الرسمية.',
        },
      ],
      faqTag: 'قاعدة المعرفة التوثيقية',
      faqTitle: 'الأسئلة الأكثر شيوعًا',
      faqSubtitle:
        'إجابات مباشرة وواضحة حول علم التركيبات، وبروتوكول المتابعة، والتحقق من المنتجات.',
      viewAllFaqsBtn: 'عرض جميع الأسئلة والأجوبة',
      disclaimerTitle: 'إشعار صحي وتنظيمي إلزامي',
      disclaimerBody:
        'ZIRON برنامج عافية ونمط حياة وبناء عادات صحية منظم تطوره شركة VIREXON BIOSCIENCES. إنه ليس دواءً صيدلانيًا ولا يهدف لتشخيص أو علاج أو شفاء أو منع أي مرض أو حالة سريرية. لا يعتبر بديلاً عن الاستشارة الطبية المتخصصة.',
    },
    program: {
      badge: 'الإطار السلوكي لـ VIREXON',
      title: 'بروتوكول الـ 90 يومًا التتابعي',
      subtitle:
        'مسار سلوكي وغذائي متدرج على مدى ثلاثة أشهر يجمع بين المكملات المرحلية وهندسة الروتين اليومي المنضبط.',
      docRef: 'ميثاق البروتوكول: VX-PRG-90D-REV3',
      phases: [
        {
          phaseNum: 'المرحلة 01',
          name: 'التأسيس والروتين القاعدي',
          period: 'الأيام 01–30',
          capsules: 'العبوة 01 • 30 كبسولة',
          sealColor: '#D62828',
          sealBadge: 'ختم أحمر مقاوم للتلاعب',
          summary:
            'ترسيخ روتين تناول الكبسولة الصباحية، وضبط الإيقاع اليومي للاستيقاظ، والانتظام في شرب الماء.',
          focusItems: [
            'تناول الكبسولة في موعد صباحي محدد (07:00–08:30)',
            'استهلاك 2.5 لتر من الماء على مدار اليوم كحد أدنى',
            'المحافظة على موعد نوم واستيقاظ منتظم يوميًا',
            'تسجيل رمز العبوة الأولى وتوثيق بداية البرنامج',
          ],
          milestone: 'سجل إتمام المرحلة 01 ووسام الانضباط الأول',
        },
        {
          phaseNum: 'المرحلة 02',
          name: 'استعادة النشاط وتعزيز الزخم',
          period: 'الأيام 31–60',
          capsules: 'العبوة 02 • 30 كبسولة',
          sealColor: '#F28C28',
          sealBadge: 'ختم برتقالي مقاوم للتلاعب',
          summary:
            'توسيع طاقة التحمل البدني، وإدخال الحركة المنتظمة، والتفاعل الإيجابي في مجتمع المشاركين.',
          focusItems: [
            'الاستمرار اليومي المنضبط في التغذية الصباحية',
            'ممارسة 30 دقيقة من النشاط الحركي اليومي المعتدل',
            'المشاركة الأسبوعية في نقاشات مجتمع الأقران الموثقين',
            'تقييم منتصف الطريق ومراجعة المكتسبات الصحية',
          ],
          milestone: 'شهادة استمرارية المرحلة 02 ووسام منتصف المسار',
        },
        {
          phaseNum: 'المرحلة 03',
          name: 'التمكن والاستقلالية الذاتية',
          period: 'الأيام 61–90',
          capsules: 'العبوة 03 • 30 كبسولة',
          sealColor: '#2E9E45',
          sealBadge: 'ختم أخضر مقاوم للتلاعب',
          summary:
            'تثبيت العادات الصحية لتصبح نمط حياة دائم، وإتمام المسارات التعليمية في مدرسة Restart.',
          focusItems: [
            'ممارسة العادات الصحية باستقلالية دون الحاجة لتذكير',
            'إتمام متطلبات المناهج العملية في مدرسة ZIRON',
            'صياغة نظام شخصي متكامل للعافية والاستدامة',
            'التقييم النهائي ونيل شهادة التخرج الرسمية من البرنامج',
          ],
          milestone: 'شهادة التخرج الرسمية لبروتوكول الـ 90 يومًا من VIREXON',
        },
      ],
      dailyScheduleTag: 'البروتوكول التشغيلي اليومي',
      dailyScheduleTitle: 'الإيقاع اليومي ومحطات الانضباط',
      dailyScheduleSubtitle:
        'جدول زمني واضح وميسر صُمم للتنفيذ اليومي دون تعقيد لترسيخ الالتزام المستمر.',
      dailySlots: [
        {
          time: '07:00 – 08:30',
          action: 'التناول الصباحي وشرب الماء',
          desc: 'تناول كبسولة واحدة مع كوب ماء كبير (350 مل) بعد وجبة إفطار صحية ومتوازنة.',
        },
        {
          time: '12:30 – 14:00',
          action: 'محطة ترطيب منتصف النهار',
          desc: 'الوصول إلى شرب 1.5 لتر ماء تراكميًا وتناول وجبة غداء متوازنة ومغذية.',
        },
        {
          time: '17:30 – 19:00',
          action: 'النشاط البدني والتعلم التطبيقي',
          desc: '30 دقيقة من المشي أو الحركة الخفيفة، أو 20 دقيقة في دروس مدرسة ZIRON.',
        },
        {
          time: '21:30 – 22:30',
          action: 'التوثيق المسائي والاستعداد للنوم',
          desc: 'تسجيل الالتزام اليومي في بوابتك الرقمية والاسترخاء لنيل قسط نوم كافٍ ومريح.',
        },
      ],
      methodologyTag: 'المنهجية السلوكية',
      methodologyTitle: 'لماذا 90 يومًا بالتتابع؟',
      methodologyBody:
        'تؤكد الأبحاث العصبية والسلوكية أن اكتساب عادات يومية مستدامة يتطلب ما بين 66 و90 يومًا متتالية من التكرار المنضبط لتتحول العادة من جهد ذهني واعٍ إلى نمط سلوكي تلقائي. ومن خلال تقسيم المسار إلى 3 مراحل بعبوات محددة، يحمي بروتوكول ZIRON المشارك من التراجع والفتور.',
      trackingTag: 'التتبع والمسؤولية',
      trackingTitle: 'المتابعة الرقمية المدمجة',
      trackingBody:
        'يحصل كل مشارك على حق الوصول إلى لوحة تحكمه الخاصة فور إدخال رمز العبوة والتحقق منها. تتيح اللوحة توثيق سلسلة الالتزام اليومي ونيل الشهادات التقديرية.',
    },
    science: {
      tag: 'ميثاق VIREXON العلمي',
      title: 'علم التركيبات والانضباط الكيميائي الحيوي',
      subtitle:
        'تطبيق مبادئ التكنولوجيا الحيوية الصارمة، والشفافية التامة في المكونات، والتكامل الفسيولوجي لتعزيز العافية.',
      docId: 'معرف الوثيقة: VX-SCI-CHARTER-01',
      tenetsTag: 'الركائز العلمية',
      tenetsTitle: 'الركائز الأربع للنزاهة العلمية',
      tenetsSubtitle:
        'تخضع قرارات تطوير ZIRON لمبادئ دقيقة في الكيمياء الحيوية، وهوامش الأمان، واختيار المكونات ذات الفاعلية المثبتة.',
      tenets: [
        {
          title: 'اختيار مركبات عالية التوافر الحيوي',
          desc: 'يتم انتقاء المغذيات بصيغ جزيئية تمتاز بقدرة مؤكدة على الامتصاص المعوي والاستفادة الخلوية.',
        },
        {
          title: 'خلو تام من الخلطات السرية',
          desc: 'إفصاح كمي كامل ومكتوب على كل علبة. لا توجد تركيبات غامضة أو حشوات كيميائية زائدة.',
        },
        {
          title: 'التناغم مع وظائف الجسم الفسيولوجية',
          desc: 'صُممت المقادير لدعم التوازن الحيوي الطبيعي داخل الجسم دون إرهاق المسارات العصبية.',
        },
        {
          title: 'تطابق وجودة مستمرة للدفعات',
          desc: 'معايير إنتاج صارمة وموحدة تضمن مطابقة تركيز ونقاء كل دفعة إنتاجية للدفعة التي تليها.',
        },
      ],
      evidenceTag: 'الأدلة والتوثيق المخبري',
      evidenceTitle: 'ملفات الفحص المخبري وسجل الأبحاث',
      evidenceSubtitle:
        'بيانات موثقة بشأن نقاء المواد الأولية، وفحوصات السلامة البيولوجية، والمراجع الغذائية.',
      evidenceItems: [
        {
          title: 'فحص خلو المكونات من المعادن الثقيلة',
          desc: 'فحص طيفي دقيق للرصاص، والزرنيخ، والكادميوم، والزئبق في كل شحنة مواد خام قبل اعتمادها.',
          status: 'مطابقة مخبرية موثقة',
        },
        {
          title: 'معايير السلامة الميكروبيولوجية',
          desc: 'تحاليل تعداد المستعمرات البكتيرية والخمائر والفطريات وفق معايير دساتير الأدوية الدولية.',
          status: 'معيار مخبري معتمد',
        },
        {
          title: 'معدل ذوبان الكبسولات في المعدة',
          desc: 'اختبار تحلل الكبسولات النباتية في أقل من 15 دقيقة في محاكاة العصارة المعدية الطبيعية.',
          status: 'معيار مطابق لـ cGMP',
        },
      ],
      disclaimerTag: 'الحدود الأخلاقية والتنظيمية',
      disclaimerTitle: 'الإفصاح الطبي ونطاق الاستخدام غير الدوائي',
      disclaimerBody:
        'لا تقدم VIREXON BIOSCIENCES أي ادعاءات طبية أو صيدلانية أو علاجية. إن ZIRON مكمل غذائي لتعزيز نمط الحياة الصحي ودعم التغذية السليمة، وليس دواءً صيدلانيًا لعلاج أو تشخيص أو شفاء أي مرض مزمن أو عضوي. يرجى مراجعة طبيبك بخصوص أي استشارات صحية.',
    },
    quality: {
      tag: 'حوكمة الجودة في VIREXON',
      title: 'ضمان الجودة وتتبع مسار الدفعات',
      subtitle:
        'منظومة رقابة صارمة وشاملة تبدأ من فحص نقاء المواد الخام وتنتهي بالتحقق الفردي المشفر من كل عبوة منتج.',
      standardRef: 'سجل المعايير: ISO-GMP-ALG-2026',
      gatesTag: 'مراحل الجودة',
      gatesTitle: 'هندسة الجودة في خمس مراحل متتالية',
      gatesSubtitle:
        'من فحص المواد الأولية حتى التغليف النهائي ضد التلاعب، تمر كل دورة إنتاج بخمس بوابات تدقيق صارمة.',
      gates: [
        {
          num: 'المرحلة 01',
          title: 'الحجر الصحي وفحص المواد الأولية',
          desc: 'عزل المكونات النباتية والمعدنية فور وصولها وفحص نقائها وهويتها الحيوية قبل السماح بدخولها خط الإنتاج.',
        },
        {
          num: 'المرحلة 02',
          title: 'التصنيع في بيئة cGMP معقمة ومتحكم بها',
          desc: 'تتم عمليات الخلط والتعبئة داخل غرف نظيفة تخضع لتحكم إلكتروني دقيق في درجات الحرارة والرطوبة ونقاء الهواء.',
        },
        {
          num: 'المرحلة 03',
          title: 'فحوصات الجودة اللحظية أثناء التشغيل',
          desc: 'فحص آلي مستمر لوزن الكبسولات، ومتانتها الميكانيكية، وسحب عينات دورية لاختبار التركيز أثناء التعبئة.',
        },
        {
          num: 'المرحلة 04',
          title: 'الترميز والتشفير التسلسلي الفردي',
          desc: 'تخصيص رمز رقمي فريد مشفر لكل عبوة يُطبع بالليزر أسفل طبقة أمان فضية قابلة للخدش.',
        },
        {
          num: 'المرحلة 05',
          title: 'التغليف المحكم المزود بختم أمان',
          desc: 'إغلاق عنق العبوة حراريًا وبحزام أمان مقاوم للتلاعب لضمان سلامة العبوة أثناء الشحن لكافة الـ 58 ولاية.',
        },
      ],
      registryTag: 'مطابقة الدفعات',
      registryTitle: 'سجل التحقق من الدفعات والبيانات التجريبية',
      registrySubtitle:
        'معاينة مؤشرات الفحص المخبري ومطابقة معايير الإنتاج.',
      simulatorLabel: 'دفعة نموذجية: ZR-BATCH-2026-A1',
      simulatorBtn: 'معاينة نتيجة فحص الدفعة',
      simulatorResultTitle: 'حالة الدفعة: مطابقة وموثقة رسميًا',
      simulatorResultBody:
        'الفحص الميكروبيولوجي: سلبي (سليم) • المعادن الثقيلة: أقل من أدنى حدود الكشف • مطابقة التركيز: 100.4% • أختام الأمان: مؤكدة وسليمة',
      sampleBadge: 'فحص مخبري معتمد ومطابق',
    },
    restart: {
      tag: 'منهجية الالتزام السلوكي',
      title: 'بروتوكول إعادة البدء (Restart)',
      subtitle:
        'إطار منظم ومرن للتعامل مع انقطاع الروتين اليومي واستئناف المسار الغذائي دون شعور بالإحباط أو التراجع.',
      principleTag: 'المبدأ الأساسي للالتزام',
      principleTitle: 'الانقطاع المؤقت هو معلومة تشغيلية للتصحيح وليس فشلاً شخصيًا',
      principleBody:
        'كثيرًا ما يتخلى الناس عن برامجهم الصحية بسبب انقطاع يوم واحد. يعيد بروتوكول ZIRON صياغة هذا التوقف باعتباره أمرًا طبيعيًا في الحياة، ويوفر خطوات عملية واضحة للعودة إلى المسار دون شعور بالذنب.',
      stepsTag: 'خطوات استئناف البروتوكول',
      stepsTitle: 'الخطوات الثلاث لاستعادة المسار',
      stepsSubtitle:
        'إذا فاتك تناول الكبسولة ليومين متتاليين أو أكثر، اتبع هذه الخطوات البسيطة لاستئناف البروتوكول.',
      steps: [
        {
          stepNum: '01',
          title: 'تحديد فترة الانقطاع بدقة',
          desc: 'حدد ما إذا كان التوقف قصيرًا (يوم إلى يومين) أو فترة أطول لتنظيم وتيرة العودة المناسبة.',
          action: 'تسجيل التوقف في لوحة التحكم',
        },
        {
          stepNum: '02',
          title: 'العودة دون مضاعفة الجرعة إطلاقًا',
          desc: 'إياك وتناول كبسولتين معًا لتعويض ما فات. استأنف روتينك الصباحي العادي بتناول كبسولة واحدة مع الماء.',
          action: 'تناول كبسولة واحدة في الصباح التالي',
        },
        {
          stepNum: '03',
          title: 'التواصل مع الفوج ومتابعة الدروس',
          desc: 'عد لمتابعة دروسك في مدرسة Restart وتواصل مع مجموعتك في مجتمع الأقران لاستعادة الحماس المشترك.',
          action: 'المشاركة في مجتمع الأقران',
        },
      ],
      guidelinesTitle: 'قواعد هامة لإعادة البدء',
      guidelines: [
        'لا تضاعف الجرعة الصباحية أبدًا لتعويض يوم فائت',
        'حافظ على شرب الماء بانتظام حتى في أيام الانقطاع',
        'سجل أيام التوقف بصدق وشفافية في دفتر مسارك الرقمي',
        'اجعل هدفك تحقيق استمرارية الـ 90 يومًا بدلاً من التطلع لكمال مثالي غير واقعي',
      ],
      restartKitBtn: 'طلب عبوة مرحلية لاستئناف البرنامج',
    },
    verify: {
      badge: 'بوابة التحقق الرسمية من VIREXON',
      title: 'أمان المنتجات وفحص رمز الأصالة',
      subtitle:
        'افحص رمز الأمان المشفر على عبوة ZIRON للتأكد من أصالة المنتج قبل الاستخدام الأول.',
      inputLabel: 'رمز التحقق الفريد للمنتج',
      inputPlaceholder: 'ZR-XXXX-XXXX-XXXX',
      verifyBtn: 'التحقق من الأصالة',
      useDemoCodeBtn: 'تجربة رمز توضيحي',
      scanQrBtn: 'مسح الرمز البصري QR على العبوة',
      demoNote:
        'تتوفر رموز تجريبية لاختبار المنظومة. العبوات الأصلية تحمل رمزًا مشفرًا ومطبوعًا أسفل شريط الأمان القابل للخدش.',
      qrModalTitle: 'المسح الضوئي البصري للعبوة',
      qrModalDesc:
        'وجّه كاميرا هاتفك نحو رمز QR المطبوع على جانب عبوة ZIRON الأصلية لمسحه فورًا.',
      qrCloseBtn: 'إغلاق الماسح',
      securityTitle: 'نظام حماية متقدم ضد التلاعب',
      securityDesc:
        'تحمل كل عبوة ZIRON أصلية ختم أمان رقميًا فرديًا. لا تقبل العبوات التي تكون أختامها ممزقة أو أرقامها غير واضحة.',
      verifiedStatus: 'تم التحقق: منتج أصلي معتمد',
      verifiedHeadline: 'عبوة رسمية من VIREXON BIOSCIENCES',
      verifiedBody:
        'يطابق هذا الرمز دفعة إنتاجية موثقة ومعتمدة مخبريًا. يمكنك ربط هذه العبوة بحسابك الشخصي في المنصة.',
      nextStepLabel: 'الخطوة التالية الموصى بها:',
      activateBtn: 'ربط العبوة بحسابي في لوحة المتابعة',
    },
    shop: {
      tag: 'سجل التوزيع التجاري الرسمي',
      marketTag: 'نطاق التوزيع: الجزائر (د.ج) • 58 ولاية',
      title: 'كتالوج منتجات ZIRON الرسمي',
      subtitle:
        'عبوات مسلسلة وأصلية صُممت للالتزام المنضبط ببرنامج الـ 30 و90 يومًا. التوصيل متوفر لكافة ولايات الجزائر الـ 58 مع الدفع عند الاستلام والتغليف المحكم والسري.',
      deliveryTag: 'توصيل لكافة الـ 58 ولاية',
      codTag: 'الدفع نقدًا عند الاستلام (Paiement à la livraison)',
      discreetPackagingTag: 'تغليف سري ومحكم 100%',
      bundleSectionTitle: 'حزمة بروتوكول الـ 90 يومًا الكاملة المتميزة',
      bundleCapsulesInfo: '3 عبوات × 30 كبسولة = 90 كبسولة إجمالاً (إمداد كامل لـ 90 يومًا)',
      bundleSpecs: [
        'طقم متكامل يضم المراحل الثلاث (المرحلة 01، المرحلة 02، والمرحلة 03)',
        '3 رموز تحقق تسلسلية ومشفرة فردية',
        'دخول كامل لبوابة المتابعة الشخصية ومدرسة Restart',
        'أولوية الشحن السريع إلى باب منزلك في أي ولاية',
      ],
      orderBundleBtn: 'طلب الحزمة الكاملة لـ 90 يومًا',
      individualSectionTitle: 'عبوات المراحل الفردية (إمداد 30 يومًا)',
      individualSectionSubtitle:
        'اطلب العبوات بالتدريج للتقدم خطوة بخطوة في مسار البروتوكول الصحي.',
      selectPhaseBtn: 'طلب هذه العبوة',
      modalTitle: 'تأكيد طلب الشحن والتوصيل',
      modalSubtitle:
        'أدخل بيانات التواصل لتأكيد طلبيتك. يتم الدفع نقدًا عند استلام الطرد ومعاينته.',
      fullNameLabel: 'الاسم واللقب',
      phoneLabel: 'رقم الهاتف (موبايل)',
      wilayaLabel: 'الولاية (مكان التسليم)',
      confirmOrderBtn: 'تأكيد الطلب مع الدفع عند الاستلام',
      cancelBtn: 'إلغاء',
      orderSuccessTitle: 'تم تسجيل طلبك بنجاح',
      orderSuccessDesc:
        'سيتصل بك فريق التوصيل هاتفيًا خلال 24 ساعة لتأكيد إرسال الشحنة إلى عنوانك بالولاية المحددة.',
      closeBtn: 'إغلاق',
    },
    faq: {
      tag: 'قاعدة المعرفة والاستفسارات',
      title: 'الأسئلة الشائعة',
      subtitle:
        'إجابات مباشرة ووافية حول تركيبات ZIRON، وهيكل بروتوكول الـ 90 يومًا، وفحص الأصالة، والتوجيهات الصحية.',
      searchPlaceholder: 'ابحث في الأسئلة باستخدام الكلمات المفتاحية...',
      allFilter: 'جميع الأسئلة',
      categories: [
        { id: 'all', label: 'جميع الأسئلة' },
        { id: 'product', label: 'المنتج والتركيبات' },
        { id: 'program', label: 'برنامج الـ 90 يومًا' },
        { id: 'shipping', label: 'الطلبات والولايات' },
        { id: 'verification', label: 'الأصالة والتحقق' },
        { id: 'safety', label: 'الإرشادات والتنبيهات الصحية' },
      ],
      items: [
        {
          category: 'product',
          question: 'ما هو ZIRON تحديدًا؟',
          answer:
            'ZIRON هو برنامج عافية ونمط حياة غذائي تتابعي مدته 90 يومًا من تطوير VIREXON BIOSCIENCES. يجمع بين المغذيات الدقيقة عالية التوافر الحيوي والروتين الصباحي المنظم لبناء الالتزام، وتعزيز الطاقة، واستدامة العادات الصحية.',
        },
        {
          category: 'product',
          question: 'كم عدد الكبسولات في كل عبوة؟',
          answer:
            'تحتوي كل عبوة مرحلية على 30 كبسولة نباتية بالضبط تكفي لإمداد 30 يومًا بمعدل كبسولة واحدة يوميًا. وتحتوي حزمة الـ 90 يومًا الكاملة على 3 عبوات بإجمالي 90 كبسولة.',
        },
        {
          category: 'product',
          question: 'هل توجد تركيبات سرية غير معلنة في المنتج؟',
          answer:
            'تلتزم VIREXON BIOSCIENCES بالإفصاح الكمي التام عن المكونات، وتتجنب أي خلطات سرية مبهمة. جميع التركيبات تستخدم عناصر مدروسة دون ملونات صناعية أو حشوات غير ضرورية.',
        },
        {
          category: 'program',
          question: 'كيف ينتظم برنامج الـ 90 يومًا؟',
          answer:
            'ينقسم البرنامج إلى 3 مراحل متتالية مدة كل منها 30 يومًا: المرحلة 01 (التأسيس والروتين الصباحي)، المرحلة 02 (استعادة النشاط وبناء الزخم)، والمرحلة 03 (التمكن والاستقلالية الذاتية). ولكل مرحلة عبوة مخصصة لها.',
        },
        {
          category: 'program',
          question: 'ماذا أفعل في حال نسيت تناول الكبسولة في يوم ما؟',
          answer:
            'اتبع بروتوكول إعادة البدء (Restart). إياك ومضاعفة الجرعة في اليوم التالي. استأنف بكل بساطة تناول كبسولة واحدة في الصباح التالي مع الماء. فالانقطاع العارض تجربة للتعلم وليس فشلاً.',
        },
        {
          category: 'shipping',
          question: 'هل يشمل التوصيل كافة الولايات الـ 58 في الجزائر؟',
          answer:
            'نعم، نوفر التوصيل السريع لجميع ولايات الوطن الـ 58 مع خيار الدفع نقدًا عند الاستلام وبغلاف محكم وسري تمامًا.',
        },
        {
          category: 'shipping',
          question: 'ما هي العملة المعتمدة لتسعير المنتجات؟',
          answer:
            'جميع الأسعار محددة بالدينار الجزائري (د.ج / DZD). السعر الحالي للعبوة الفردية هو 3,500 د.ج، وسعر حزمة الـ 90 يومًا الكاملة هو 9,500 د.ج.',
        },
        {
          category: 'verification',
          question: 'كيف أتأكد من أن عبوة المنتج أصلية وليست مقلدة؟',
          answer:
            'اخدش شريط الأمان الفضي الموجود على جانب العبوة لكشف رمز التحقق الفريد، ثم أدخله في صفحة فحص المنتج بموقعنا أو امسح رمز QR للتأكد الفوري من صحة المنتج.',
        },
        {
          category: 'verification',
          question: 'ما الفائدة من تفعيل رمزي على حسابي في المنصة؟',
          answer:
            'يتيح التفعيل الدخول إلى لوحة التحكم الشخصية، ومتابعة سلسلة الالتزام اليومي، ونيل شهادات المراحل، والمشاركة في مجتمع الأقران الموثق، ومتابعة مناهج مدرسة ZIRON.',
        },
        {
          category: 'safety',
          question: 'هل ZIRON دواء صيدلاني أو علاج سريري؟',
          answer:
            'كلا، ZIRON ليس دواءً صيدلانيًا ولا يعالج أو يشفي أي أمراض سريرية أو عضوية. إنه برنامج مكمل غذائي لتعزيز نمط الحياة الصحي. استشر دائمًا طبيبك المعتمد بخصوص احتياجاتك الصحية.',
        },
      ],
    },
  },
};

export function getPublicTranslations(locale: Locale): PublicTranslations {
  return PUBLIC_TRANSLATIONS[locale] || PUBLIC_TRANSLATIONS.en;
}
