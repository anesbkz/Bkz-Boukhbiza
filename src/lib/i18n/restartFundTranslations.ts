import { Locale } from '@/types';

export interface RestartFundTranslations {
  hero: {
    eyebrow: string;
    protocolRef: string;
    headline: string;
    supportingMessage: string;
    statusBadge: string;
    statusNotice: string;
    programClosedNotice: string;
  };
  whatIs: {
    tag: string;
    title: string;
    description: string;
    coreProgressionTitle: string;
    progression: Array<{
      step: string;
      name: string;
      desc: string;
    }>;
    roleInRestart: string;
  };
  notALoan: {
    badge: string;
    title: string;
    statement: string;
    explanation: string;
    noDebtNotice: string;
    points: string[];
  };
  freedomOfUse: {
    tag: string;
    title: string;
    coreStatement: string;
    subStatement: string;
    disclaimerNotice: string;
    categories: Array<{
      id: string;
      title: string;
      desc: string;
    }>;
  };
  maxAssistance: {
    tag: string;
    amount: string;
    currency: string;
    caption: string;
    qualifier: string;
    explanation: string;
  };
  ecosystemFit: {
    tag: string;
    title: string;
    description: string;
    noAutoEntitlementNotice: string;
    pillars: Array<{
      step: string;
      name: string;
      focus: string;
      status: string;
    }>;
  };
  currentStatus: {
    tag: string;
    headline: string;
    message: string;
    bullets: string[];
    securityNotice: string;
  };
  futureFramework: {
    tag: string;
    title: string;
    description: string;
    pillars: Array<{
      title: string;
      desc: string;
    }>;
    disclaimer: string;
  };
  philosophy: {
    tag: string;
    coreProverb: string;
    quote: string;
    missionBody: string;
  };
  cta: {
    title: string;
    subtitle: string;
    exploreRestartBtn: string;
    discoverSchoolBtn: string;
    verifyCertificateBtn: string;
  };
  navigation: {
    overview: string;
    school: string;
    certificates: string;
    opportunities: string;
    restartFund: string;
  };
}

export const RESTART_FUND_TRANSLATIONS: Record<Locale, RestartFundTranslations> = {
  ar: {
    hero: {
      eyebrow: 'صندوق ZIRON RESTART المستقبلي',
      protocolRef: 'VX-RST-FUND-GOV-01',
      headline: 'مساعدة مالية تصل إلى 2,500,000 دج',
      supportingMessage: 'لدعم إعادة الاندماج، استقرار الحياة، وبناء بداية جديدة.',
      statusBadge: 'برنامج غير مفتوح حاليًا • قيد التحضير',
      statusNotice: 'البرنامج في طور التأطير التنظيمي والحوكمة المؤسسية. لا توجد طلبات مفتوحة ولا استقبال لملفات التمويل في الوقت الراهن.',
      programClosedNotice: 'برنامج غير مفتوح حاليًا',
    },
    whatIs: {
      tag: 'ما هو صندوق RESTART؟',
      title: 'مبادرة مساعدة مالية مستقبلية لإعادة الاندماج الاجتماعي',
      description:
        'صندوق ZIRON Restart مبادرة مستقبلية للدعم المالي المباشر، صُممت لمساندة الأفراد المتدرجين عبر مسار ZIRON Restart الشامل. يمثل الصندوق الحلقة التمكينية الأخيرة لنقل المستفيد من مرحلة بناء الذات والانضباط إلى مرحلة الاستقرار المعيشي والاندماج المجتمعي المستدام.',
      coreProgressionTitle: 'المسار التكاملي لمنظومة RESTART',
      progression: [
        { step: '01', name: 'التعافي (Recovery)', desc: 'استعادة التوازن الفسيولوجي والانضباط الذاتي اليومي' },
        { step: '02', name: 'التعلم (Learning)', desc: 'بناء الأساس المعرفي عبر مناهج مدرسة ZIRON التطبيقية' },
        { step: '03', name: 'المهارات (Skills)', desc: 'اكتساب المهارات الحرفية والتقنية والإنتاجية' },
        { step: '04', name: 'الشهادات (Certification)', desc: 'الحصول على وثائق إتمام موثقة ومشفرة غير قابلة للتزوير' },
        { step: '05', name: 'الفرص (Opportunity)', desc: 'الربط بشبكات التدريب والإنتاج والشراكات الحقيقية' },
        { step: '06', name: 'البداية الجديدة (New Start)', desc: 'التمكين والاستقرار الحياتي عبر المساعدة المالية' },
      ],
      roleInRestart:
        'يمثل الصندوق الركيزة التمكينية الختامية في مرحلة "البداية الجديدة"، بهدف تذليل العقبات المادية أمام المستفيد ليتمكن من استعادة كرامته واستقراره الاجتماعي.',
    },
    notALoan: {
      badge: 'إطار مالي غير مسترد',
      title: 'ليست قرضًا',
      statement: 'صندوق ZIRON Restart مصمم كمساعدة مالية، وليس قرضًا. ولا يهدف لإنشاء أي التزام بالسداد.',
      explanation:
        'The ZIRON Restart Fund is designed as financial assistance, not a loan. It is not intended to create a repayment obligation. لا تفرض المنظومة أي فوائد، ولا تشترط رهنًا، ولا تسجل ديونًا على عاتق المستفيد، ولا تطلب جدول أقساط مسترجعة.',
      noDebtNotice: 'منحة تضامنية لدعم الانطلاقة الشخصية دون أعباء ديون سابقة أو لاحقة.',
      points: [
        'ليست قرضًا بنكيًا ولا تمويلًا استثماريًا بفوائد.',
        'صفر التزام بالسداد أو الجداول الاستردادية.',
        'لا تتطلب رهن أصول أو تقديم كفالات وضمانات تجارية.',
        'لا تخلق ديونًا مالية ولا تؤثر سلبًا على الذمة المالية للمستفيد.',
      ],
    },
    freedomOfUse: {
      tag: 'مرونة الاستخدام والاحتياجات الواقعية',
      title: 'حرية التوجيه وفق الاحتياجات الشخصية المشروعة',
      coreStatement: 'المساعدة المالية المستقبلية غير مقيدة بشراء معدات محددة أو استثمار محدد سلفًا.',
      subStatement:
        'يحق للمستفيد توجيه المساعدة المالية وفقًا لظروفه الخاصة واحتياجاته الشخصية الحقيقية، بما يتوافق مع القواعد الرسمية التي ستحددها اللائحة التنفيذية عند الإطلاق.',
      disclaimerNotice:
        'ملاحظة جوهرية: المجالات المذكورة أدناه تمثل أمثلة واقعية للاحتياجات التمكينية وليست فئات إنفاق إلزامية أو شروطًا حصرية. لا يُلزم المستفيد بتأسيس شركة تجارية ولا يُلزم بتقديم فواتير شراء آلات أو معدات صناعية بعينها.',
      categories: [
        {
          id: 'living',
          title: 'المعيشة والاحتياجات اليومية',
          desc: 'توفير المتطلبات الأساسية للعيش الكريم وتأمين المصاريف المعيشية العاجلة خلال فترة الاستقرار الأولى.',
        },
        {
          id: 'housing',
          title: 'السكن والاستقرار الأسري',
          desc: 'تأمين تكاليف الإيجار، تحسين المأوى، أو توفير بيئة سكنية ملائمة وآمنة للمستفيد وعائلته.',
        },
        {
          id: 'education',
          title: 'التعليم والتكوين المتخصص',
          desc: 'تمويل دورات تدريبية إضافية، برامج تكوين مهني، أو اقتناء مستلزمات تعليمية متقدمة.',
        },
        {
          id: 'employment',
          title: 'العمل وتسهيل الاندماج المهني',
          desc: 'تغطية مصاريف الانتقال، ملابس العمل، التراخيص المهنية، أو تجهيزات الوظيفة الجديدة.',
        },
        {
          id: 'obligations',
          title: 'تسوية الالتزامات المالية والديون',
          desc: 'سداد ديون شخصية عالقة أو التزامات متراكمة لتحرير المستفيد من الضغوط المالية السابقة.',
        },
        {
          id: 'activity',
          title: 'إطلاق نشاط مهني أو مشروع شخصي',
          desc: 'تمويل بداية نشاط حرفي، زراعي، أو تجاري صغير وفق رغبة وقدرات المستفيد الذاتية دون إلزام تعاقدي.',
        },
        {
          id: 'family',
          title: 'استقرار الأسرة والدعم النفسي',
          desc: 'مساندة الأبناء والوالدين وتخفيف الأعباء الصحية الطارئة لتحقيق الاستقرار النفسي والتضامني.',
        },
        {
          id: 'newstart',
          title: 'بداية جديدة شاملة',
          desc: 'أي احتياج شخصي مشروع يساهم في بناء حياة جديدة وإعادة الاندماج الفعلي داخل المجتمع.',
        },
      ],
    },
    maxAssistance: {
      tag: 'سقف الدعم المحتمل',
      amount: '2,500,000',
      currency: 'دج',
      caption: 'الحد الأقصى للمساعدة المالية المحتملة',
      qualifier: 'مساعدة مالية تصل إلى 2,500,000 دج (Financial assistance of up to 2,500,000 DZD)',
      explanation:
        'يمثل هذا الرقم السقف المالي الأعلى الممكن تخصيصه للمستفيد الفردي. لا يعني هذا بالضرورة حصول كل مشارك على كامل هذا المبلغ تلقائيًا؛ إذ ستحدد المبالغ الفعلية بناءً على مراجعة دقيقة لظروف كل حالة والاحتياجات الموثقة وميزانية الصندوق الرسمية المعلنة عند الانطلاق.',
    },
    ecosystemFit: {
      tag: 'التموضع الهيكلي للمنظومة',
      title: 'موقع الصندوق ضمن هيكل ZIRON RESTART',
      description:
        'ينتمي صندوق RESTART إلى طبقة "البداية الجديدة" الختامية. وهو مرحلة مستقلة تتلو المسار التأهيلي وليست نتيجة محاسبية تلقائية.',
      noAutoEntitlementNotice:
        'تنبيه قانوني وتنظيمي حاسم: إتمام مناهج مدرسة ZIRON أو الحصول على شهادات تدريبية لا يُنشئ أي استحقاق مالي تلقائي ولا يضمن استلام أي مبلغ مالي. يخضع الصندوق لقواعد أهلية ومعايير اختيار وحوكمة مستقلة سيتم إعلانها رسميًا عند اكتمال الجاهزية.',
      pillars: [
        { step: '01', name: 'التعافي البدني', focus: 'بروتوكول ZIRON اليومي والتثبيت السريري', status: 'متاح عبر تفعيل المنتج' },
        { step: '02', name: 'مدرسة ZIRON', focus: 'مناهج تطبيقية حصرية تفتح بـ 3 عبوات فريدة', status: 'متاح للمؤهلين' },
        { step: '03', name: 'المهارات التقنية', focus: 'التدريب الحرفي، الزراعي، والتقني المنهجي', status: 'متاح للدارسين' },
        { step: '04', name: 'الشهادات المعتمدة', focus: 'إصدار خادمي مشفر غير قابل للتزوير', status: 'متاح للخريجين' },
        { step: '05', name: 'الفرص الميدانية', focus: 'حاضنات، شبكات التوريد، والتوجيه المهني', status: 'قيد التطوير' },
        { step: '06', name: 'صندوق البداية الجديدة', focus: 'مساعدة مالية تصل إلى 2,500,000 دج لدعم الاستقرار', status: 'قيد التحضير المستقبلي' },
      ],
    },
    currentStatus: {
      tag: 'الحالة الإجرائية الراهنة',
      headline: 'برنامج غير مفتوح حاليًا',
      message:
        'صندوق ZIRON Restart قيد التحضير والتأطير القانوني والتنظيمي حاليًا، ولا يستقبل أي طلبات ولا يقوم بأي صرف أو توزيع مالي في الوقت الراهن.',
      bullets: [
        'لا توجد أي استمارات أو طلبات منحة مفتوحة في هذه المرحلة.',
        'لا توجد أي تحويلات نقدية أو تسديدات مالية قيد التنفيذ حاليًا.',
        'سيتم الإعلان عن معايير الأهلية النهائية بشفافية تامة عند الإطلاق الرسمي للبرنامج.',
        'سيتم نشر القواعد التفصيلية وآليات التقييم المعتمدة عند اكتمال المنظومة.',
      ],
      securityNotice:
        'حماية أمنية: لا تقدم أي بيانات مصرفية أو تفاصيل حسابات مالية على أي جهة تدعي تمثيل الصندوق. الصندوق لا يجمع بيانات مالية في هذه المرحلة.',
    },
    futureFramework: {
      tag: 'الملامح التنظيمية المستقبلية',
      title: 'إطار الحوكمة والمعايير المتوقعة عند الإطلاق',
      description:
        'عند التدشين الرسمي لصندوق ZIRON Restart، سيستند البرنامج إلى إطار مؤسسي رصين يضمن الشفافية والعدالة وتكافؤ الفرص:',
      pillars: [
        { title: 'معايير الأهلية والشروط العامة', desc: 'تحديد الشروط النظامية والمؤهلات المطلوبة لترشح المستفيدين.' },
        { title: 'شروط إتمام المسار التأهيلي', desc: 'متطلبات إثبات الجدية والانضباط المعرفي والمهاري داخل المنظومة.' },
        { title: 'إجراءات التقديم الموثقة', desc: 'مسار رقمي واضح وسلس لتقديم ملفات الدعم دون تعقيدات بيروقراطية.' },
        { title: 'منهجية التقييم الموضوعي', desc: 'معايير تقييم شاملة تعتمد على الاحتياج الواقعي وإمكانات النجاح الاجتماعي.' },
        { title: 'تحديد عدد المستفيدين في كل دورة', desc: 'تخصيص حصص منتظمة ومستدامة وفق القدرات التمويلية المرصودة.' },
        { title: 'تحديد مبالغ المساعدة المناسبة', desc: 'تقدير حجم المساعدة لكل حالة فردية بما يحقق الاستقرار المستهدف.' },
        { title: 'لجان الحوكمة والمراجعة المستقلة', desc: 'إشراف كفاءات مهنية وأخلاقية لضمان نزاهة القرارات ومتابعة الأثر.' },
      ],
      disclaimer: 'تفاصيل هذا الإطار تمثل أهدافًا تخطيطية أولية؛ وسيتم نشر اللائحة التنفيذية الرسمية بكامل بنودها فور اعتمادها.',
    },
    philosophy: {
      tag: 'فلسفة RESTART',
      coreProverb: 'تكمل المراحل... وتبدأ حرفة.',
      quote:
        'تقوم فلسفة ZIRON Restart على مبدأ أصيل: التعافي يقود إلى التعلم، والتعلم يفتح آفاق الفرص، والفرص تمهد الطريق نحو بداية جديدة متينة ومستقرة.',
      missionBody:
        'لا يقتصر طموح VIREXON BIOSCIENCES على تقديم حلول صحية وغذائية متطورة، بل يمتد لبناء بيئة إنسانية متكاملة تساند الإنسان في تجاوز عثراته واستعادة مكانته الفاعلة والمنتجة في وطنه ومجتمعه.',
    },
    cta: {
      title: 'ابدأ مسارك اليوم في منظومة ZIRON',
      subtitle: 'حتى يحين موعد إطلاق الصندوق، ركز على صحتك واكتساب المهارات التطبيقية التي تفتح أمامك أبواب المستقبل.',
      exploreRestartBtn: 'استكشف منظومة ZIRON Restart',
      discoverSchoolBtn: 'اكتشف مدرسة ZIRON للتعليم المهني',
      verifyCertificateBtn: 'بوابة التحقق من الشهادات',
    },
    navigation: {
      overview: 'نظرة عامة',
      school: 'المدرسة',
      certificates: 'الشهادات',
      opportunities: 'الفرص والتشبيك',
      restartFund: 'صندوق RESTART',
    },
  },
  en: {
    hero: {
      eyebrow: 'ZIRON RESTART FUND',
      protocolRef: 'VX-RST-FUND-GOV-01',
      headline: 'Financial assistance of up to 2,500,000 DZD',
      supportingMessage: 'Supporting reintegration, stability, and a new beginning.',
      statusBadge: 'PROGRAM — COMING SOON',
      statusNotice:
        'The program is currently undergoing institutional structuring and regulatory governance. No applications are open and no fund distributions are active at this time.',
      programClosedNotice: 'Program currently closed',
    },
    whatIs: {
      tag: 'WHAT IS THE RESTART FUND?',
      title: 'A Future Financial Assistance Initiative for Social Reintegration',
      description:
        'The ZIRON Restart Fund is a future financial assistance program designed to support individuals advancing through the comprehensive ZIRON Restart ecosystem. The Fund represents the culminating empowerment layer, intended to assist qualified beneficiaries in moving from personal restoration and discipline toward durable stability and community reintegration.',
      coreProgressionTitle: 'Integrated ZIRON RESTART Trajectory',
      progression: [
        { step: '01', name: 'Recovery', desc: 'Physiological baseline reset and daily nutritional discipline' },
        { step: '02', name: 'Learning', desc: 'Structured technical knowledge via ZIRON School curricula' },
        { step: '03', name: 'Skills', desc: 'Hands-on tradecraft, agricultural, and technical competencies' },
        { step: '04', name: 'Certification', desc: 'Cryptographically issued, tamper-proof credentials' },
        { step: '05', name: 'Opportunity', desc: 'Direct linkage to field apprenticeships and commercial networks' },
        { step: '06', name: 'New Start', desc: 'Personal stabilization and social reintegration via financial assistance' },
      ],
      roleInRestart:
        'The Fund forms the final support layer under the "New Start" milestone, designed to alleviate initial financial friction so beneficiaries can rebuild and stabilize their lives with autonomy and dignity.',
    },
    notALoan: {
      badge: 'NON-REPAYABLE ASSISTANCE FRAMEWORK',
      title: 'Not a Loan',
      statement: 'The ZIRON Restart Fund is designed as financial assistance, not a loan. It is not intended to create a repayment obligation.',
      explanation:
        'The ZIRON Restart Fund is designed as financial assistance, not a loan. It is not intended to create a repayment obligation, interest charges, collateral liens, or financial debt. No schedule of return payments or commercial lending covenants is imposed upon the recipient.',
      noDebtNotice: 'Purely assistance-driven support to catalyze a fresh start without compounding liabilities.',
      points: [
        'Not a bank loan and not an investment loan with interest.',
        'Zero repayment obligation or recurring refund schedules.',
        'No asset pledging, collateral liens, or corporate guarantees.',
        'Creates no personal debt and imposes no negative financial liability.',
      ],
    },
    freedomOfUse: {
      tag: 'BENEFICIARY AUTONOMY & REAL NEEDS',
      title: 'Freedom of Use Based on Personal Circumstances',
      coreStatement: 'The future assistance is not restricted to purchasing specific equipment or a predefined investment.',
      subStatement:
        'Beneficiaries may deploy the financial assistance in alignment with their legitimate personal needs and individual circumstances, subject to the final official rules enacted at launch.',
      disclaimerNotice:
        'Critical Note: The categories listed below represent illustrative examples of legitimate personal stabilization needs, NOT mandatory spending quotas. Recipients are not obligated to incorporate a commercial company, nor are they restricted to equipment purchase vouchers or predefined machinery invoices.',
      categories: [
        {
          id: 'living',
          title: 'Daily Living Needs',
          desc: 'Securing essential nutrition, clothing, healthcare, and vital day-to-day living necessities during initial transition.',
        },
        {
          id: 'housing',
          title: 'Housing & Residential Stability',
          desc: 'Addressing rental deposits, lease obligations, basic home furnishings, or safe residential establishment.',
        },
        {
          id: 'education',
          title: 'Education & Vocational Training',
          desc: 'Financing specialized trade certifications, vocational workshops, books, or technical licensing.',
        },
        {
          id: 'employment',
          title: 'Employment & Transition Tools',
          desc: 'Transportation costs, professional attire, licensing credentials, or tools required to enter the workforce.',
        },
        {
          id: 'obligations',
          title: 'Financial Obligations & Liabilities',
          desc: 'Settling prior personal debts, past-due utility bills, or accumulated obligations to restore peace of mind.',
        },
        {
          id: 'activity',
          title: 'Personal Activity or Small Business',
          desc: 'Seeding an artisanal craft, agrarian plot, repair bench, or autonomous trade based on personal aptitude.',
        },
        {
          id: 'family',
          title: 'Family & Personal Stabilization',
          desc: 'Supporting dependents, childcare, elder family needs, or psychological well-being essentials.',
        },
        {
          id: 'newstart',
          title: 'New Beginning Requirements',
          desc: 'Any legitimate, honorable personal expenditure that meaningfully advances durable reintegration into society.',
        },
      ],
    },
    maxAssistance: {
      tag: 'MAXIMUM BENEFIT CAP',
      amount: '2,500,000',
      currency: 'DZD',
      caption: 'Maximum potential financial assistance',
      qualifier: 'Financial assistance of up to 2,500,000 DZD',
      explanation:
        'This headline figure represents the upper ceiling of potential financial assistance. It does not imply that every participant receives this exact sum. Actual assistance amounts will be determined based on verified individual assessments, demonstrated needs, and available cycle allocations upon official launch.',
    },
    ecosystemFit: {
      tag: 'ECOSYSTEM ARCHITECTURE',
      title: 'How the Fund Fits into ZIRON RESTART',
      description:
        'The ZIRON Restart Fund operates exclusively as the terminal "New Start" tier of the ecosystem. It is an independent enablement phase that follows holistic preparation.',
      noAutoEntitlementNotice:
        'Crucial Regulatory Invariant: Completing ZIRON School courses or obtaining a verified certificate does NOT automatically confer any financial entitlement or grant. The Fund will maintain its own distinct eligibility criteria, independent review board, and quota caps when officially launched.',
      pillars: [
        { step: '01', name: 'Recovery', focus: 'Disciplined ZIRON daily protocol & physiological reset', status: 'Available with product' },
        { step: '02', name: 'Learning', focus: 'Structured technical curricula unlocked by 3 unique containers', status: 'Available to qualified' },
        { step: '03', name: 'Skills', focus: 'Methodological tradecraft, apiary, and technical training', status: 'Available in School' },
        { step: '04', name: 'Certification', focus: 'Server-authoritative, tamper-proof verifiable credentials', status: 'Issued upon completion' },
        { step: '05', name: 'Opportunity', focus: 'Incubation linkages, supply agreements, and mentorship', status: 'In development' },
        { step: '06', name: 'New Start (Fund)', focus: 'Financial assistance of up to 2,500,000 DZD for reintegration', status: 'Future phase in prep' },
      ],
    },
    currentStatus: {
      tag: 'CURRENT OPERATIONAL STATUS',
      headline: 'Program currently closed',
      message:
        'The ZIRON Restart Fund is currently in preparation and is not accepting applications or distributing financial assistance at this time.',
      bullets: [
        'No applications or registrations currently open.',
        'No financial disbursement or money transfer currently active.',
        'Final eligibility criteria will be announced at official launch.',
        'Final program rules and governance will be announced at official launch.',
      ],
      securityNotice:
        'Security advisory: Never submit banking credentials or transaction fees to any entity claiming early access to the Fund. All official notifications will be published solely within this verified domain.',
    },
    futureFramework: {
      tag: 'FUTURE GOVERNANCE BLUEPRINT',
      title: 'Program Governance & Standards at Launch',
      description:
        'When officially inaugurated, the ZIRON Restart Fund will be administered through a robust governance methodology designed to maintain fairness, integrity, and social impact:',
      pillars: [
        { title: 'Eligibility Criteria', desc: 'Clear guidelines establishing qualifying criteria and background prerequisites.' },
        { title: 'Completion Requirements', desc: 'Verified record of discipline and engagement within the ZIRON ecosystem.' },
        { title: 'Application Process', desc: 'A transparent, accessible digital submission channel without bureaucratic hurdles.' },
        { title: 'Evaluation Methodology', desc: 'Objective holistic review factoring personal circumstances and reintegration viability.' },
        { title: 'Beneficiaries Per Cycle', desc: 'Structured beneficiary cohorts calibrated to available endowment funding.' },
        { title: 'Assistance Determination', desc: 'Tailored grant calibration aligning assistance amount with validated individual goals.' },
        { title: 'Independent Review Governance', desc: 'Independent oversight committee ensuring strict impartiality and ethical review.' },
      ],
      disclaimer: 'These framework elements represent planning blueprints. Final statutory guidelines will be ratified prior to deployment.',
    },
    philosophy: {
      tag: 'RESTART PHILOSOPHY',
      coreProverb: 'Complete the stages... and forge your trade.',
      quote:
        'ZIRON Restart is built around a simple idea: recovery should lead to learning, learning should lead to opportunity, and opportunity should lead to a new start.',
      missionBody:
        'Beyond pharmaceutical rigor and nutritional consistency, VIREXON BIOSCIENCES is dedicated to fostering an ecosystem where personal resilience is met with meaningful tools for renewed purpose and honorable self-reliance.',
    },
    cta: {
      title: 'Advance Your Trajectory Today',
      subtitle: 'While the Fund prepares for its official launch, focus on physical consistency, knowledge acquisition, and skill mastery.',
      exploreRestartBtn: 'Explore ZIRON Restart',
      discoverSchoolBtn: 'Discover ZIRON School',
      verifyCertificateBtn: 'Verify Certificates',
    },
    navigation: {
      overview: 'Overview',
      school: 'School',
      certificates: 'Certificates',
      opportunities: 'Opportunities',
      restartFund: 'Restart Fund',
    },
  },
  fr: {
    hero: {
      eyebrow: 'FONDS ZIRON RESTART',
      protocolRef: 'VX-RST-FUND-GOV-01',
      headline: "Aide financière jusqu'à 2 500 000 DZD",
      supportingMessage: 'Pour soutenir la réinsertion, la stabilité personnelle et un nouveau départ.',
      statusBadge: 'PROGRAMME FERMÉ ACTUELLEMENT • EN PRÉPARATION',
      statusNotice:
        'Le dispositif fait actuellement l’objet d’un cadrage réglementaire et d’une gouvernance institutionnelle. Aucun dossier de candidature n’est ouvert et aucune distribution de fonds n’est active pour l’instant.',
      programClosedNotice: 'Programme actuellement fermé',
    },
    whatIs: {
      tag: 'QU’EST-CE QUE LE FONDS RESTART ?',
      title: 'Un Dispositif Futur d’Aide Financière pour la Réinsertion Sociale',
      description:
        'Le Fonds ZIRON Restart est une future initiative d’assistance financière directe conçue pour accompagner les personnes cheminant à travers l’écosystème complet ZIRON Restart. Le Fonds constitue le palier ultime d’autonomisation, visant à soutenir les bénéficiaires qualifiés dans leur transition d’un travail de reconstruction vers une stabilité pérenne et une réinsertion sociale réussie.',
      coreProgressionTitle: 'Progression Intégrée de l’Écosystème RESTART',
      progression: [
        { step: '01', name: 'Rétablissement (Recovery)', desc: 'Régulation physiologique et discipline nutritionnelle quotidienne' },
        { step: '02', name: 'Apprentissage (Learning)', desc: 'Acquisition de savoirs structurés via les cursus de ZIRON School' },
        { step: '03', name: 'Compétences (Skills)', desc: 'Maîtrise de savoir-faire techniques, agricoles et artisanaux' },
        { step: '04', name: 'Certification (Certification)', desc: 'Obtention d’attestations souveraines et infalsifiables' },
        { step: '05', name: 'Opportunités (Opportunity)', desc: 'Mise en relation avec des réseaux de stage et de production' },
        { step: '06', name: 'Nouveau Départ (New Start)', desc: 'Stabilisation et nouveau départ grâce à l’aide financière' },
      ],
      roleInRestart:
        'Le Fonds constitue le levier final de la phase « Nouveau Départ », conçu pour lever les freins matériels initiaux afin que le bénéficiaire stabilise sa trajectoire de vie avec autonomie et dignité.',
    },
    notALoan: {
      badge: 'CADRE D’AIDE NON REMBOURSABLE',
      title: "Ce n'est pas un prêt",
      statement: "Le Fonds ZIRON Restart est conçu comme une aide financière et non comme un prêt. Il ne crée aucune obligation de remboursement.",
      explanation:
        "The ZIRON Restart Fund is designed as financial assistance, not a loan. It is not intended to create a repayment obligation. Aucune charge d'intérêt, aucun nantissement et aucun calendrier de remboursement n'est exigé du bénéficiaire.",
      noDebtNotice: "Un soutien solidaire destiné à favoriser un nouveau départ sans endettement.",
      points: [
        'Ni un prêt bancaire ni un prêt d’investissement avec intérêts.',
        'Aucune obligation de remboursement ni échéancier rétroactif.',
        'Aucun gage d’actifs, garantie d’entreprise ou caution requise.',
        'Ne génère aucune dette et n’impacte pas négativement le passif du bénéficiaire.',
      ],
    },
    freedomOfUse: {
      tag: 'AUTONOMIE DU BÉNÉFICIAIRE',
      title: 'Liberté d’Utilisation selon les Besoins Personnels Légitimes',
      coreStatement: "L'aide financière future n'est pas limitée à l'achat d'équipements imposés ou à un investissement prédéfini.",
      subStatement:
        'Le bénéficiaire utilise l’aide financière selon ses besoins personnels réels et sa situation spécifique, sous réserve des règles officielles fixées lors du lancement.',
      disclaimerNotice:
        'Précision capitale : Les catégories présentées ci-dessous constituent des exemples illustratifs de besoins de stabilisation et NON des obligations de dépense strictes. Le bénéficiaire n’est ni obligé de créer une société commerciale, ni contraint d’acheter des machines imposées sur devis.',
      categories: [
        {
          id: 'living',
          title: 'Besoins Quotidiens & Subsistance',
          desc: 'Couverture des dépenses élémentaires, santé, alimentation et stabilité matérielle immédiate.',
        },
        {
          id: 'housing',
          title: 'Logement & Ancrage Résidentiel',
          desc: 'Règlement de dépôts de garantie, loyers, équipement du foyer ou sécurisation d’un toit digne.',
        },
        {
          id: 'education',
          title: 'Éducation & Formation Professionnelle',
          desc: 'Financement de qualifications certifiantes, stages techniques ou matériel d’apprentissage.',
        },
        {
          id: 'employment',
          title: 'Emploi & Outils de Transition',
          desc: 'Frais de transport, tenues professionnelles, permis ou outillage indispensable à l’embauche.',
        },
        {
          id: 'obligations',
          title: 'Dettes & Obligations Financières',
          desc: 'Apurement d’engagements financiers antérieurs ou de dettes pour libérer l’esprit de tout poids.',
        },
        {
          id: 'activity',
          title: 'Activité Personnelle ou Micro-Entreprise',
          desc: 'Lancement d’une activité artisanale, agricole ou indépendante selon les compétences du bénéficiaire.',
        },
        {
          id: 'family',
          title: 'Équilibre Familial & Personnel',
          desc: 'Prise en charge des personnes à charge, bien-être des enfants et apaisement des aléas du quotidien.',
        },
        {
          id: 'newstart',
          title: 'Besoins Généraux de Nouveau Départ',
          desc: 'Tout projet légitime concourant directement à une insertion digne et durable dans la société.',
        },
      ],
    },
    maxAssistance: {
      tag: 'PLAFOND D’AIDE POTENTIELLE',
      amount: '2 500 000',
      currency: 'DZD',
      caption: 'Aide financière potentielle maximale',
      qualifier: "Aide financière jusqu'à 2 500 000 DZD (Financial assistance of up to 2,500,000 DZD)",
      explanation:
        'Ce montant illustre le plafond maximal pouvant être octroyé à un bénéficiaire individuel. Cela n’implique pas que chaque participant reçoit cette somme exacte. Le montant alloué sera évalué au cas par cas selon les besoins réels justifiés et l’enveloppe disponible lors du lancement officiel.',
    },
    ecosystemFit: {
      tag: 'ARCHITECTURE DU PARCOURS',
      title: 'Intégration du Fonds dans ZIRON RESTART',
      description:
        'Le Fonds appartient au niveau terminal « Nouveau Départ » de l’écosystème. Il constitue un dispositif indépendant qui succède aux étapes de consolidation personnelle.',
      noAutoEntitlementNotice:
        'Règle d’architecture essentielle : L’achèvement des cours de ZIRON School ou l’obtention d’un certificat de fin d’études ne confère AUCUN droit financier automatique. Le Fonds disposera de ses propres critères d’éligibilité, quotas et commissions d’évaluation lors de son ouverture.',
      pillars: [
        { step: '01', name: 'Rétablissement', focus: 'Discipline quotidienne ZIRON & consolidation physiologique', status: 'Actif avec le produit' },
        { step: '02', name: 'Apprentissage', focus: 'Formations appliquées débloquées dès 3 flacons uniques', status: 'Disponible aux qualifiés' },
        { step: '03', name: 'Compétences', focus: 'Ateliers pratiques apicoles, agricoles et technologiques', status: 'En cours dans School' },
        { step: '04', name: 'Certification', focus: 'Attestations cryptographiques souveraines et vérifiables', status: 'Délivré aux lauréats' },
        { step: '05', name: 'Opportunités', focus: 'Partenariats de co-traitance, distribution et mentorat', status: 'En déploiement' },
        { step: '06', name: 'Nouveau Départ (Fonds)', focus: "Aide financière jusqu'à 2 500 000 DZD pour la réinsertion", status: 'Jalon futur en préparation' },
      ],
    },
    currentStatus: {
      tag: 'STATUT DU DISPOSITIF',
      headline: 'Programme actuellement fermé',
      message:
        'Le Fonds ZIRON Restart est actuellement en cours d’élaboration et n’accepte aucune candidature ni ne distribue d’aide financière à ce stade.',
      bullets: [
        'Aucun dépôt de dossier ou formulaire d’inscription n’est ouvert.',
        'Aucun virement ni déblocage de fonds n’est actuellement possible.',
        'Les critères d’éligibilité définitifs seront publiés lors du lancement officiel.',
        'Le règlement complet et la gouvernance seront détaillés lors de l’inauguration.',
      ],
      securityNotice:
        'Avertissement de sécurité : Ne communiquez jamais vos coordonnées bancaires à un tiers prétendant représenter le Fonds. Toutes les démarches officielles seront centralisées sur cette plateforme sécurisée.',
    },
    futureFramework: {
      tag: 'GOUVERNANCE FUTURE',
      title: 'Cadre & Modalités Prévus lors du Lancement',
      description:
        'Lors de son ouverture officielle, le Fonds ZIRON Restart reposera sur des principes stricts de transparence, d’équité et d’impact humain :',
      pillars: [
        { title: 'Critères d’Éligibilité', desc: 'Conditions claires d’accès et exigences de prérequis vérifiables.' },
        { title: 'Assiduité du Parcours', desc: 'Validation de l’engagement préalable dans les programmes ZIRON.' },
        { title: 'Dépôt des Demandes', desc: 'Processus numérique transparent, sans lourdeurs administratives arbitraires.' },
        { title: 'Méthode d’Évaluation', desc: 'Examen holistique fondé sur le besoin réel et la viabilité de réinsertion.' },
        { title: 'Cohortes de Bénéficiaires', desc: 'Attribution par promotions régulières selon la dotation mobilisée.' },
        { title: 'Calibration de l’Aide', desc: 'Adaptation personnalisée du montant en fonction du projet de vie exposé.' },
        { title: 'Comité de Suivi Indépendant', desc: 'Supervision impartiale garantissant l’éthique et l’absence de favoritisme.' },
      ],
      disclaimer: 'Ce cadre méthodologique présente les intentions programmatiques et sera affiné dans la charte officielle.',
    },
    philosophy: {
      tag: 'PHILOSOPHIE RESTART',
      coreProverb: 'Terminer les étapes... et bâtir son métier.',
      quote:
        'ZIRON Restart repose sur un principe fondamental : la régénération mène à l’apprentissage, l’apprentissage ouvre des opportunités, et les opportunités forgent un nouveau départ.',
      missionBody:
        'Au-delà de l’excellence biotechnologique, VIREXON BIOSCIENCES s’engage à offrir à chacun les moyens réels de retrouver sa dignité, son équilibre et un rôle moteur dans la société.',
    },
    cta: {
      title: 'Poursuivez Votre Progression Dès Aujourd’hui',
      subtitle: 'En attendant le déploiement du Fonds, consolidez votre équilibre de vie et développez des compétences concrètes.',
      exploreRestartBtn: 'Explorer ZIRON Restart',
      discoverSchoolBtn: 'Découvrir ZIRON School',
      verifyCertificateBtn: 'Vérifier une Attestation',
    },
    navigation: {
      overview: 'Aperçu',
      school: 'École',
      certificates: 'Certificats',
      opportunities: 'Opportunités',
      restartFund: 'Fonds RESTART',
    },
  },
};
