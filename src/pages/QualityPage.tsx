import React from 'react';
import { useI18n } from '@/context/I18nContext';
import { getPublicTranslations } from '@/lib/i18n/publicTranslations';
import { Button } from '@/components/design-system/Button';
import { GridPattern } from '@/components/design-system/GridPattern';
import {
  Shield,
  FileCheck,
  AlertTriangle,
  ShieldCheck,
  QrCode,
} from 'lucide-react';

export const QualityPage: React.FC = () => {
  const { locale, content, dir, navigate } = useI18n();
  const t = getPublicTranslations(locale);
  const q = t.quality;

  return (
    <div className="py-12 bg-[#F5F7FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* SECTION 1: HEADER DOSSIER */}
        <section className="bg-white border border-[#E2E8F0] p-6 sm:p-12 relative overflow-hidden">
          <GridPattern />
          <div className="relative z-10 max-w-4xl">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#0B2346] font-bold px-2.5 py-1 bg-gray-100 border border-[#E2E8F0]">
                {q.tag}
              </span>
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">
                {q.standardRef}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[#0B2346] leading-tight mb-4">
              {q.title}
            </h1>

            <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-8 max-w-3xl">
              {q.subtitle}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate('verify')}
                className="cursor-pointer flex items-center gap-2"
              >
                <Shield className="w-4 h-4" />
                <span>
                  {locale === 'ar'
                    ? 'التحقق من رمز العبوة'
                    : locale === 'fr'
                    ? 'Vérifier le Code Produit'
                    : 'Verify Product Code'}
                </span>
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={() => navigate('ziron')}
                className="cursor-pointer"
              >
                <span>
                  {locale === 'ar'
                    ? 'فحص مواصفات المنتج'
                    : locale === 'fr'
                    ? 'Inspecter Spécifications Produit'
                    : 'Inspect Product Specifications'}
                </span>
              </Button>
            </div>
          </div>
        </section>

        {/* SECTION 2: QUALITY PHILOSOPHY */}
        <section className="bg-white border border-[#E2E8F0] p-6 sm:p-10">
          <div className="max-w-3xl mb-8">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#0B2346] font-bold block mb-2">
              {locale === 'ar' ? 'الالتزام التأسيسي' : locale === 'fr' ? 'ENGAGEMENT FONDAMENTAL' : 'FOUNDATIONAL COMMITMENT'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0B2346] tracking-tight mb-4">
              {locale === 'ar'
                ? 'فلسفتنا في ضمان الجودة'
                : locale === 'fr'
                ? 'Notre Philosophie d’Assurance Qualité'
                : 'Our Quality Assurance Philosophy'}
            </h2>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              {locale === 'ar'
                ? 'في مجال الصحة التغذوية، لا تُطلب الثقة طلبًا بل تُبنى بالتحقق المنهجي المستمر. تتعامل VIREXON BIOSCIENCES مع التصنيع كمسار تقني منضبط يخضع لمواصفات موثقة.'
                : locale === 'fr'
                ? 'En santé nutritionnelle, la confiance ne se décrète pas : elle se vérifie méthodiquement. VIREXON BIOSCIENCES traite la production comme un pipeline technique rigoureux soumis à des normes écrites.'
                : 'In nutritional health, trust cannot be demanded—it must be systematically verified. VIREXON BIOSCIENCES approaches manufacturing not as a commoditized marketing exercise, but as a disciplined technical pipeline subject to documented internal specifications.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-[#F5F7FA] border border-[#E2E8F0] space-y-3">
              <div className="w-8 h-8 bg-[#0B2346] text-white flex items-center justify-center mb-2">
                <FileCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#0B2346]">
                {locale === 'ar' ? 'بروتوكولات موثقة' : locale === 'fr' ? 'Protocoles Documentés' : 'Documented Protocols'}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {locale === 'ar'
                  ? 'يخضع التصنيع لمعايير جودة موثقة وفحص المواد الأولية وتتبع الدفعات. سيتم نشر وثائق الجودة فور اعتمادها.'
                  : locale === 'fr'
                  ? 'La fabrication respecte des normes documentées de contrôle qualité et de traçabilité des lots. La documentation sera publiée dès disponibilité.'
                  : 'Manufacturing adheres to documented quality control standards, raw material screening protocols, and batch traceability. Quality documentation will be published as available.'}
              </p>
            </div>

            <div className="p-6 bg-[#F5F7FA] border border-[#E2E8F0] space-y-3">
              <div className="w-8 h-8 bg-[#0B2346] text-white flex items-center justify-center mb-2">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#0B2346]">
                {locale === 'ar' ? 'لا ادعاءات مختلقة' : locale === 'fr' ? 'Zéro Allégations Fantaisistes' : 'Zero Fabricated Claims'}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {locale === 'ar'
                  ? 'نرفض تمامًا استخدام أختام وهمية أو شهادات غير مؤكدة. نحدد معاييرنا الحالية بدقة ومصداقية تامة.'
                  : locale === 'fr'
                  ? 'Nous rejetons formellement les certifications invérifiables ou sceaux factices. Nos normes actuelles sont énoncées avec rigueur factuelle.'
                  : 'We strictly reject unsubstantiated certifications or fabricated regulatory seals. We state our current standards with absolute factual precision.'}
              </p>
            </div>

            <div className="p-6 bg-[#F5F7FA] border border-[#E2E8F0] space-y-3">
              <div className="w-8 h-8 bg-[#0B2346] text-white flex items-center justify-center mb-2">
                <QrCode className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#0B2346]">
                {locale === 'ar' ? 'تتبع فردي لكل عبوة' : locale === 'fr' ? 'Traçabilité par Unité' : 'Container-Level Tracking'}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {locale === 'ar'
                  ? 'نمنع التزييف عبر تخصيص رمز تحقق تسلسلي مشفر فريد لكل عبوة فيزيائية تحوي 30 كبسولة.'
                  : locale === 'fr'
                  ? 'La contrefaçon est prévenue par l’attribution d’un code sérialisé unique à chaque flacon physique de 30 gélules.'
                  : 'Counterfeits are prevented by assigning an individualized serialized verification code to every physical 30-capsule phase container.'}
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 3: MULTI-STAGE QUALITY GATES */}
        <section className="space-y-6">
          <div className="max-w-3xl">
            <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500 font-bold block mb-1">
              {q.gatesTag}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0B2346] tracking-tight">
              {q.gatesTitle}
            </h2>
            <p className="text-sm text-gray-600 mt-2">
              {q.gatesSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {q.gates.map((gate) => (
              <div key={gate.num} className="bg-white border border-[#E2E8F0] p-6 sm:p-8 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold bg-[#0B2346] text-white px-2 py-0.5">
                    {gate.num}
                  </span>
                  <span className="text-[11px] font-mono text-gray-400">
                    {locale === 'ar' ? 'معيار موثق' : locale === 'fr' ? 'NORME CONTRÔLÉE' : 'CONTROLLED GATE'}
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#0B2346]">{gate.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{gate.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 4: SAMPLE / DEMONSTRATION BATCH DOSSIER */}
        <section className="bg-white border border-[#E2E8F0] p-6 sm:p-10">
          {/* Explicit Mandatory Demonstration Notice */}
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 flex items-start gap-3 text-amber-900">
            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-700 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <div className="font-bold font-mono tracking-wider uppercase mb-0.5">
                {content.quality.sampleNotice}
              </div>
              <p>
                {locale === 'ar'
                  ? 'تمثل معلمات العينات المعروضة أدناه بنية البيانات التوضيحية لنظام التحقق من VIREXON. سيتم ربط تقارير التحليل المباشرة بأرقام الدفعات الحقيقية فور انتهاء الإنتاج والتسجيل الرسمي.'
                  : locale === 'fr'
                  ? 'Les paramètres ci-dessous représentent le schéma de données techniques du système de vérification VIREXON. Les certificats d’analyse finaux seront liés aux lots réels dès fabrication.'
                  : 'The specimen parameters displayed below represent the technical data schema and verification layout used by the VIREXON verification system. Production analytical test reports and certificates of analysis will be linked to live verified batch numbers following product manufacturing and registration.'}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 mb-6">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400">
                {locale === 'ar' ? 'هندسة بيانات التحقق' : locale === 'fr' ? 'ARCHITECTURE DE DONNÉES' : 'VERIFICATION DATA ARCHITECTURE'}
              </span>
              <h3 className="text-lg font-bold text-[#0B2346]">
                {locale === 'ar' ? 'نموذج ملف العبوة التوضيحي' : locale === 'fr' ? 'Profil Type de Flacon Spécimen' : 'Specimen Container Profile Schema'}
              </h3>
            </div>
            <div className="text-xs font-mono bg-gray-100 px-3 py-1.5 text-gray-700 border border-gray-200">
              SERIAL TEMPLATE: ZR-XXXX-XXXX-XXXX
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-4 bg-gray-50 border border-gray-200">
              <div className="text-gray-500 mb-1 text-[11px]">
                {locale === 'ar' ? 'تنسيق المعرّف:' : locale === 'fr' ? 'Format Identifiant :' : 'Identifier Format:'}
              </div>
              <div className="font-mono font-bold text-[#0B2346]">
                {locale === 'ar' ? '16 حرفًا أبجديًا رقميًا' : locale === 'fr' ? '16 Caractères Alphanumériques' : '16-Char Alphanumeric'}
              </div>
              <div className="text-[10px] text-gray-400 mt-1">
                {locale === 'ar' ? 'تشفير عالي التشتت' : locale === 'fr' ? 'Graine cryptographique robuste' : 'High-entropy cryptographic seed'}
              </div>
            </div>
            <div className="p-4 bg-gray-50 border border-gray-200">
              <div className="text-gray-500 mb-1 text-[11px]">
                {locale === 'ar' ? 'عدد الكبسولات / العبوة:' : locale === 'fr' ? 'Gélules par Flacon :' : 'Capsule Count / Container:'}
              </div>
              <div className="font-mono font-bold text-[#0B2346]">
                {locale === 'ar' ? '30 كبسولة / وحدة' : locale === 'fr' ? '30 Gélules / Unité' : '30 Capsules / Unit'}
              </div>
              <div className="text-[10px] text-gray-400 mt-1">
                {locale === 'ar' ? 'إمداد مرحلي لـ 30 يومًا' : locale === 'fr' ? 'Phase unique de 30 jours' : 'Single 30-day supply phase'}
              </div>
            </div>
            <div className="p-4 bg-gray-50 border border-gray-200">
              <div className="text-gray-500 mb-1 text-[11px]">
                {locale === 'ar' ? 'السوق الإقليمي:' : locale === 'fr' ? 'Marché Régional :' : 'Regional Market:'}
              </div>
              <div className="font-mono font-bold text-[#0B2346]">
                {locale === 'ar' ? 'سوق الجزائر (د.ج)' : locale === 'fr' ? 'Lancement Algérie (DZD)' : 'Algeria Launch (DZD)'}
              </div>
              <div className="text-[10px] text-gray-400 mt-1">
                {locale === 'ar' ? 'نطاق التوزيع الأولي' : locale === 'fr' ? 'Territoire commercial désigné' : 'Designated commercial territory'}
              </div>
            </div>
            <div className="p-4 bg-gray-50 border border-gray-200">
              <div className="text-gray-500 mb-1 text-[11px]">
                {locale === 'ar' ? 'نظام التحقق الخلفي:' : locale === 'fr' ? 'Vérification Backend :' : 'Backend Verification:'}
              </div>
              <div className="font-mono font-bold text-emerald-700">
                {locale === 'ar' ? 'سجل قاعدة البيانات الموثق' : locale === 'fr' ? 'Registre Base de Données Sécurisé' : 'Firebase Firestore Ready'}
              </div>
              <div className="text-[10px] text-gray-400 mt-1">
                {locale === 'ar' ? 'صلاحيات مركزية آمنة' : locale === 'fr' ? 'Zéro autorité côté client' : 'Zero client-side authority'}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[11px] text-gray-500">
            <span>
              {locale === 'ar'
                ? 'سيتم نشر وثائق التصنيع والجودة فور توفرها واعتمادها.'
                : locale === 'fr'
                ? 'La documentation de fabrication et de qualité sera publiée dès disponibilité.'
                : 'Manufacturing and quality documentation will be published as available.'}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('verify')}
              className="cursor-pointer"
            >
              {locale === 'ar'
                ? 'تجربة واجهة التحقق ←'
                : locale === 'fr'
                ? 'Tester l’Interface de Vérification →'
                : 'Test Verification Interface →'}
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
};

