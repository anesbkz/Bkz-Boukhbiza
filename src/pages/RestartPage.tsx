import React from 'react';
import { useI18n } from '@/context/I18nContext';
import { getPublicTranslations } from '@/lib/i18n/publicTranslations';
import { Button } from '@/components/design-system/Button';
import { GridPattern } from '@/components/design-system/GridPattern';
import { Alert } from '@/components/design-system/Alert';

export const RestartPage: React.FC = () => {
  const { locale, navigate } = useI18n();
  const t = getPublicTranslations(locale);
  const r = t.restart;

  return (
    <div className="py-12 bg-[#F5F7FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* SECTION 1: HEADER DOSSIER */}
        <section className="bg-white border border-[#E2E8F0] p-6 sm:p-12 relative overflow-hidden">
          <GridPattern />
          <div className="relative z-10 max-w-4xl">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#0B2346] font-bold px-2.5 py-1 bg-gray-100 border border-[#E2E8F0]">
                {r.tag}
              </span>
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">
                PROTOCOL REF: VX-RST-RECOVERY-01
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[#0B2346] leading-tight mb-4">
              {r.title}
            </h1>

            <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-6 max-w-3xl">
              {r.subtitle}
            </p>

            <div className="p-4 bg-blue-50 border border-blue-200 text-xs text-blue-900 leading-relaxed max-w-3xl">
              <strong>{r.principleTag}:</strong> {r.principleBody}
            </div>
          </div>
        </section>

        {/* SECTION 2: UNDERSTANDING ROUTINE INTERRUPTION */}
        <section className="bg-white border border-[#E2E8F0] p-6 sm:p-10">
          <div className="max-w-3xl mb-8">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#0B2346] font-bold block mb-2">
              {locale === 'ar' ? 'سيكولوجيا السلوك' : locale === 'fr' ? 'PSYCHOLOGIE COMPORTEMENTALE' : 'BEHAVIORAL PSYCHOLOGY'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0B2346] tracking-tight mb-4">
              {r.principleTitle}
            </h2>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              {r.principleBody}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-[#F5F7FA] border border-[#E2E8F0] space-y-3">
              <h3 className="text-sm font-bold text-[#0B2346]">
                {locale === 'ar' ? 'التعرف على عامل الانقطاع' : locale === 'fr' ? 'Identifier la Cause de Rupture' : 'Recognize the Disruption Factor'}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {locale === 'ar'
                  ? 'السفر أو التوعك الصحي أو التوتر اليومي عوامل متكررة قد تعطل الروتين الصباحي. تشخيص السبب يزيل الحيرة والتشتت.'
                  : locale === 'fr'
                  ? 'Déplacements, stress aigu ou aléas du quotidien interrompent fréquemment les habitudes matinales. Identifier la cause évite la confusion.'
                  : 'Travel, acute illness, emotional stress, or schedule disruptions frequently interrupt morning routines. Acknowledging the trigger removes confusion.'}
              </p>
            </div>

            <div className="p-6 bg-[#F5F7FA] border border-[#E2E8F0] space-y-3">
              <h3 className="text-sm font-bold text-[#0B2346]">
                {locale === 'ar' ? 'نبذ لغة العقاب واللوم' : locale === 'fr' ? 'Zéro Culpabilisation' : 'Zero Punitive Framing'}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {locale === 'ar'
                  ? 'الشعور بالذنب يولد الإحباط والتجنب. تعامل مع اليوم الضائع كبيانات فنية تتطلب تصحيحًا هادئًا دون جلد للذات.'
                  : locale === 'fr'
                  ? 'La culpabilité invite à l’abandon. Traitez une journée manquée comme une simple variation nécessitant un recalibrage serein.'
                  : 'Guilt induces shame, and shame invites further avoidance. Treat a missed intake day as an empirical deviation requiring a simple corrective action.'}
              </p>
            </div>

            <div className="p-6 bg-[#F5F7FA] border border-[#E2E8F0] space-y-3">
              <h3 className="text-sm font-bold text-[#0B2346]">
                {locale === 'ar' ? 'العودة الفورية للمسار' : locale === 'fr' ? 'Réancrage Immédiat' : 'Immediate Baseline Re-entry'}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {locale === 'ar'
                  ? 'لا تضاعف الجرعة أبدًا. استأنف كبسولة واحدة طبيعية في الموعد الصباحي التالي مع كوب الماء.'
                  : locale === 'fr'
                  ? 'Ne doublez jamais la dose. Reprenez simplement une gélule unique au prochain petit-déjeuner avec de l’eau.'
                  : 'Do not attempt double-dosing or extreme compensatory measures. Simply resume the standard single-capsule intake at the next scheduled morning window.'}
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 3: THE 3-STEP RESET PROTOCOL */}
        <section className="space-y-6">
          <div className="max-w-3xl">
            <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500 font-bold block mb-1">
              {r.stepsTag}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0B2346] tracking-tight">
              {r.stepsTitle}
            </h2>
            <p className="text-sm text-gray-600 mt-2">
              {r.stepsSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {r.steps.map((step) => (
              <div key={step.stepNum} className="bg-white border border-[#E2E8F0] p-6 sm:p-8 space-y-4">
                <div className="w-10 h-10 bg-[#0B2346] text-white flex items-center justify-center font-mono font-bold text-sm">
                  {step.stepNum}
                </div>
                <div className="text-[10px] font-mono text-gray-400 uppercase font-bold">
                  {step.action}
                </div>
                <h3 className="text-lg font-bold text-[#0B2346]">{step.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 4: PHYSICAL VS. DIGITAL RESET DISTINCTION */}
        <section className="bg-white border border-[#E2E8F0] p-6 sm:p-10">
          <div className="max-w-3xl mb-6">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#0B2346] font-bold block mb-1">
              {locale === 'ar' ? 'آليات النظام' : locale === 'fr' ? 'MÉCANIQUE DU SYSTÈME' : 'SYSTEM MECHANICS'}
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-[#0B2346] tracking-tight mb-2">
              {locale === 'ar'
                ? 'المخزون الفيزيائي مقابل استقرار الاستحقاق الرقمي'
                : locale === 'fr'
                ? 'Stock Physique vs Stabilité des Droits Numériques'
                : 'Physical Supply vs. Digital Entitlement Stability'}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              {locale === 'ar'
                ? 'نفصل بدقة بين عداد الأيام المتتالية وبين حقوقك الدائمة في النظام الأساسي:'
                : locale === 'fr'
                ? 'Nous distinguons les statistiques de régularité quotidienne de vos droits permanents d’accès :'
                : 'We separate consecutive daily tracking statistics from fundamental platform access:'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-gray-600 mb-6">
            <div className="p-5 bg-[#F5F7FA] border border-[#E2E8F0] space-y-2">
              <span className="font-bold text-[#0B2346] block text-sm">
                {locale === 'ar' ? 'مخزون الكبسولات الفيزيائي' : locale === 'fr' ? 'Stock Physique de Gélules' : 'Physical Capsule Supply'}
              </span>
              <p className="leading-relaxed">
                {locale === 'ar'
                  ? 'تفويت يوم واحد يؤجل انتهاء عبوة الـ 30 كبسولة بمقدار 24 ساعة فقط. تظل عبوتك صالحة تمامًا حتى استهلاك كامل الكبسولات الثلاثين.'
                  : locale === 'fr'
                  ? 'Manquer une prise prolonge simplement votre flacon de 30 gélules de 24h. Le flacon reste valide jusqu’à la dernière gélule.'
                  : 'Missing a single dose simply extends your 30-capsule supply by 24 hours. Your physical container remains completely valid until all 30 capsules are consumed. If a container is lost or damaged, you may order a replacement phase unit from our catalog.'}
              </p>
            </div>

            <div className="p-5 bg-[#F5F7FA] border border-[#E2E8F0] space-y-2">
              <span className="font-bold text-[#0B2346] block text-sm">
                {locale === 'ar' ? 'الاستحقاقات الرقمية وحالة الحساب' : locale === 'fr' ? 'Droits Numériques & Accès' : 'Digital Entitlements & Streak'}
              </span>
              <p className="leading-relaxed">
                {locale === 'ar'
                  ? 'رغم أن عداد الأيام المتتالية قد يعود لنقطة البداية عند تفويت التسجيل، إلا أن استحقاقاتك التعليمية في مدرسة ZIRON وعضوية المجتمع لا تُلغى أبدًا.'
                  : locale === 'fr'
                  ? 'Bien que le compteur de jours consécutifs puisse redémarrer, votre accès aux cours ZIRON School et à la communauté reste permanent.'
                  : 'While consecutive check-in streak counters may reset upon an unlogged day, your foundational account entitlements (ZIRON School curriculum access and Community membership) are never revoked punitively. They remain permanently linked to your verified container code.'}
              </p>
            </div>
          </div>

          <Alert
            variant="info"
            title={
              locale === 'ar'
                ? 'ضمان عدم الإقصاء أو الجزاء'
                : locale === 'fr'
                ? 'Garantie d’Accès Permanent'
                : 'Zero Penalty Guarantee'
            }
          >
            {locale === 'ar'
              ? 'حقوقك التعليمية ومشاركتك في المجموعات استحقاقات دائمة لا تتأثر بالانقطاع المؤقت.'
              : locale === 'fr'
              ? 'Vos accès pédagogiques et privilèges communautaires sont permanents et ne sont jamais révoqués suite à une interruption de routine.'
              : 'Your educational access and verified cohort privileges are permanent entitlements. Routine lapses reset personal streak counters, not your membership status.'}
          </Alert>
        </section>

        {/* SECTION 5: ETHICAL BOUNDARIES & CLINICAL DISCLOSURE */}
        <section className="bg-white border border-[#E2E8F0] p-6 sm:p-10">
          <div className="max-w-3xl mb-6">
            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-700 font-bold block mb-1">
              {locale === 'ar' ? 'حدود صحية هامة' : locale === 'fr' ? 'LIMITES SANITAIRES STRICTES' : 'IMPORTANT HEALTH BOUNDARIES'}
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-[#0B2346] tracking-tight mb-2">
              {locale === 'ar' ? 'الموارد الإرشادية والنطاق الطبي' : locale === 'fr' ? 'Ressources & Cadre Médical' : 'Support Resources & Medical Scope'}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              {locale === 'ar'
                ? 'بروتوكول إعادة التشغيل في ZIRON أداة تدريبية للمساعدة السلوكية، وليس خدمة طوارئ طبية أو نفسية.'
                : locale === 'fr'
                ? 'Le protocole Restart ZIRON est un outil d’accompagnement d’habitudes, et non un service médical ou psychiatrique d’urgence.'
                : 'The ZIRON Restart Protocol is a lifestyle adherence tool, not a medical or psychiatric crisis service.'}
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 leading-relaxed">
              <strong>
                {locale === 'ar'
                  ? 'لسنا مركز طوارئ أو مصحة علاج إدمان:'
                  : locale === 'fr'
                  ? 'PAS UN SERVICE D’URGENCE NI DE SEVRAGE MÉDICAL :'
                  : 'NOT A CRISIS CENTER OR MEDICAL DETOX SERVICE:'}
              </strong>{' '}
              {locale === 'ar'
                ? 'لا تقدم VIREXON BIOSCIENCES استشارات طبية طارئة أو إشرافًا علاجيًا على أعراض الانسحاب. إذا كنت تعاني من أزمة نفسية حادة أو أعراض جسدية طارئة، يرجى الاتصال فورًا بخدمات الطوارئ الطبية أو الطبيب المختص.'
                : locale === 'fr'
                ? 'VIREXON BIOSCIENCES ne fournit pas d’assistance médicale d’urgence ni de suivi clinique de désintoxication. En cas de détresse psychologique ou de crise aiguë, contactez immédiatement les services d’urgence ou un médecin.'
                : 'VIREXON BIOSCIENCES does not provide medical emergency assistance, clinical detox monitoring, or psychiatric interventions. If you are experiencing severe physiological withdrawal, psychological crisis, thoughts of self-harm, or substance intoxication, immediately contact local emergency medical services or consult a licensed physician.'}
            </div>

            <div className="p-4 bg-[#F5F7FA] border border-[#E2E8F0] text-gray-600 leading-relaxed">
              <strong>
                {locale === 'ar'
                  ? 'استشارة الفريق الطبي المختص:'
                  : locale === 'fr'
                  ? 'CONSULTATION MÉDICALE OBLIGATOIRE :'
                  : 'LICENSED HEALTHCARE CONSULTATION:'}
              </strong>{' '}
              {locale === 'ar'
                ? 'يجب على الأفراد الذين يتابعون علاجات لحالات صحية مزمنة التنسيق دائمًا مع أطبائهم قبل إجراء أي تغييرات في نمط حياتهم أو تناول المكملات.'
                : locale === 'fr'
                ? 'Les personnes sous traitement pour des pathologies chroniques doivent impérativement coordonner toute modification de routine avec leur médecin traitant.'
                : 'Participants managing diagnosed health conditions or undergoing medical treatment must make all therapeutic decisions in coordination with their healthcare providers.'}
            </div>
          </div>
        </section>

        {/* SECTION 6: CTA BANNER */}
        <section className="bg-[#0B2346] text-white p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-2xl">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-2">
              {locale === 'ar'
                ? 'استعد انضباط روتينك اليوم'
                : locale === 'fr'
                ? 'Reprenez Votre Trajectoire Aujourd’hui'
                : 'Re-establish Your Routine Today'}
            </h2>
            <p className="text-xs text-white/70 leading-relaxed">
              {locale === 'ar'
                ? 'اطلب عبوة بديلة للمرحلة الأولى أو تحقق من رمز عبوتك للعودة إلى منصة المشاركين.'
                : locale === 'fr'
                ? 'Commandez un flacon de remplacement Phase 01 ou authentifiez votre code flacon pour réaccéder au Hub.'
                : 'Order a replacement Phase 01 container or authenticate your container code to re-enter the ZIRON Hub.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-3 shrink-0">
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate('shop')}
              className="bg-white text-[#0B2346] hover:bg-gray-100 cursor-pointer"
            >
              {locale === 'ar' ? 'طلب عبوة المرحلة 01' : locale === 'fr' ? 'Commander Flacon Phase 01' : 'Order Phase 01 Container'}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('verify')}
              className="border-white/30 text-white hover:bg-white/10 cursor-pointer"
            >
              {locale === 'ar' ? 'التحقق من رمز العبوة' : locale === 'fr' ? 'Vérifier le Code Flacon' : 'Verify Container Code'}
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
};

