export interface PublicCatalogItem {
  id: string;
  sku: string;
  phase: 1 | 2 | 3 | 'BUNDLE';
  name: string;
  capsuleCount: number; // Exactly 30 for phases, exactly 90 for bundle (3 x 30)
  supplyDays: number; // 30 days for phases, 90 days for bundle
  priceDzd: number | null; // Configurable DZD currency; null denotes "Price to be configured"
  description: string;
  badgeText: string;
  containerColorHex: string;
  colorName: string;
}

export interface SiteContent {
  brand: {
    name: 'VIREXON BIOSCIENCES';
    product: 'ZIRON';
    tagline: string;
    nonMedicalDisclaimer: string;
    manufacturingNotice: string;
  };
  nav: {
    product: string;
    program: string;
    science: string;
    quality: string;
    community: string;
    school: string;
    verify: string;
    shop: string;
    about: string;
    restart: string;
    faq: string;
    login: string;
    register: string;
    verifyProduct: string;
    menu: string;
    close: string;
    commandCenter?: string;
    dossier?: string;
    protocolAndProducts?: string;
    standardsAndVerification?: string;
    corporateGovernance?: string;
    mandatoryDisclosure?: string;
    rightsReserved?: string;
    algeriaMarketTag?: string;
  };
  home: {
    heroTag: string;
    heroTitle: string;
    heroSubtitle: string;
    primaryCta: string;
    secondaryCta: string;
    phasesHeader: string;
    phasesDescription: string;
    pillarTitle: string;
    pillar1Title: string;
    pillar1Desc: string;
    pillar2Title: string;
    pillar2Desc: string;
    pillar3Title: string;
    pillar3Desc: string;
    verificationSectionTitle: string;
    verificationSectionBody: string;
  };
  ziron: {
    dossierTag: string;
    title: string;
    subtitle: string;
    phase1Title: string;
    phase1Desc: string;
    phase2Title: string;
    phase2Desc: string;
    phase3Title: string;
    phase3Desc: string;
    qualityCardTitle: string;
    qualityCardBody: string;
  };
  program: {
    timelineTag: string;
    title: string;
    subtitle: string;
    tagline: string;
    phase1Title: string;
    phase1Objective: string;
    phase2Title: string;
    phase2Objective: string;
    phase3Title: string;
    phase3Objective: string;
  };
  science: {
    dossierTag: string;
    title: string;
    subtitle: string;
    pillar1Title: string;
    pillar1Body: string;
    pillar2Title: string;
    pillar2Body: string;
    evidenceDisclosure: string;
  };
  quality: {
    assuranceTag: string;
    title: string;
    subtitle: string;
    standard1Title: string;
    standard1Body: string;
    standard2Title: string;
    standard2Body: string;
    standard3Title: string;
    standard3Body: string;
    sampleNotice: string;
  };
  about: {
    tag: string;
    title: string;
    subtitle: string;
    missionTitle: string;
    missionBody: string;
    standardsTitle: string;
    standardsBody: string;
    governanceTitle: string;
    governanceBody: string;
  };
  restart: {
    tag: string;
    title: string;
    subtitle: string;
    protocolNotice: string;
    step1Title: string;
    step1Body: string;
    step2Title: string;
    step2Body: string;
    step3Title: string;
    step3Body: string;
  };
  faq: {
    tag: string;
    title: string;
    subtitle: string;
    items: Array<{ question: string; answer: string }>;
  };
  verify: {
    badge: string;
    title: string;
    subtitle: string;
    inputLabel: string;
    inputPlaceholder: string;
    verifyButton: string;
    scanQrButton: string;
    backendIntegrationNotice: string;
    securityNote: string;
  };
  shop: {
    tag: string;
    title: string;
    subtitle: string;
    bundleTitle: string;
    bundleSubtitle: string;
    bundleSpecs: string;
    addToCart: string;
    orderBundle: string;
    individualTitle: string;
  };
  school: {
    heroBadge: string;
    heroTitle: string;
    heroSubtitle: string;
    enterPortalBtn: string;
    enrollBtn: string;
    verifyCodeBtn: string;
    tracksAvailable: string;
    trackNumber: string;
    qualificationNotice: string;
  };
  community: {
    heroBadge: string;
    heroTitle: string;
    heroSubtitle: string;
    enterCommunityBtn: string;
    enrollBtn: string;
    verifyCodeBtn: string;
    shieldTitle: string;
    shieldDesc: string;
    cohortTitle: string;
    cohortDesc: string;
    moderationTitle: string;
    moderationDesc: string;
  };
  footer: {
    description: string;
    mandatoryHealthNotice: string;
    copyrightNotice: string;
    securityTag: string;
  };
}
