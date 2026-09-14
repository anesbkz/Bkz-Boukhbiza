import { Locale } from '@/types';

export interface AppTranslations {
  common: {
    backToDashboard: string;
    loading: string;
    authenticating: string;
    verifying: string;
    status: string;
    active: string;
    locked: string;
    unlocked: string;
    verified: string;
    serial: string;
    code: string;
    date: string;
    phase: string;
    continue: string;
    cancel: string;
    save: string;
    saving: string;
    search: string;
    all: string;
    hours: string;
    modules: string;
    brandNotice: string;
    returnHome: string;
    signIn: string;
    logout: string;
    commandCenter: string;
    publicSite: string;
  };
  shell: {
    platformTitle: string;
    participant: string;
    customerRole: string;
    navDashboard: string;
    navJourney: string;
    navProducts: string;
    navActivate: string;
    navCommunity: string;
    navSchool: string;
    navRewards: string;
    navCertificates: string;
    navProfile: string;
    authRequiredTitle: string;
    authRequiredDesc: string;
    footerDisclaimer: string;
    lockHintCommunity: string;
    lockHintSchool: string;
  };
  school: {
    curriculumAccessActive: string;
    title: string;
    subtitle: string;
    lockedTitle: string;
    lockedDesc: string;
    ruleExplanation: string;
    progressLabel: string;
    zeroContainersMsg: string;
    oneContainerMsg: string;
    twoContainersMsg: string;
    threeContainersMsg: string;
    activateFirstBtn: string;
    activateAnotherBtn: string;
    activeTrack: string;
    loadingCourses: string;
    noCoursesTitle: string;
    noCoursesDesc: string;
    viewCurriculumBtn: string;
    difficultyBeginner: string;
    difficultyIntermediate: string;
    difficultyAdvanced: string;
    hoursCount: string;
    containersUnlockedBadge: string;
    publicHeroBadge: string;
    publicHeroTitle: string;
    publicHeroSubtitle: string;
    enterPortalBtn: string;
    enrollBtn: string;
    verifyCodeBtn: string;
    tracksAvailable: string;
    trackNumber: string;
  };
  community: {
    heroBadge: string;
    title: string;
    subtitle: string;
    lockedTitle: string;
    lockedDesc: string;
    announcementsTitle: string;
    discussionForumTitle: string;
    newPostBtn: string;
    createPostTitle: string;
    postTitleLabel: string;
    postTitlePlaceholder: string;
    postBodyLabel: string;
    postBodyPlaceholder: string;
    submitPostBtn: string;
    publishing: string;
    noPostsYet: string;
    noPostsDesc: string;
    commentsCount: string;
    likesCount: string;
    pinnedBadge: string;
    publicShieldTitle: string;
    publicShieldDesc: string;
    publicCohortTitle: string;
    publicCohortDesc: string;
    publicModerationTitle: string;
    publicModerationDesc: string;
  };
  activate: {
    tamperSealBadge: string;
    title: string;
    subtitle: string;
    inputLabel: string;
    inputPlaceholder: string;
    submitBtn: string;
    verifyingBtn: string;
    successBadge: string;
    successTitle: string;
    successDesc: string;
    grantedEntitlements: string;
    schoolUnlockedNotice: string;
    schoolProgressNotice: string;
    alreadyActivatedError: string;
    invalidCodeError: string;
    goToDashboardBtn: string;
    enterSchoolBtn: string;
    enterCommunityBtn: string;
    activateAnotherBtn: string;
    containerSpecsTitle: string;
    containerSpecsDesc: string;
  };
  dashboard: {
    dossierBadge: string;
    profileCompleteness: string;
    editProfileBtn: string;
    noProductLinkedBadge: string;
    noProductLinkedTitle: string;
    noProductLinkedDesc: string;
    activateProductBtn: string;
    productActiveBadge: string;
    activeEntitlementsCount: string;
    viewJourneyBtn: string;
    manageProductsBtn: string;
    communityCardTitle: string;
    communityCardDescUnlocked: string;
    communityCardDescLocked: string;
    openForumBtn: string;
    schoolCardTitle: string;
    schoolCardDescUnlocked: string;
    schoolCardDescLocked: string;
    openSchoolBtn: string;
    activateToUnlockBtn: string;
    journeyCardTitle: string;
    journeyCardDescActive: string;
    journeyCardDescInactive: string;
    schoolProgressBadge: string;
  };
  products: {
    registryBadge: string;
    title: string;
    subtitle: string;
    activateNewBtn: string;
    emptyTitle: string;
    emptyDesc: string;
    emptyBtn: string;
    activatedContainersCount: string;
    activeAndVerified: string;
    capsuleSpecs: string;
    authenticityProtocolTitle: string;
    authenticityProtocolDesc: string;
    linkedEntitlements: string;
  };
  journey: {
    headerBadge: string;
    title: string;
    subtitle: string;
    statusActive: string;
    startedDate: string;
    phase1Title: string;
    phase1Desc: string;
    phase2Title: string;
    phase2Desc: string;
    phase3Title: string;
    phase3Desc: string;
    phaseDays: string;
    currentStage: string;
    resourcesTitle: string;
    resourcesSubtitle: string;
    learningCardTitle: string;
    learningCardDesc: string;
    communityCardTitle: string;
    communityCardDesc: string;
    milestonesTitle: string;
    milestonesEmptyTitle: string;
    milestonesEmptyDesc: string;
    verificationComplete: string;
    day30Review: string;
    day60Review: string;
    day90Review: string;
  };
  rewards: {
    headerBadge: string;
    title: string;
    subtitle: string;
    levelLabel: string;
    totalXpLabel: string;
    foundationTitle: string;
    foundationDesc: string;
    checkpoint30Title: string;
    checkpoint30Desc: string;
    curriculumMasteryTitle: string;
    curriculumMasteryDesc: string;
    peerEngagementTitle: string;
    peerEngagementDesc: string;
    returnToJourneyBtn: string;
    activateProductBtn: string;
  };
  certificates: {
    registryBadge: string;
    title: string;
    subtitle: string;
    browseCurriculaBtn: string;
    emptyTitle: string;
    emptyDesc: string;
    exploreSchoolBtn: string;
    verificationStandardTitle: string;
    verificationStandardDesc: string;
    returnToDashboardBtn: string;
    educationalDisclaimer: string;
    viewCredential: string;
    printCertificate: string;
    copyVerificationLink: string;
    linkCopied: string;
    certificateNumber: string;
    issuedTo: string;
    course: string;
    issuedDate: string;
    completionDate: string;
    issuingAuthority: string;
    status: string;
    statusActive: string;
    statusRevoked: string;
    verifyTitle: string;
    verifySubtitle: string;
    enterCertificateNumber: string;
    verifyButton: string;
    verifying: string;
    validCredentialTitle: string;
    revokedCredentialTitle: string;
    notFoundTitle: string;
    notFoundDesc: string;
    revocationReason: string;
    claimCertificateBtn: string;
    claimingCertificate: string;
    claimSuccess: string;
    adminTitle: string;
    adminSubtitle: string;
    revokeAction: string;
    revokingAction: string;
    revokeModalTitle: string;
    revokeModalDesc: string;
    revokeReasonPlaceholder: string;
    cancel: string;
    confirmRevocation: string;
  };
  login: {
    gatewayBadge: string;
    title: string;
    subtitle: string;
    emailLabel: string;
    emailPlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    submitBtn: string;
    authenticatingBtn: string;
    needAccountPrompt: string;
    enrollLink: string;
    forgotPasswordLink: string;
    invalidCredentialsError: string;
    throttledError: string;
  };
}

export const APP_TRANSLATIONS: Record<Locale, AppTranslations> = {
  en: {
    common: {
      backToDashboard: 'Back to Dashboard',
      loading: 'Loading...',
      authenticating: 'Authenticating...',
      verifying: 'Verifying...',
      status: 'Status',
      active: 'Active',
      locked: 'Locked',
      unlocked: 'Unlocked',
      verified: 'Verified',
      serial: 'Serial',
      code: 'Code',
      date: 'Date',
      phase: 'Phase',
      continue: 'Continue',
      cancel: 'Cancel',
      save: 'Save',
      saving: 'Saving...',
      search: 'Search',
      all: 'All',
      hours: 'Hours',
      modules: 'Modules',
      brandNotice: 'ZIRON by VIREXON BIOSCIENCES',
      returnHome: 'Return Home',
      signIn: 'Sign In',
      logout: 'Logout',
      commandCenter: 'Command Center',
      publicSite: 'Public Site',
    },
    shell: {
      platformTitle: 'VIREXON BIOSCIENCES | ZIRON Digital Platform',
      participant: 'Participant',
      customerRole: 'Customer',
      navDashboard: 'Dashboard',
      navJourney: 'My Journey',
      navProducts: 'My Products',
      navActivate: 'Activate Product',
      navCommunity: 'Community',
      navSchool: 'Restart School',
      navRewards: 'Rewards',
      navCertificates: 'Certificates',
      navProfile: 'Profile',
      authRequiredTitle: 'Authentication Required',
      authRequiredDesc: 'Please authenticate your verified customer profile to access the personalized ZIRON platform.',
      footerDisclaimer: 'Educational & wellness support platform. Neutral bio-scientific research guidance.',
      lockHintCommunity: 'Activate a container to unlock Community',
      lockHintSchool: 'Activate 3 different containers to unlock Restart School',
    },
    school: {
      curriculumAccessActive: 'Curriculum Access Active',
      title: 'Restart School of Applied Mastery',
      subtitle: 'Explore dynamic modular courses across biological, technological, and enterprise tracks.',
      lockedTitle: 'Restart School Locked',
      lockedDesc: 'Access to the educational curricula requires activating 3 different ZIRON product containers.',
      ruleExplanation: 'Activate 3 different containers to unlock Restart School.',
      progressLabel: 'School Qualification Progress',
      zeroContainersMsg: 'Activate your first container to begin.',
      oneContainerMsg: 'Activate 2 more containers to unlock School.',
      twoContainersMsg: 'Activate 1 more container to unlock School.',
      threeContainersMsg: 'Restart School is unlocked.',
      activateFirstBtn: 'Activate a container',
      activateAnotherBtn: 'Activate another container',
      activeTrack: 'Active Track',
      loadingCourses: 'Loading courses from Firestore...',
      noCoursesTitle: 'No courses published in this track yet',
      noCoursesDesc: 'Curriculum modules for this track are currently being finalized by the scientific and academic advisory board.',
      viewCurriculumBtn: 'View Curriculum Modules',
      difficultyBeginner: 'Foundational',
      difficultyIntermediate: 'Applied Intermediate',
      difficultyAdvanced: 'Advanced Mastery',
      hoursCount: 'Hours',
      containersUnlockedBadge: 'Containers Activated • School Unlocked',
      publicHeroBadge: 'Continuous Mastery & Curricula',
      publicHeroTitle: 'The ZIRON School of Biopharma & Applied Mastery',
      publicHeroSubtitle: 'A dynamic educational ecosystem bridging human biology, metabolic optimization, precision agriculture, digital literacy, and high-impact enterprise execution.',
      enterPortalBtn: 'Enter School Portal',
      enrollBtn: 'Enroll to Unlock Curricula',
      verifyCodeBtn: 'Verify Container Code',
      tracksAvailable: 'Tracks Available',
      trackNumber: 'Track',
    },
    community: {
      heroBadge: 'Subject Collaboration Network',
      title: 'The ZIRON Verified Community',
      subtitle: 'A private, moderated forum connecting participants traversing the 90-day biological trajectory.',
      lockedTitle: 'Community Forum Access Locked',
      lockedDesc: 'Participating in community discussions requires at least one active product container activation.',
      announcementsTitle: 'Official Announcements & Protocol Guidance',
      discussionForumTitle: 'Participant Discussions',
      newPostBtn: 'Create Discussion Post',
      createPostTitle: 'New Community Discussion',
      postTitleLabel: 'Subject / Title',
      postTitlePlaceholder: 'E.g., Morning routine adaptation in Phase 01...',
      postBodyLabel: 'Discussion Content',
      postBodyPlaceholder: 'Share your biometric observations, diet timing, or questions...',
      submitPostBtn: 'Publish Discussion',
      publishing: 'Publishing...',
      noPostsYet: 'No discussions published yet',
      noPostsDesc: 'Be the first authenticated participant to initiate a discussion thread.',
      commentsCount: 'Comments',
      likesCount: 'Helpful',
      pinnedBadge: 'Official Advisory',
      publicShieldTitle: 'Verified Physical Ownership',
      publicShieldDesc: 'Entry requires serial verification from a genuine ZIRON 30-capsule phase container, ensuring discussions remain evidence-based and authentic.',
      publicCohortTitle: 'Phase-Cohort Synchrony',
      publicCohortDesc: 'Connect with subjects currently in Phase 01, Phase 02, or Phase 03 to compare trajectories.',
      publicModerationTitle: 'Scientific Oversight',
      publicModerationDesc: 'Dedicated bio-scientific moderators ensure peer interactions remain constructive, safe, and aligned with evidence standards.',
    },
    activate: {
      tamperSealBadge: 'Cryptographic Tamper-Seal Verification',
      title: 'Activate ZIRON Product',
      subtitle: 'Link your physical ZIRON 30-capsule container to your verified participant dossier to unlock full community and educational privileges.',
      inputLabel: 'Container Verification Code',
      inputPlaceholder: 'Enter code from security seal (e.g. ZR-XXXX-XXXX)',
      submitBtn: 'Activate Container',
      verifyingBtn: 'Verifying Security Seal...',
      successBadge: 'Activation Successful',
      successTitle: 'Container Verified & Linked',
      successDesc: 'has been permanently associated with your participant profile.',
      grantedEntitlements: 'Granted Authoritative Entitlements:',
      schoolUnlockedNotice: 'Restart School has been unlocked!',
      schoolProgressNotice: 'containers activated towards Restart School.',
      alreadyActivatedError: 'This container code has already been activated and cannot be reused.',
      invalidCodeError: 'Invalid container code. Please check the alphanumeric characters on your container seal and try again.',
      goToDashboardBtn: 'Return to Dashboard',
      enterSchoolBtn: 'Access Restart School',
      enterCommunityBtn: 'Enter Community',
      activateAnotherBtn: 'Activate Another Container',
      containerSpecsTitle: 'Physical Container Specifications',
      containerSpecsDesc: 'Each genuine ZIRON container contains 30 vegetarian capsules corresponding to a 30-day sequential protocol segment.',
    },
    dashboard: {
      dossierBadge: 'Participant Profile Dossier',
      profileCompleteness: 'Profile Completeness',
      editProfileBtn: 'Edit Profile',
      noProductLinkedBadge: 'No Product Linked',
      noProductLinkedTitle: 'Activate your ZIRON product',
      noProductLinkedDesc: 'Enter the unique cryptographic verification code found on the security seal of your ZIRON 30-capsule container. Activating unlocks the Peer Community and counts towards Restart School.',
      activateProductBtn: 'Activate Product',
      productActiveBadge: 'Verified Product Container Active',
      activeEntitlementsCount: 'Active Entitlements',
      viewJourneyBtn: 'View My Journey',
      manageProductsBtn: 'Manage Products',
      communityCardTitle: 'ZIRON Community',
      communityCardDescUnlocked: 'Access verified peer discussions, research updates, and official broadcast announcements.',
      communityCardDescLocked: 'Requires active product activation. Unlocks peer support and official scientific updates.',
      openForumBtn: 'Open Forum',
      schoolCardTitle: 'Restart School',
      schoolCardDescUnlocked: 'Access structured curricula across digital literacy, precision agriculture, and applied competencies.',
      schoolCardDescLocked: 'Activate 3 different containers to unlock Restart School curricula and certificates.',
      openSchoolBtn: 'Open School',
      activateToUnlockBtn: 'Activate to Unlock',
      journeyCardTitle: 'Your ZIRON Journey',
      journeyCardDescActive: 'Track your educational progress, community milestones, and personalized wellness resources.',
      journeyCardDescInactive: 'Start your journey by verifying your product container to begin structured phase tracking.',
      schoolProgressBadge: 'School Progress',
    },
    products: {
      registryBadge: 'Verified Registry',
      title: 'My Products',
      subtitle: 'Review your authenticated ZIRON product containers, verified lot authorizations, and linked platform entitlements.',
      activateNewBtn: 'Activate New Code',
      emptyTitle: 'No Activated Products Recorded',
      emptyDesc: 'You have not verified any ZIRON product containers yet. Activate the serialized code from your container packaging to link your product and unlock full platform privileges.',
      emptyBtn: 'Activate Your First Container',
      activatedContainersCount: 'Activated Containers',
      activeAndVerified: 'Active & Verified',
      capsuleSpecs: 'Standard 30-day oral nutraceutical bio-alignment phase container.',
      authenticityProtocolTitle: 'Authenticity & Serial Protection Protocol',
      authenticityProtocolDesc: 'Every individual ZIRON container is produced under strict quality standards and assigned a unique single-use cryptographic serial. Each code can be linked to exactly one verified customer dossier.',
      linkedEntitlements: 'Linked Entitlements',
    },
    journey: {
      headerBadge: 'Structured Wellness & Education',
      title: 'Your ZIRON Journey',
      subtitle: 'Follow your structured trajectory combining nutritional bio-support, applied educational curricula, and verified peer community exchange.',
      statusActive: 'Status: Active',
      startedDate: 'Started',
      phase1Title: 'Phase 01: Foundation',
      phase1Desc: 'Establishing metabolic alignment, baseline routine adherence, and foundational health habits.',
      phase2Title: 'Phase 02: Optimization',
      phase2Desc: 'Deepening nutritional consistency, cognitive clarity, and physical vitality.',
      phase3Title: 'Phase 03: Stabilization',
      phase3Desc: 'Long-term metabolic equilibrium, habit permanence, and advanced wellness resilience.',
      phaseDays: '30 Days',
      currentStage: 'Current Stage',
      resourcesTitle: 'Available Resources',
      resourcesSubtitle: 'Integrated components of your ZIRON trajectory.',
      learningCardTitle: 'Applied Learning',
      learningCardDesc: 'Access modular courses and practical masterclasses in Restart School.',
      communityCardTitle: 'Peer Community',
      communityCardDesc: 'Connect with participants at similar stages of the 90-day trajectory.',
      milestonesTitle: 'Your Progress & Future Milestones',
      milestonesEmptyTitle: 'Milestones Awaiting Initial Activation',
      milestonesEmptyDesc: 'Milestone tracking and adherence logging become available once your initial ZIRON container is activated.',
      verificationComplete: 'Container Verification Complete',
      day30Review: 'Day 30 Biomarker & Adherence Review',
      day60Review: 'Day 60 Trajectory Midpoint Assessment',
      day90Review: 'Day 90 Comprehensive Protocol Conclusion',
    },
    rewards: {
      headerBadge: 'Milestone Rewards Registry',
      title: 'ZIRON Rewards & Milestones',
      subtitle: 'Track your trajectory consistency, protocol check-in milestones, and educational achievements across the ZIRON ecosystem.',
      levelLabel: 'Level',
      totalXpLabel: 'Total XP',
      foundationTitle: 'Milestone Rewards Architecture',
      foundationDesc: 'The ZIRON reward engine recognizes adherence consistency and course curriculum milestones as you progress through the ecosystem.',
      checkpoint30Title: '30-Day Checkpoint',
      checkpoint30Desc: 'Unlock Phase 01 adherence badge upon completing your initial 30 days.',
      curriculumMasteryTitle: 'Curriculum Mastery',
      curriculumMasteryDesc: 'Earn verified completion badges by finishing courses in Restart School.',
      peerEngagementTitle: 'Peer Collaboration',
      peerEngagementDesc: 'Gain XP by contributing helpful scientific insights in the verified community forum.',
      returnToJourneyBtn: 'Return to Journey',
      activateProductBtn: 'Activate Product',
    },
    certificates: {
      registryBadge: 'Credential Registry',
      title: 'Verified Certificates',
      subtitle: 'Review and share verified credentials earned through completion of accredited learning modules in Restart School.',
      browseCurriculaBtn: 'Browse School Curricula',
      emptyTitle: 'No Verified Certificates Issued Yet',
      emptyDesc: 'Certificates are issued server-authoritatively upon completing all module requirements within Restart School tracks. Complete your selected course curriculum to earn your first certified credential.',
      exploreSchoolBtn: 'Explore Restart School',
      verificationStandardTitle: 'Tamper-Proof Verification Standard',
      verificationStandardDesc: 'All Restart School certificates receive a non-enumerable public verification token stored in our public credentials registry.',
      returnToDashboardBtn: 'Return to Dashboard',
      educationalDisclaimer: 'Certificates issued by ZIRON Restart School are educational completion credentials only. They do not certify medical treatment, addiction recovery, scientific claims, or clinical outcomes.',
      viewCredential: 'View Credential',
      printCertificate: 'Print / Save PDF',
      copyVerificationLink: 'Copy Verification Link',
      linkCopied: 'Verification Link Copied!',
      certificateNumber: 'Certificate Number',
      issuedTo: 'Issued To',
      course: 'Course Curriculum',
      issuedDate: 'Issue Date',
      completionDate: 'Completion Date',
      issuingAuthority: 'Issuing Authority',
      status: 'Status',
      statusActive: 'Verified & Active',
      statusRevoked: 'Revoked',
      verifyTitle: 'Official Credential Registry',
      verifySubtitle: 'Public verification gateway for educational certificates issued by ZIRON Restart School.',
      enterCertificateNumber: 'Enter Certificate Number or Token (e.g. ZRN-CERT-2026-...)',
      verifyButton: 'Verify Authenticity',
      verifying: 'Verifying with Authority...',
      validCredentialTitle: 'Authentic Educational Credential',
      revokedCredentialTitle: 'Revoked Credential',
      notFoundTitle: 'Certificate Not Found',
      notFoundDesc: 'No official credential matching this identifier exists in the ZIRON registry.',
      revocationReason: 'Revocation Reason',
      claimCertificateBtn: 'Claim / Refresh Certificate',
      claimingCertificate: 'Issuing Certificate...',
      claimSuccess: 'Certificate Issued Successfully!',
      adminTitle: 'Certificate Governance & Registry',
      adminSubtitle: 'Inspect, audit, and manage official educational completion credentials.',
      revokeAction: 'Revoke Credential',
      revokingAction: 'Revoking...',
      revokeModalTitle: 'Revoke Educational Certificate',
      revokeModalDesc: 'Revocation is permanent and recorded in the immutable audit log. Provide an auditable compliance reason.',
      revokeReasonPlaceholder: 'State official compliance reason for revocation...',
      cancel: 'Cancel',
      confirmRevocation: 'Confirm Revocation',
    },
    login: {
      gatewayBadge: 'Secure Auth Gateway',
      title: 'Subject Authentication',
      subtitle: 'Log in to your ZIRON 90-day trajectory companion dashboard.',
      emailLabel: 'Electronic Mail / Identifier',
      emailPlaceholder: 'subject@virexon-biosciences.com',
      passwordLabel: 'Passphrase',
      passwordPlaceholder: '••••••••••••',
      submitBtn: 'Authenticate Subject Access',
      authenticatingBtn: 'Authenticating Session...',
      needAccountPrompt: 'New participant? Enroll for verified access:',
      enrollLink: 'Register Participant Dossier',
      forgotPasswordLink: 'Forgot credentials?',
      invalidCredentialsError: 'Invalid identifier or password. Please verify your credentials.',
      throttledError: 'Access temporarily throttled due to multiple attempts. Please pause and retry.',
    },
  },
  ar: {
    common: {
      backToDashboard: 'العودة إلى لوحة التحكم',
      loading: 'جارٍ التحميل...',
      authenticating: 'جارٍ التحقق من الهوية...',
      verifying: 'جارٍ فحص الرمز...',
      status: 'الحالة',
      active: 'نشط',
      locked: 'مغلق',
      unlocked: 'مفتوح',
      verified: 'تم التحقق',
      serial: 'الرقم التسلسلي',
      code: 'الرمز',
      date: 'التاريخ',
      phase: 'المرحلة',
      continue: 'متابعة',
      cancel: 'إلغاء',
      save: 'حفظ',
      saving: 'جارٍ الحفظ...',
      search: 'بحث',
      all: 'الكل',
      hours: 'ساعات',
      modules: 'وحدات',
      brandNotice: 'ZIRON من تطوير VIREXON BIOSCIENCES',
      returnHome: 'العودة إلى الرئيسية',
      signIn: 'تسجيل الدخول',
      logout: 'تسجيل الخروج',
      commandCenter: 'مركز القيادة',
      publicSite: 'الموقع الرئيسي',
    },
    shell: {
      platformTitle: 'VIREXON BIOSCIENCES | منصة ZIRON الرقمية',
      participant: 'مشارك',
      customerRole: 'عميل',
      navDashboard: 'لوحة التحكم',
      navJourney: 'مساري',
      navProducts: 'منتجاتي',
      navActivate: 'تفعيل عبوة',
      navCommunity: 'المجتمع',
      navSchool: 'مدرسة Restart',
      navRewards: 'المكافآت',
      navCertificates: 'الشهادات',
      navProfile: 'الملف الشخصي',
      authRequiredTitle: 'يتطلب التحقق من الهوية',
      authRequiredDesc: 'يرجى تسجيل الدخول إلى ملف المشارك المعتمد للوصول إلى منصة ZIRON الشخصية.',
      footerDisclaimer: 'منصة دعم تعليمي وعافية منظمة. إرشاد علمي وبحثي محايد.',
      lockHintCommunity: 'فعّل عبوة لفتح المجتمع',
      lockHintSchool: 'فعّل 3 عبوات مختلفة لفتح مدرسة Restart',
    },
    school: {
      curriculumAccessActive: 'الوصول إلى المناهج التعليمية متاح',
      title: 'مدرسة Restart للتمكن التطبيقي',
      subtitle: 'استكشف دورات تدريبية نموذجية متكاملة عبر مسارات التكنولوجيا والزراعة الدقيقة والمشاريع الريادية.',
      lockedTitle: 'مدرسة Restart مغلقة',
      lockedDesc: 'يتطلب فتح المناهج التعليمية تفعيل 3 عبوات منتجات ZIRON مختلفة بنجاح.',
      ruleExplanation: 'فعّل 3 عبوات مختلفة لفتح مدرسة Restart.',
      progressLabel: 'مستوى التقدم لفتح المدرسة',
      zeroContainersMsg: 'فعّل عبوتك الأولى للبدء.',
      oneContainerMsg: 'فعّل عبوتين إضافيتين لفتح مدرسة Restart.',
      twoContainersMsg: 'فعّل عبوة واحدة إضافية لفتح مدرسة Restart.',
      threeContainersMsg: 'مدرسة Restart مفتوحة الآن.',
      activateFirstBtn: 'تفعيل عبوة',
      activateAnotherBtn: 'تفعيل عبوة أخرى',
      activeTrack: 'المسار النشط',
      loadingCourses: 'جارٍ تحميل الدورات من قاعدة البيانات...',
      noCoursesTitle: 'لا توجد دورات منشورة في هذا المسار حاليًا',
      noCoursesDesc: 'يجري اعتماد الوحدات التعليمية لهذا المسار من قبل الهيئة الاستشارية العلمية والأكاديمية.',
      viewCurriculumBtn: 'عرض وحدات المنهج',
      difficultyBeginner: 'تأسيسي',
      difficultyIntermediate: 'تطبيقي متوسط',
      difficultyAdvanced: 'تمكن متقدم',
      hoursCount: 'ساعات',
      containersUnlockedBadge: 'تم تفعيل العبوات • المدرسة مفتوحة',
      publicHeroBadge: 'التعلم المستمر والمناهج التطبيقية',
      publicHeroTitle: 'مدرسة ZIRON للعلوم الحيوية والتمكن التطبيقي',
      publicHeroSubtitle: 'منظومة تعليمية متكاملة تربط بين البيولوجيا البشرية، والتغذية الحيوية، والزراعة الدقيقة، ومحو الأمية الرقمية، وبناء المشاريع ذات الأثر.',
      enterPortalBtn: 'دخول بوابة المدرسة',
      enrollBtn: 'الانضمام لفتح المناهج',
      verifyCodeBtn: 'التحقق من رمز العبوة',
      tracksAvailable: 'مسارات متاحة',
      trackNumber: 'المسار',
    },
    community: {
      heroBadge: 'شبكة تواصل المشاركين',
      title: 'مجتمع ZIRON المعتمد',
      subtitle: 'منتدى خاص ومراقب يجمع المشاركين خلال مسار الـ 90 يومًا لتبادل الخبرات وتنسيق البروتوكول.',
      lockedTitle: 'المنتدى المجتمعي مغلق',
      lockedDesc: 'تتطلب المشاركة في مناقشات المجتمع تفعيل عبوة منتج واحدة على الأقل.',
      announcementsTitle: 'الإعلانات الرسمية والتوجيهات العلمية',
      discussionForumTitle: 'مناقشات المشاركين',
      newPostBtn: 'إنشاء موضوع نقاش جديد',
      createPostTitle: 'موضوع نقاش جديد',
      postTitleLabel: 'عنوان الموضوع',
      postTitlePlaceholder: 'مثال: تنظيم الروتين الصباحي في المرحلة الأولى...',
      postBodyLabel: 'محتوى الموضوع',
      postBodyPlaceholder: 'شارك ملاحظاتك الحيوية، مواعيد الوجبات، أو استفساراتك مع المشاركين...',
      submitPostBtn: 'نشر الموضوع',
      publishing: 'جارٍ النشر...',
      noPostsYet: 'لا توجد مناقشات منشورة بعد',
      noPostsDesc: 'كن أول مشارك معتمد يطرح موضوعًا للنقاش في هذا المجتمع.',
      commentsCount: 'تعليقات',
      likesCount: 'مفيد',
      pinnedBadge: 'توجيه رسمي',
      publicShieldTitle: 'ملكية موثقة للمنتج',
      publicShieldDesc: 'يتطلب الدخول التحقق التسلسلي من عبوة حقيقية تحوي 30 كبسولة من ZIRON لضمان مصداقية المشاركات وواقعيتها.',
      publicCohortTitle: 'توافق المراحل التتابعية',
      publicCohortDesc: 'تواصل مع مشاركين يمرون حاليًا بنفس مرحلتك (المرحلة 01، المرحلة 02، أو المرحلة 03) لمقارنة النتائج.',
      publicModerationTitle: 'إشراف علمي متخصص',
      publicModerationDesc: 'يشرف خبراء ومختصون على سلامة المعلومات وضمان التزام النقاشات بالمعايير العلمية السليمة.',
    },
    activate: {
      tamperSealBadge: 'التحقق الرقمي المشفر من ختم الأمان',
      title: 'تفعيل منتج ZIRON',
      subtitle: 'اربط عبوتك المادية المكونة من 30 كبسولة من ZIRON بملف مشاركتك المعتمد لفتح كامل المزايا التعليمية والمجتمعية.',
      inputLabel: 'رمز التحقق الخاص بالعبوة',
      inputPlaceholder: 'أدخل الرمز المطبوع على ختم الأمان (مثال: ZR-XXXX-XXXX)',
      submitBtn: 'تفعيل العبوة',
      verifyingBtn: 'جارٍ التحقق من ختم الأمان...',
      successBadge: 'تم التفعيل بنجاح',
      successTitle: 'تم التحقق من العبوة وربطها بنجاح',
      successDesc: 'تم ربطه بشكل دائم بملف المشارك الخاص بك.',
      grantedEntitlements: 'الصلاحيات الممنوحة رسميًا:',
      schoolUnlockedNotice: 'تم فتح مدرسة Restart بنجاح!',
      schoolProgressNotice: 'عبوات مفعلة لفتح مدرسة Restart.',
      alreadyActivatedError: 'تم تفعيل رمز هذه العبوة مسبقًا ولا يمكن إعادة استخدامه.',
      invalidCodeError: 'رمز العبوة غير صحيح. يرجى مراجعة الحروف والأرقام المطبوعة على ختم العبوة والمحاولة مجددًا.',
      goToDashboardBtn: 'العودة إلى لوحة التحكم',
      enterSchoolBtn: 'الدخول إلى مدرسة Restart',
      enterCommunityBtn: 'دخول المجتمع',
      activateAnotherBtn: 'تفعيل عبوة أخرى',
      containerSpecsTitle: 'مواصفات العبوة المادية',
      containerSpecsDesc: 'تحتوي كل عبوة أصلية من ZIRON على 30 كبسولة نباتية تغطي مرحلة بروتوكول مدتها 30 يومًا متواصلاً.',
    },
    dashboard: {
      dossierBadge: 'ملف المشارك المعتمد',
      profileCompleteness: 'اكتمال الملف الشخصي',
      editProfileBtn: 'تعديل الملف',
      noProductLinkedBadge: 'لا يوجد منتج مرتبط',
      noProductLinkedTitle: 'فعّل منتج ZIRON الخاص بك',
      noProductLinkedDesc: 'أدخل رمز التحقق الفريد المطبوع على ختم الأمان لعبوة ZIRON المكونة من 30 كبسولة لفتح مجتمع المشاركين والتقدم نحو مدرسة Restart.',
      activateProductBtn: 'تفعيل المنتج',
      productActiveBadge: 'عبوة منتج معتمدة ونشطة',
      activeEntitlementsCount: 'صلاحيات نشطة',
      viewJourneyBtn: 'عرض مساري',
      manageProductsBtn: 'إدارة المنتجات',
      communityCardTitle: 'مجتمع ZIRON',
      communityCardDescUnlocked: 'الوصول إلى مناقشات المشاركين، التحديثات البحثية، والتوجيهات الرسمية المعتمدة.',
      communityCardDescLocked: 'يتطلب تفعيل عبوة منتج واحدة على الأقل لفتح منتدى الدعم المجتمعي.',
      openForumBtn: 'فتح المنتدى',
      schoolCardTitle: 'مدرسة Restart',
      schoolCardDescUnlocked: 'الوصول إلى المناهج التعليمية في التكنولوجيا، الزراعة الدقيقة، ومجالات التمكن التطبيقي.',
      schoolCardDescLocked: 'فعّل 3 عبوات مختلفة لفتح مدرسة Restart والحصول على الشهادات المعتمدة.',
      openSchoolBtn: 'فتح مدرسة Restart',
      activateToUnlockBtn: 'تفعيل لفتح الوصول',
      journeyCardTitle: 'مسارك في ZIRON',
      journeyCardDescActive: 'تابع تقدمك المعرفي، محطاتك التتابعية، ومصادر الدعم الصحي المخصصة لك.',
      journeyCardDescInactive: 'ابدأ مسارك بالتحقق من عبوة المنتج لتدشين خطة المتابعة بالمراحل.',
      schoolProgressBadge: 'التقدم نحو مدرسة Restart',
    },
    products: {
      registryBadge: 'السجل المعتمد',
      title: 'منتجاتي',
      subtitle: 'استعرض عبوات ZIRON الموثقة الخاصة بك، تراخيص الدفعات المعتمدة، والصلاحيات المرتبطة بحسابك.',
      activateNewBtn: 'تفعيل رمز جديد',
      emptyTitle: 'لم يتم تسجيل أي منتجات مفعلة حتى الآن',
      emptyDesc: 'لم تقم بتوثيق أي عبوات منتجات ZIRON بعد. قم بتفعيل الرمز التسلسلي المطبوع على عبوتك لربط المنتج وفتح كامل الامتيازات.',
      emptyBtn: 'تفعيل عبوتك الأولى',
      activatedContainersCount: 'العبوات المفعلة',
      activeAndVerified: 'نشطة وموثقة',
      capsuleSpecs: 'عبوة قياسية للمرحلة التتابعية بـ 30 كبسولة لـ 30 يومًا.',
      authenticityProtocolTitle: 'بروتوكول حماية الأصالة والترميز التسلسلي',
      authenticityProtocolDesc: 'تُصنع كل عبوة من عبوات ZIRON وفق أعلى معايير الجودة وتُمنح رقمًا تسلسليًا مشفرًا أحادي الاستخدام يمكن ربطه بملف عميل معتمد واحد فقط.',
      linkedEntitlements: 'الصلاحيات المرتبطة',
    },
    journey: {
      headerBadge: 'عافية هيكلية وتعليم تطبيقي',
      title: 'مسارك في ZIRON',
      subtitle: 'اتبع مسارك المنظم الذي يجمع بين الدعم الغذائي الحيوي، والمناهج المعرفية التطبيقية، والتواصل مع مجتمع المشاركين.',
      statusActive: 'الحالة: نشط',
      startedDate: 'تاريخ البدء',
      phase1Title: 'المرحلة 01: التأسيس',
      phase1Desc: 'بناء التوافق الحيوي، الانتظام في الروتين اليومي، وتثبيت العادات الصحية الأساسية.',
      phase2Title: 'المرحلة 02: التحسين المستمر',
      phase2Desc: 'تعميق الاستمرارية الغذائية، تعزيز النشاط الذهني، ورفع الحيوية الجسدية.',
      phase3Title: 'المرحلة 03: الاستقرار والاستدامة',
      phase3Desc: 'ترسيخ التوازن الحيوي، استدامة العادات المكتسبة، والمرونة الصحية طويلة الأمد.',
      phaseDays: '30 يومًا',
      currentStage: 'المرحلة الحالية',
      resourcesTitle: 'المصادر والخدمات المتاحة',
      resourcesSubtitle: 'المكونات المدمجة لمسار ZIRON الخاص بك.',
      learningCardTitle: 'التعليم التطبيقي',
      learningCardDesc: 'الوصول إلى الدورات التدريبية والدروس التطبيقية في مدرسة Restart.',
      communityCardTitle: 'مجتمع الزملاء',
      communityCardDesc: 'تواصل مع المشاركين الذين يمرون بنفس مراحل مسار الـ 90 يومًا.',
      milestonesTitle: 'مستوى تقدمك والمحطات القادمة',
      milestonesEmptyTitle: 'المحطات بانتظار التفعيل الأولي',
      milestonesEmptyDesc: 'يصبح تتبع المحطات وسجل الالتزام متاحاً بمجرد تفعيل عبوتك الأولى من ZIRON.',
      verificationComplete: 'اكتمل التحقق من العبوة',
      day30Review: 'مراجعة المؤشرات الحيوية والالتزام لليوم 30',
      day60Review: 'تقييم منتصف المسار عند اليوم 60',
      day90Review: 'اختتام البروتوكول الشامل عند اليوم 90',
    },
    rewards: {
      headerBadge: 'سجل المكافآت والإنجازات',
      title: 'مكافآت وإنجازات ZIRON',
      subtitle: 'تتبع انتظامك في البروتوكول، نقاط الالتزام بالمراحل، ومحطاتك التعليمية عبر منظومة ZIRON.',
      levelLabel: 'المستوى',
      totalXpLabel: 'إجمالي نقاط الخبرة XP',
      foundationTitle: 'هيكلية نظام المكافآت',
      foundationDesc: 'صُمم محرك المكافآت لمكافأة الالتزام والانضباط اليومي وإتمام المسارات التعليمية ضمن المنظومة.',
      checkpoint30Title: 'محطة الـ 30 يومًا',
      checkpoint30Desc: 'احصل على وسام إتمام المرحلة الأولى بمجرد استكمال التناول المنضبط للأيام الثلاثين الأولى.',
      curriculumMasteryTitle: 'التمكن المعرفي',
      curriculumMasteryDesc: 'احصل على شارات الإنجاز عند إتمام الدورات التدريبية في مدرسة Restart.',
      peerEngagementTitle: 'المشاركة الفعالة',
      peerEngagementDesc: 'اكتسب نقاط خبرة إضافية بمشاركة تجاربك البناءة وإفادة الزملاء في منتدى المجتمع.',
      returnToJourneyBtn: 'العودة إلى مساري',
      activateProductBtn: 'تفعيل عبوة',
    },
    certificates: {
      registryBadge: 'سجل الشهادات والاعتمادات',
      title: 'الشهادات المعتمدة',
      subtitle: 'استعرض وشارك الشهادات الموثقة التي حصلت عليها عند إتمام المسارات التدريبية في مدرسة Restart.',
      browseCurriculaBtn: 'تصفح مناهج المدرسة',
      emptyTitle: 'لم تصدر أي شهادات معتمدة بعد',
      emptyDesc: 'تُصدر الشهادات بشكل رسمي وآلي من الخادم بعد استيفاء جميع متطلبات الوحدات التعليمية ضمن مسارات مدرسة Restart. أكمل مسارك المختار للحصول على أول شهادة معتمدة.',
      exploreSchoolBtn: 'استكشاف مدرسة Restart',
      verificationStandardTitle: 'معيار التحقق المنيع ضد التلاعب',
      verificationStandardDesc: 'تحصل كل شهادة في مدرسة Restart على رمز تحقق عام غير قابل للتخمين ومسجل في قاعدة البيانات العامة للتحقق دون كشف أي بيانات شخصية.',
      returnToDashboardBtn: 'العودة إلى لوحة التحكم',
      educationalDisclaimer: 'الشهادات الصادرة عن مدرسة ZIRON Restart هي وثائق إتمام تعليمية وتدريبية حصراً، ولا تُعد اعتماداً لعلاج طبي أو تعافٍ من إدمان أو ادعاءات سريرية.',
      viewCredential: 'عرض الوثيقة المعتمدة',
      printCertificate: 'طباعة / حفظ كملف PDF',
      copyVerificationLink: 'نسخ رابط التحقق',
      linkCopied: 'تم نسخ رابط التحقق بنجاح!',
      certificateNumber: 'رقم الشهادة المعتمد',
      issuedTo: 'صدرت باسم',
      course: 'المنهج التدريبي',
      issuedDate: 'تاريخ الإصدار',
      completionDate: 'تاريخ الإتمام',
      issuingAuthority: 'الجهة المصدرة',
      status: 'الحالة الرسمية',
      statusActive: 'موثقة وسارية',
      statusRevoked: 'ملغاة رسمياً',
      verifyTitle: 'سجل التحقق من الشهادات والاعتمادات',
      verifySubtitle: 'بوابة التحقق العامة الرسمية للشهادات التعليمية الصادرة عن مدرسة ZIRON Restart.',
      enterCertificateNumber: 'أدخل رقم الشهادة أو رمز التحقق (مثال: ZRN-CERT-2026-...)',
      verifyButton: 'التحقق من صحة الوثيقة',
      verifying: 'جارٍ التحقق من السجل الرسمي...',
      validCredentialTitle: 'شهادة تعليمية أصلية ومعتمدة',
      revokedCredentialTitle: 'شهادة تعليمية ملغاة رسمياً',
      notFoundTitle: 'لم يتم العثور على الشهادة',
      notFoundDesc: 'لا توجد وثيقة مطابقة للمعرف المدخل في السجل الرسمي المعتمد.',
      revocationReason: 'سبب الإلغاء',
      claimCertificateBtn: 'إصدار / تحديث الشهادة',
      claimingCertificate: 'جارٍ إصدار الشهادة من الخادم...',
      claimSuccess: 'تم إصدار الشهادة بنجاح!',
      adminTitle: 'إدارة وحوكمة سجل الشهادات',
      adminSubtitle: 'مراجعة وتدقيق وإدارة وثائق الاعتماد التعليمي الرسمية الصادرة.',
      revokeAction: 'إلغاء الشهادة',
      revokingAction: 'جارٍ الإلغاء...',
      revokeModalTitle: 'إلغاء اعتماد الشهادة التعليمية',
      revokeModalDesc: 'إلغاء الشهادة إجراء دائم وموثق في سجل التدقيق غير القابل للتعديل. يرجى توضيح السبب الإداري الإلزامي.',
      revokeReasonPlaceholder: 'اكتب سبب الإلغاء المعتمد للتدقيق والامتثال...',
      cancel: 'إلغاء الأمر',
      confirmRevocation: 'تأكيد الإلغاء الرسمي',
    },
    login: {
      gatewayBadge: 'بوابة تسجيل الدخول الآمنة',
      title: 'تسجيل دخول المشارك',
      subtitle: 'سجل دخولك إلى لوحة متابعة برنامج ZIRON لمسار الـ 90 يومًا.',
      emailLabel: 'البريد الإلكتروني / معرف الحساب',
      emailPlaceholder: 'subject@virexon-biosciences.com',
      passwordLabel: 'كلمة المرور',
      passwordPlaceholder: '••••••••••••',
      submitBtn: 'تسجيل الدخول',
      authenticatingBtn: 'جارٍ تسجيل الدخول...',
      needAccountPrompt: 'مشارك جديد؟ انضم للمنصة للحصول على وصول معتمد:',
      enrollLink: 'تسجيل ملف مشارك جديد',
      forgotPasswordLink: 'نسيت كلمة المرور؟',
      invalidCredentialsError: 'بيانات الدخول غير صحيحة. يرجى التأكد من البريد الإلكتروني وكلمة المرور.',
      throttledError: 'تم إيقاف المحاولات مؤقتًا لكثرة المحاولات غير الصحيحة. يرجى الانتظار قليلاً ثم المحاولة مجددًا.',
    },
  },
  fr: {
    common: {
      backToDashboard: 'Retour au tableau de bord',
      loading: 'Chargement...',
      authenticating: 'Authentification en cours...',
      verifying: 'Vérification...',
      status: 'Statut',
      active: 'Actif',
      locked: 'Verrouillé',
      unlocked: 'Débloqué',
      verified: 'Vérifié',
      serial: 'Série',
      code: 'Code',
      date: 'Date',
      phase: 'Phase',
      continue: 'Continuer',
      cancel: 'Annuler',
      save: 'Enregistrer',
      saving: 'Enregistrement...',
      search: 'Rechercher',
      all: 'Tout',
      hours: 'Heures',
      modules: 'Modules',
      brandNotice: 'ZIRON par VIREXON BIOSCIENCES',
      returnHome: 'Retour à l’accueil',
      signIn: 'Se connecter',
      logout: 'Déconnexion',
      commandCenter: 'Centre de Contrôle',
      publicSite: 'Site Public',
    },
    shell: {
      platformTitle: 'VIREXON BIOSCIENCES | Plateforme Numérique ZIRON',
      participant: 'Participant',
      customerRole: 'Client',
      navDashboard: 'Tableau de bord',
      navJourney: 'Mon Parcours',
      navProducts: 'Mes Produits',
      navActivate: 'Activer un Produit',
      navCommunity: 'Communauté',
      navSchool: 'Restart School',
      navRewards: 'Récompenses',
      navCertificates: 'Certificats',
      navProfile: 'Profil',
      authRequiredTitle: 'Authentification Requise',
      authRequiredDesc: 'Veuillez vous authentifier pour accéder à la plateforme personnalisée ZIRON.',
      footerDisclaimer: 'Plateforme éducative et de soutien au bien-être. Orientation scientifique neutre.',
      lockHintCommunity: 'Activer un contenant pour débloquer la Communauté',
      lockHintSchool: 'Activez 3 contenants différents pour débloquer Restart School',
    },
    school: {
      curriculumAccessActive: 'Accès aux Curriculums Actif',
      title: 'Restart School de Maîtrise Appliquée',
      subtitle: 'Explorez des formations modulaires dynamiques à travers des filières technologiques, agricoles et entrepreneuriales.',
      lockedTitle: 'Restart School Verrouillée',
      lockedDesc: 'L’accès aux programmes éducatifs exige l’activation de 3 contenants de produits ZIRON différents.',
      ruleExplanation: 'Activez 3 contenants différents pour débloquer Restart School.',
      progressLabel: 'Progression de qualification',
      zeroContainersMsg: 'Activez votre premier contenant pour commencer.',
      oneContainerMsg: 'Activez 2 contenants supplémentaires pour débloquer Restart School.',
      twoContainersMsg: 'Activez 1 contenant supplémentaire pour débloquer Restart School.',
      threeContainersMsg: 'Restart School est débloquée.',
      activateFirstBtn: 'Activer un contenant',
      activateAnotherBtn: 'Activer un autre contenant',
      activeTrack: 'Filière Active',
      loadingCourses: 'Chargement des cours depuis Firestore...',
      noCoursesTitle: 'Aucun cours publié dans cette filière pour l’instant',
      noCoursesDesc: 'Les modules pédagogiques de cette filière sont en cours de validation par le comité académique et scientifique.',
      viewCurriculumBtn: 'Voir les modules du curriculum',
      difficultyBeginner: 'Fondamental',
      difficultyIntermediate: 'Intermédiaire Appliqué',
      difficultyAdvanced: 'Maîtrise Avancée',
      hoursCount: 'Heures',
      containersUnlockedBadge: 'Contenants activés • École débloquée',
      publicHeroBadge: 'Maîtrise Continue & Curriculums',
      publicHeroTitle: 'L’École ZIRON de Biopharmacie et Maîtrise Appliquée',
      publicHeroSubtitle: 'Un écosystème pédagogique reliant biologie humaine, optimisation métabolique, agriculture de précision et compétences d’entreprise.',
      enterPortalBtn: 'Accéder au Portail Scolaire',
      enrollBtn: 'S’inscrire pour débloquer les cursus',
      verifyCodeBtn: 'Vérifier le Code Produit',
      tracksAvailable: 'Filières Disponibles',
      trackNumber: 'Filière',
    },
    community: {
      heroBadge: 'Réseau d’Échange des Participants',
      title: 'La Communauté Vérifiée ZIRON',
      subtitle: 'Un forum privé et modéré reliant les participants engagés dans la trajectoire de 90 jours.',
      lockedTitle: 'Accès au Forum Communautaire Verrouillé',
      lockedDesc: 'Participer aux échanges communautaires requiert au moins un contenant de produit activé.',
      announcementsTitle: 'Annonces Officielles et Directives de Protocole',
      discussionForumTitle: 'Discussions des Participants',
      newPostBtn: 'Créer une Discussion',
      createPostTitle: 'Nouvelle Discussion Communautaire',
      postTitleLabel: 'Objet / Titre',
      postTitlePlaceholder: 'Ex. Adaptation de la routine matinale en Phase 01...',
      postBodyLabel: 'Contenu du Message',
      postBodyPlaceholder: 'Partagez vos observations biométriques, horaires ou questions...',
      submitPostBtn: 'Publier la Discussion',
      publishing: 'Publication...',
      noPostsYet: 'Aucune discussion publiée pour le moment',
      noPostsDesc: 'Soyez le premier participant vérifié à lancer une discussion.',
      commentsCount: 'Commentaires',
      likesCount: 'Utile',
      pinnedBadge: 'Avis Officiel',
      publicShieldTitle: 'Propriété Physique Vérifiée',
      publicShieldDesc: 'L’accès requiert la vérification du numéro de série d’un contenant authentique ZIRON de 30 gélules.',
      publicCohortTitle: 'Cohorte Synchronisée par Phase',
      publicCohortDesc: 'Échangez avec des participants se trouvant dans la même phase de progression.',
      publicModerationTitle: 'Supervision Scientifique',
      publicModerationDesc: 'Une modération dédiée veille à ce que les échanges demeurent rigoureux et bienveillants.',
    },
    activate: {
      tamperSealBadge: 'Vérification Cryptographique du Sceau d’Inviolabilité',
      title: 'Activer le Produit ZIRON',
      subtitle: 'Associez votre contenant physique ZIRON de 30 gélules à votre dossier participant pour débloquer tous les privilèges.',
      inputLabel: 'Code de Vérification du Contenant',
      inputPlaceholder: 'Entrez le code figurant sur le sceau (ex. ZR-XXXX-XXXX)',
      submitBtn: 'Activer le Contenant',
      verifyingBtn: 'Vérification du sceau de sécurité...',
      successBadge: 'Activation Réussie',
      successTitle: 'Contenant Vérifié & Lié',
      successDesc: 'a été associé de manière permanente à votre profil.',
      grantedEntitlements: 'Droits d’accès officiellement accordés :',
      schoolUnlockedNotice: 'Restart School a été débloquée !',
      schoolProgressNotice: 'contenants activés pour débloquer Restart School.',
      alreadyActivatedError: 'Ce code contenant a déjà été activé et ne peut pas être réutilisé.',
      invalidCodeError: 'Code contenant invalide. Veuillez vérifier les caractères et réessayer.',
      goToDashboardBtn: 'Retour au Tableau de bord',
      enterSchoolBtn: 'Accéder à Restart School',
      enterCommunityBtn: 'Accéder à la Communauté',
      activateAnotherBtn: 'Activer un Autre Contenant',
      containerSpecsTitle: 'Spécifications du Contenant Physique',
      containerSpecsDesc: 'Chaque boîte authentique ZIRON contient 30 gélules végétales pour 30 jours de protocole séquentiel.',
    },
    dashboard: {
      dossierBadge: 'Dossier du Participant',
      profileCompleteness: 'Complétude du Profil',
      editProfileBtn: 'Modifier le Profil',
      noProductLinkedBadge: 'Aucun Produit Lié',
      noProductLinkedTitle: 'Activez votre produit ZIRON',
      noProductLinkedDesc: 'Entrez le code de vérification unique figurant sur le sceau de sécurité de votre contenant ZIRON.',
      activateProductBtn: 'Activer un Produit',
      productActiveBadge: 'Contenant Produit Actif & Vérifié',
      activeEntitlementsCount: 'Droits Actifs',
      viewJourneyBtn: 'Voir Mon Parcours',
      manageProductsBtn: 'Gérer Mes Produits',
      communityCardTitle: 'Communauté ZIRON',
      communityCardDescUnlocked: 'Accédez aux discussions vérifiées, actualités de recherche et annonces officielles.',
      communityCardDescLocked: 'Nécessite l’activation d’un produit pour débloquer le forum d’entraide.',
      openForumBtn: 'Ouvrir le Forum',
      schoolCardTitle: 'Restart School',
      schoolCardDescUnlocked: 'Accédez aux cursus en compétences numériques, agriculture de précision et filières appliquées.',
      schoolCardDescLocked: 'Activez 3 contenants différents pour débloquer Restart School et ses certificats.',
      openSchoolBtn: 'Ouvrir l’École',
      activateToUnlockBtn: 'Activer pour Débloquer',
      journeyCardTitle: 'Votre Parcours ZIRON',
      journeyCardDescActive: 'Suivez vos progrès pédagogiques, jalons de communauté et ressources bien-être.',
      journeyCardDescInactive: 'Commencez votre parcours en vérifiant votre contenant de produit.',
      schoolProgressBadge: 'Progression Restart School',
    },
    products: {
      registryBadge: 'Registre Vérifié',
      title: 'Mes Produits',
      subtitle: 'Consultez vos contenants ZIRON authentifiés, autorisations de lots et droits associés.',
      activateNewBtn: 'Activer un Nouveau Code',
      emptyTitle: 'Aucun Produit Activé Enregistré',
      emptyDesc: 'Vous n’avez encore vérifié aucun contenant de produit ZIRON.',
      emptyBtn: 'Activer Votre Premier Contenant',
      activatedContainersCount: 'Contenants Activés',
      activeAndVerified: 'Actif & Vérifié',
      capsuleSpecs: 'Contenant standard de 30 gélules pour 30 jours de phase séquentielle.',
      authenticityProtocolTitle: 'Protocole d’Authenticité et Traçabilité Sérialisée',
      authenticityProtocolDesc: 'Chaque contenant individuel ZIRON est doté d’un numéro de série unique lié à un seul dossier participant.',
      linkedEntitlements: 'Droits Liés',
    },
    journey: {
      headerBadge: 'Bien-Être Structuré & Éducation',
      title: 'Votre Parcours ZIRON',
      subtitle: 'Suivez votre trajectoire combinant soutien biologique, cursus éducatifs et échanges communautaires.',
      statusActive: 'Statut : Actif',
      startedDate: 'Démarré le',
      phase1Title: 'Phase 01 : Fondations',
      phase1Desc: 'Alignement métabolique, routine matinale et consolidation des habitudes de base.',
      phase2Title: 'Phase 02 : Optimisation',
      phase2Desc: 'Approfondissement de la régularité nutritionnelle, clarté cognitive et vitalité physique.',
      phase3Title: 'Phase 03 : Stabilisation',
      phase3Desc: 'Équilibre métabolique durable, autonomie d’hygiène de vie et résilience.',
      phaseDays: '30 Jours',
      currentStage: 'Étape Actuelle',
      resourcesTitle: 'Ressources Disponibles',
      resourcesSubtitle: 'Composants intégrés de votre parcours ZIRON.',
      learningCardTitle: 'Apprentissage Appliqué',
      learningCardDesc: 'Accédez aux cours modulaires et masterclasses pratiques dans Restart School.',
      communityCardTitle: 'Communauté de Pairs',
      communityCardDesc: 'Échangez avec des participants aux mêmes étapes du parcours de 90 jours.',
      milestonesTitle: 'Votre Progression & Prochains Jalons',
      milestonesEmptyTitle: 'Jalons en Attente d\'Activation Initiale',
      milestonesEmptyDesc: 'Le suivi des jalons s\'active dès la validation de votre premier flacon ZIRON.',
      verificationComplete: 'Vérification du Flacon Effectuée',
      day30Review: 'Bilan d\'Adhérence et Biomarqueurs au 30e Jour',
      day60Review: 'Évaluation à Mi-Parcours au 60e Jour',
      day90Review: 'Bilan Complet de Clôture au 90e Jour',
    },
    rewards: {
      headerBadge: 'Registre des Récompenses & Jalons',
      title: 'Récompenses & Jalons ZIRON',
      subtitle: 'Suivez la régularité de votre protocole, vos jalons de validation et vos accomplissements éducatifs.',
      levelLabel: 'Niveau',
      totalXpLabel: 'Total XP',
      foundationTitle: 'Architecture du Système de Récompenses',
      foundationDesc: 'Le moteur de récompenses ZIRON valorise votre assiduité et l’achèvement des cursus de formation.',
      checkpoint30Title: 'Jalon des 30 Jours',
      checkpoint30Desc: 'Débloquez le badge d’assiduité de Phase 01 après vos 30 premiers jours consécutifs.',
      curriculumMasteryTitle: 'Maîtrise Pédagogique',
      curriculumMasteryDesc: 'Obtenez des badges de certification en terminant des modules de formation dans Restart School.',
      peerEngagementTitle: 'Collaboration entre Pairs',
      peerEngagementDesc: 'Gagnez des points d’expérience en partageant vos retours d’expérience au sein du forum.',
      returnToJourneyBtn: 'Retour au Parcours',
      activateProductBtn: 'Activer un Produit',
    },
    certificates: {
      registryBadge: 'Registre des Certificats',
      title: 'Certificats Vérifiés',
      subtitle: 'Consultez et partagez vos certificats officiels obtenus lors de la validation des parcours dans Restart School.',
      browseCurriculaBtn: 'Parcourir les Formations',
      emptyTitle: 'Aucun Certificat Délivré pour le Moment',
      emptyDesc: 'Les certificats sont émis de façon sécurisée par le serveur après validation de tous les modules de Restart School.',
      exploreSchoolBtn: 'Explorer Restart School',
      verificationStandardTitle: 'Norme de Vérification Infalsifiable',
      verificationStandardDesc: 'Chaque certificat dispose d’un identifiant public inviolable consultable dans notre registre de vérification.',
      returnToDashboardBtn: 'Retour au Tableau de Bord',
      educationalDisclaimer: 'Les certificats délivrés par ZIRON Restart School sont exclusivement des attestations pédagogiques de fin d’études. Ils ne certifient en aucun cas un traitement médical, une guérison d’addiction ou un résultat clinique.',
      viewCredential: 'Voir le Certificat',
      printCertificate: 'Imprimer / Enregistrer en PDF',
      copyVerificationLink: 'Copier le Lien de Vérification',
      linkCopied: 'Lien de vérification copié !',
      certificateNumber: 'Numéro de Certificat',
      issuedTo: 'Délivré à',
      course: 'Programme de Formation',
      issuedDate: 'Date d’Émission',
      completionDate: 'Date d’Achèvement',
      issuingAuthority: 'Autorité Émettrice',
      status: 'Statut',
      statusActive: 'Vérifié & Actif',
      statusRevoked: 'Révoqué',
      verifyTitle: 'Registre Officiel de Vérification',
      verifySubtitle: 'Portail public de vérification des certificats pédagogiques émis par ZIRON Restart School.',
      enterCertificateNumber: 'Entrez le numéro ou le jeton de certificat (ex. ZRN-CERT-2026-...)',
      verifyButton: 'Vérifier l’Authenticité',
      verifying: 'Vérification auprès de l’autorité...',
      validCredentialTitle: 'Certificat Pédagogique Authentique',
      revokedCredentialTitle: 'Certificat Révoqué',
      notFoundTitle: 'Certificat Introuvable',
      notFoundDesc: 'Aucun certificat correspondant à cet identifiant n’a été trouvé dans le registre officiel.',
      revocationReason: 'Motif de Révocation',
      claimCertificateBtn: 'Émettre / Actualiser le Certificat',
      claimingCertificate: 'Émission du certificat en cours...',
      claimSuccess: 'Certificat émis avec succès !',
      adminTitle: 'Gouvernance du Registre des Certificats',
      adminSubtitle: 'Inspecter, auditer et gérer les attestations officielles de formation délivrées.',
      revokeAction: 'Révoquer le Certificat',
      revokingAction: 'Révocation en cours...',
      revokeModalTitle: 'Révoquer le Certificat Pédagogique',
      revokeModalDesc: 'La révocation est définitive et consignée dans le journal d’audit. Veuillez motiver la décision.',
      revokeReasonPlaceholder: 'Indiquez le motif officiel de conformité...',
      cancel: 'Annuler',
      confirmRevocation: 'Confirmer la Révocation',
    },
    login: {
      gatewayBadge: 'Passerelle d’Accès Sécurisée',
      title: 'Authentification du Participant',
      subtitle: 'Connectez-vous à votre tableau de bord d’accompagnement du protocole ZIRON 90 jours.',
      emailLabel: 'Courrier Électronique / Identifiant',
      emailPlaceholder: 'participant@virexon-biosciences.com',
      passwordLabel: 'Mot de Passe',
      passwordPlaceholder: '••••••••••••',
      submitBtn: 'S’authentifier',
      authenticatingBtn: 'Authentification en cours...',
      needAccountPrompt: 'Nouveau participant ? Inscrivez-vous pour obtenir un accès vérifié :',
      enrollLink: 'Créer un Dossier Participant',
      forgotPasswordLink: 'Identifiants oubliés ?',
      invalidCredentialsError: 'Identifiant ou mot de passe incorrect. Veuillez vérifier vos données.',
      throttledError: 'Accès temporairement suspendu en raison de tentatives multiples. Veuillez patienter.',
    },
  },
};

export function getAppTranslations(locale: Locale): AppTranslations {
  return APP_TRANSLATIONS[locale] || APP_TRANSLATIONS.en;
}
