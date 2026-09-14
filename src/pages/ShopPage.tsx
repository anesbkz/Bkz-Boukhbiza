import React, { useState } from 'react';
import { useI18n } from '@/context/I18nContext';
import { getLocalizedCatalog, formatDzdPrice, CatalogItem } from '@/lib/content/catalog';
import { getPublicTranslations } from '@/lib/i18n/publicTranslations';
import { Button } from '@/components/design-system/Button';
import { Card } from '@/components/design-system/Card';
import { Badge } from '@/components/design-system/Badge';
import { GridPattern } from '@/components/design-system/GridPattern';
import {
  Check,
  ShoppingBag,
  Shield,
  Truck,
  Package,
  EyeOff,
  CheckCircle2,
  X,
  CreditCard,
  QrCode,
} from 'lucide-react';

export const ShopPage: React.FC = () => {
  const { locale } = useI18n();
  const t = getPublicTranslations(locale);
  const s = t.shop;

  const catalog = getLocalizedCatalog(locale);
  const phaseItems = catalog.filter((item) => item.phase !== 'BUNDLE');
  const bundleItem = catalog.find((item) => item.phase === 'BUNDLE');

  const [selectedProduct, setSelectedProduct] = useState<CatalogItem | null>(null);
  const [orderModalOpen, setOrderModalOpen] = useState<boolean>(false);
  const [orderSubmitted, setOrderSubmitted] = useState<boolean>(false);

  // Form State
  const [fullName, setFullName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [wilaya, setWilaya] = useState<string>('16 - Alger');

  const handleOpenOrder = (product: CatalogItem) => {
    setSelectedProduct(product);
    setOrderSubmitted(false);
    setOrderModalOpen(true);
  };

  const handleConfirmOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setOrderSubmitted(true);
  };

  const wilayasList = [
    '01 - Adrar', '02 - Chlef', '03 - Laghouat', '04 - Oum El Bouaghi', '05 - Batna',
    '06 - Béjaïa', '07 - Biskra', '08 - Béchar', '09 - Blida', '10 - Bouira',
    '11 - Tamanrasset', '12 - Tébessa', '13 - Tlemcen', '14 - Tiaret', '15 - Tizi Ouzou',
    '16 - Alger', '17 - Djelfa', '18 - Jijel', '19 - Sétif', '20 - Saïda',
    '21 - Skikda', '22 - Sidi Bel Abbès', '23 - Annaba', '24 - Guelma', '25 - Constantine',
    '26 - Médéa', '27 - Mostaganem', '28 - M\'Sila', '29 - Mascara', '30 - Ouargla',
    '31 - Oran', '32 - El Bayadh', '33 - Illizi', '34 - Bordj Bou Arréridj', '35 - Boumerdès',
    '36 - El Tarf', '37 - Tindouf', '38 - Tissemsilt', '39 - El Oued', '40 - Khenchela',
    '41 - Souk Ahras', '42 - Tipaza', '43 - Mila', '44 - Aïn Defla', '45 - Naâma',
    '46 - Aïn Témouchent', '47 - Ghardaïa', '48 - Relizane', '49 - Timimoun', '50 - Bordj Badji Mokhtar',
    '51 - Ouled Djellal', '52 - Béni Abbès', '53 - In Salah', '54 - In Guezzam', '55 - Touggourt',
    '56 - Djanet', '57 - El M\'Ghair', '58 - El Meniaa',
  ];

  return (
    <div className="py-12 bg-[#F5F7FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* SECTION 1: HEADER DOSSIER */}
        <section className="bg-white border border-[#E2E8F0] p-6 sm:p-12 relative overflow-hidden">
          <GridPattern />
          <div className="relative z-10 max-w-4xl">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#0B2346] font-bold px-2.5 py-1 bg-gray-100 border border-[#E2E8F0]">
                {s.tag}
              </span>
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">
                {s.marketTag}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[#0B2346] leading-tight mb-4">
              {s.title}
            </h1>

            <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-6 max-w-3xl">
              {s.subtitle}
            </p>

            <div className="flex flex-wrap gap-4 text-xs font-semibold text-gray-600">
              <div className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#0B2346]" />
                <span>{s.deliveryTag}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-[#0B2346]" />
                <span>{s.codTag}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <EyeOff className="w-4 h-4 text-[#0B2346]" />
                <span>{s.discreetPackagingTag}</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: 90-DAY COMPLETE BUNDLE (FEATURED) */}
        {bundleItem && (
          <section className="bg-white border-2 border-[#0B2346] p-6 sm:p-10 shadow-sm relative">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="max-w-2xl space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="navy">{bundleItem.badgeText}</Badge>
                  <span className="text-xs font-mono text-gray-400">{bundleItem.sku}</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-[#0B2346] tracking-tight">
                  {bundleItem.name}
                </h2>

                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  {bundleItem.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 bg-[#F5F7FA] border border-[#E2E8F0]">
                    <span className="block text-[10px] font-mono uppercase text-red-600 font-bold">
                      {locale === 'ar' ? 'الشهر 01 • ختم أحمر' : locale === 'fr' ? 'Mois 01 • Sceau Rouge' : 'Month 01 • Red Seal'}
                    </span>
                    <span className="text-xs font-bold text-[#0B2346]">
                      {locale === 'ar' ? '30 كبسولة (الأيام 01–30)' : locale === 'fr' ? '30 gélules (Jours 01–30)' : '30 Caps (Days 01–30)'}
                    </span>
                  </div>
                  <div className="p-3 bg-[#F5F7FA] border border-[#E2E8F0]">
                    <span className="block text-[10px] font-mono uppercase text-amber-600 font-bold">
                      {locale === 'ar' ? 'الشهر 02 • ختم برتقالي' : locale === 'fr' ? 'Mois 02 • Sceau Orange' : 'Month 02 • Orange Seal'}
                    </span>
                    <span className="text-xs font-bold text-[#0B2346]">
                      {locale === 'ar' ? '30 كبسولة (الأيام 31–60)' : locale === 'fr' ? '30 gélules (Jours 31–60)' : '30 Caps (Days 31–60)'}
                    </span>
                  </div>
                  <div className="p-3 bg-[#F5F7FA] border border-[#E2E8F0]">
                    <span className="block text-[10px] font-mono uppercase text-emerald-600 font-bold">
                      {locale === 'ar' ? 'الشهر 03 • ختم أخضر' : locale === 'fr' ? 'Mois 03 • Sceau Vert' : 'Month 03 • Green Seal'}
                    </span>
                    <span className="text-xs font-bold text-[#0B2346]">
                      {locale === 'ar' ? '30 كبسولة (الأيام 61–90)' : locale === 'fr' ? '30 gélules (Jours 61–90)' : '30 Caps (Days 61–90)'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 text-xs text-gray-600 pt-2">
                  {s.bundleSpecs.map((spec, idx) => (
                    <span key={idx} className="flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-600" />
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-start lg:items-end justify-between gap-4 border-t lg:border-t-0 pt-6 lg:pt-0 border-gray-100 shrink-0">
                <div className="text-start lg:text-end">
                  <span className="text-[11px] uppercase tracking-wider text-gray-500 block">
                    {locale === 'ar' ? 'سعر الحزمة الكاملة لـ 90 يومًا' : locale === 'fr' ? 'Pack Complet 90 Jours (DZD)' : 'Complete 90-Day Package (DZD)'}
                  </span>
                  <span className="text-2xl sm:text-3xl font-black font-mono text-[#0B2346]">
                    {formatDzdPrice(bundleItem.priceDzd, locale)}
                  </span>
                  <span className="text-[11px] text-emerald-700 block font-medium mt-0.5">
                    {locale === 'ar' ? 'توفير 1,000 د.ج مقارنة بالعبوات المنفردة' : locale === 'fr' ? 'Économie de 1 000 DZD par rapport aux phases individuelles' : 'Save 1,000 DZD compared to individual phases'}
                  </span>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => handleOpenOrder(bundleItem)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{s.orderBundleBtn}</span>
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* SECTION 3: INDIVIDUAL 30-DAY CONTAINERS */}
        <section className="space-y-6">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#0B2346] font-bold block mb-1">
              {locale === 'ar' ? 'التزويد الفردي للمراحل' : locale === 'fr' ? 'RÉAPPROVISIONNEMENT PAR PHASE' : 'INDIVIDUAL REPLENISHMENT'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0B2346] tracking-tight">
              {s.individualSectionTitle}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              {s.individualSectionSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {phaseItems.map((item) => (
              <Card
                key={item.id}
                variant="default"
                className="flex flex-col justify-between border-t-4"
                style={{ borderTopColor: item.containerColorHex }}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="navy">{item.badgeText}</Badge>
                    <span className="text-[11px] font-mono text-gray-400">{item.sku}</span>
                  </div>

                  <h3 className="text-xl font-bold text-[#0B2346]">{item.name}</h3>

                  <div className="bg-[#F5F7FA] border border-[#E2E8F0] p-3 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 font-medium">
                        {locale === 'ar' ? 'حجم العبوة:' : locale === 'fr' ? 'Volume de gélules :' : 'Capsule Volume:'}
                      </span>
                      <span className="font-bold text-[#0B2346]">
                        {item.capsuleCount} {locale === 'ar' ? 'كبسولة' : locale === 'fr' ? 'gélules' : 'capsules'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 font-medium">
                        {locale === 'ar' ? 'فترة الروتين:' : locale === 'fr' ? 'Durée de la phase :' : 'Routine Target:'}
                      </span>
                      <span className="font-bold text-[#0B2346]">
                        {item.supplyDays} {locale === 'ar' ? 'يومًا' : locale === 'fr' ? 'jours' : 'days'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-1.5 border-t border-gray-200">
                      <span className="text-gray-500 font-medium">
                        {locale === 'ar' ? 'السعر (د.ج):' : locale === 'fr' ? 'Prix (DZD) :' : 'Price (DZD):'}
                      </span>
                      <span className="font-bold font-mono text-[#0B2346] text-sm">
                        {formatDzdPrice(item.priceDzd, locale)}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed">
                    {item.description}
                  </p>

                  <ul className="text-[11px] text-gray-600 space-y-1 pt-2 border-t border-gray-100">
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{item.colorName} {locale === 'ar' ? 'شريط أمان ملون' : locale === 'fr' ? 'sceau inviolable' : 'tamper-evident seal'}</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{locale === 'ar' ? 'رمز تسلسلي أمني مكون من 16 خانة' : locale === 'fr' ? 'Code sérialisé unique de 16 caractères' : 'Single serialized 16-character code'}</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{locale === 'ar' ? 'صلاحية رقمية في منصة ZIRON' : locale === 'fr' ? 'Accès numérique à la plateforme ZIRON' : 'Digital ZIRON Hub phase access'}</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-gray-500">
                    {item.colorName}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenOrder(item)}
                    className="cursor-pointer"
                  >
                    {s.selectPhaseBtn}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* SECTION 4: WHAT EACH PURCHASE INCLUDES */}
        <section className="bg-white border border-[#E2E8F0] p-6 sm:p-10">
          <div className="max-w-3xl mb-8">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#0B2346] font-bold block mb-2">
              {locale === 'ar' ? 'مواصفات التسليم' : locale === 'fr' ? 'SPÉCIFICATIONS DU COLIS' : 'DELIVERABLE SPECIFICATION'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0B2346] tracking-tight mb-4">
              {locale === 'ar' ? 'ما تتضمنه كل شحنة أصلية' : locale === 'fr' ? 'Ce Que Comprend Chaque Colis' : 'What Every Purchase Includes'}
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              {locale === 'ar'
                ? 'تخضع كل وحدة يتم شحنها من مستودعاتنا لمعايير صارمة في الأصالة الفيزيائية والمصادقة الرقمية:'
                : locale === 'fr'
                ? 'Chaque unité expédiée depuis nos dépôts répond à des critères rigoureux de conformité physique et numérique :'
                : 'Every unit dispatched from our facilities conforms to strict physical and digital provenance standards:'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 bg-[#F5F7FA] border border-[#E2E8F0] space-y-2">
              <Package className="w-6 h-6 text-[#0B2346]" />
              <h3 className="text-xs font-bold text-[#0B2346] uppercase">
                {locale === 'ar' ? 'العبوة الفيزيائية' : locale === 'fr' ? 'Flacon Haute Densité' : 'Physical Container'}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {locale === 'ar'
                  ? 'عبوة كهرمانية عالية الكثافة لحماية الكبسولات من التحلل الضوئي والرطوبة الجوية.'
                  : locale === 'fr'
                  ? 'Flacon ambré protecteur contre les dégradations UV et l’humidité ambiante.'
                  : 'High-density amber container protecting capsules against UV photodegradation and atmospheric moisture.'}
              </p>
            </div>

            <div className="p-5 bg-[#F5F7FA] border border-[#E2E8F0] space-y-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              <h3 className="text-xs font-bold text-[#0B2346] uppercase">
                {locale === 'ar' ? '30 كبسولة / عبوة' : locale === 'fr' ? '30 Gélules / Flacon' : '30 Capsules / Unit'}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {locale === 'ar'
                  ? 'كبسولات نباتية 100% نقية خالية من الملونات الاصطناعية أو المكونات غير المعلنة.'
                  : locale === 'fr'
                  ? 'Gélules végétales pures, sans colorants synthétiques ni mélanges opaques.'
                  : 'Vegetarian capsule shells formulated without synthetic dyes, artificial flow agents, or undisclosed blends.'}
              </p>
            </div>

            <div className="p-5 bg-[#F5F7FA] border border-[#E2E8F0] space-y-2">
              <Shield className="w-6 h-6 text-[#0B2346]" />
              <h3 className="text-xs font-bold text-[#0B2346] uppercase">
                {locale === 'ar' ? 'ختم الأمان اللوني' : locale === 'fr' ? 'Sceau de Sécurité Coloré' : 'Color-Coded Seal'}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {locale === 'ar'
                  ? 'شريط حماية محكم حول العنق يُظهر دليلًا بصريًا قاطعًا في حال محاولة الفتح أو العبث.'
                  : locale === 'fr'
                  ? 'Bandeau de sécurité au col révélant toute tentative d’ouverture préalable.'
                  : 'Tamper-evident neck band showing immediate visual evidence of opening or interference.'}
              </p>
            </div>

            <div className="p-5 bg-[#F5F7FA] border border-[#E2E8F0] space-y-2">
              <QrCode className="w-6 h-6 text-[#0B2346]" />
              <h3 className="text-xs font-bold text-[#0B2346] uppercase">
                {locale === 'ar' ? 'الرمز التسلسلي الفردي' : locale === 'fr' ? 'Code Sérialisé Crypté' : 'Serialized Security Code'}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {locale === 'ar'
                  ? 'رمز مكون من 16 خانة يؤكد أصالة العبوة ويفعل حق الوصول إلى منصة ZIRON والمجتمع.'
                  : locale === 'fr'
                  ? 'Code unique de 16 caractères pour authentifier le flacon et débloquer les modules ZIRON.'
                  : 'Unique 16-character code verifying product authenticity and provisioning your participant access in ZIRON Hub.'}
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 5: SHIPPING, WILAYAS & DISCRETION */}
        <section className="bg-white border border-[#E2E8F0] p-6 sm:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="w-10 h-10 bg-[#0B2346] text-white flex items-center justify-center">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#0B2346]">
                {locale === 'ar' ? 'تغطية 58 ولاية جزائرية' : locale === 'fr' ? 'Couverture des 58 Wilayas' : '58 Wilayas Coverage'}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {locale === 'ar'
                  ? 'شحن سريع وموثوق إلى كامل التراب الجزائري (58 ولاية) عبر شبكات الشحن السريع الوطنية المعتمدة.'
                  : locale === 'fr'
                  ? 'Livraison rapide et sécurisée dans l’ensemble des 58 wilayas d’Algérie via nos partenaires logistiques certifiés.'
                  : 'Full delivery coverage to all 58 wilayas across Algeria via established national logistics courier networks.'}
              </p>
              <div className="text-[11px] text-gray-500 font-mono">
                {locale === 'ar' ? 'الولايات الشمالية: 24–48 ساعة | ولايات الجنوب: 3–5 أيام عمل' : locale === 'fr' ? 'Wilayas du Nord : 24–48h | Wilayas du Sud : 3–5 jours ouvrés' : 'Northern Wilayas: 24–48 Hours | Southern Wilayas: 3–5 Business Days'}
              </div>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 bg-[#0B2346] text-white flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#0B2346]">
                {locale === 'ar' ? 'الدفع عند الاستلام' : locale === 'fr' ? 'Paiement à la Livraison' : 'Paiement à la Livraison'}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {locale === 'ar'
                  ? 'ادفع نقدًا عند وصول الطرد إلى عنوانك. يحق لك معاينة الطرد الخارجي والتأكد من سلامته قبل تسليم المبلغ.'
                  : locale === 'fr'
                  ? 'Réglez en espèces à la réception de votre commande. Vous êtes en droit de vérifier l’intégrité du colis avant paiement.'
                  : 'Pay securely in cash upon physical delivery. You are entitled to inspect the unbroken condition of the exterior parcel before completing payment.'}
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 bg-[#0B2346] text-white flex items-center justify-center">
                <EyeOff className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#0B2346]">
                {locale === 'ar' ? 'تغليف سري ومحمي 100%' : locale === 'fr' ? 'Emballage 100% Discret' : 'Discreet Packaging'}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {locale === 'ar'
                  ? 'يتم شحن الطرود في صناديق كرتونية محايدة تمامًا دون أي إشارات ظاهرة لمحتواها، حفاظًا على خصوصيتك التامة.'
                  : locale === 'fr'
                  ? 'Tous les colis sont expédiés sous emballage neutre et opaque sans mention visible du contenu, pour une discrétion absolue.'
                  : 'Packages are shipped in unmarked, opaque protective boxes with zero sensitive branding, preserving complete personal privacy.'}
              </p>
            </div>
          </div>
        </section>

        {/* ORDER MODAL */}
        {orderModalOpen && selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white max-w-lg w-full p-6 sm:p-8 border border-[#E2E8F0] shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <button
                type="button"
                onClick={() => setOrderModalOpen(false)}
                className="absolute right-4 top-4 rtl:left-4 rtl:right-auto text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {!orderSubmitted ? (
                <form onSubmit={handleConfirmOrder} className="space-y-5">
                  <div className="border-b border-gray-100 pb-3">
                    <span className="text-[10px] font-mono uppercase text-gray-400">
                      {s.modalTitle}
                    </span>
                    <h3 className="text-lg font-bold text-[#0B2346]">
                      {selectedProduct.name}
                    </h3>
                    <div className="text-xs font-mono font-bold text-[#0B2346] mt-0.5">
                      {locale === 'ar' ? 'السعر:' : locale === 'fr' ? 'Prix :' : 'Price:'} {formatDzdPrice(selectedProduct.priceDzd, locale)} ({s.codTag})
                    </div>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">
                        {s.fullNameLabel}
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder={locale === 'ar' ? 'مثال: كريم المنصوري' : 'e.g. Karim Mansouri'}
                        className="w-full bg-[#F5F7FA] border border-[#E2E8F0] px-3 py-2 text-xs text-[#0B2346] focus:outline-none focus:ring-1 focus:ring-[#0B2346]"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">
                        {s.phoneLabel}
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="0550 12 34 56"
                        className="w-full bg-[#F5F7FA] border border-[#E2E8F0] px-3 py-2 text-xs text-[#0B2346] focus:outline-none focus:ring-1 focus:ring-[#0B2346]"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">
                        {s.wilayaLabel}
                      </label>
                      <select
                        value={wilaya}
                        onChange={(e) => setWilaya(e.target.value)}
                        className="w-full bg-[#F5F7FA] border border-[#E2E8F0] px-3 py-2 text-xs text-[#0B2346] focus:outline-none focus:ring-1 focus:ring-[#0B2346]"
                      >
                        {wilayasList.map((w) => (
                          <option key={w} value={w}>
                            {w}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50 border border-blue-200 text-[11px] text-blue-900 leading-relaxed">
                    <strong>{locale === 'ar' ? 'طريقة الاستلام والدفع:' : locale === 'fr' ? 'Modalités de livraison :' : 'Payment Terms:'}</strong>{' '}
                    {locale === 'ar'
                      ? 'يتم دفع المبلغ نقدًا لمندوب التوصيل عند استلام الطلب. سيتصل بك فريق التوصيل لتأكيد العنوان وموعد التسليم قبل خروج الطرد.'
                      : locale === 'fr'
                      ? 'Le paiement s’effectue en espèces à la livraison. Notre équipe logistique vous contactera par téléphone pour confirmer l’adresse avant l’expédition.'
                      : 'Payment is collected in cash upon delivery to your address. Our delivery team will call you to confirm your address prior to dispatch.'}
                  </div>

                  <div className="pt-2 flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="md"
                      onClick={() => setOrderModalOpen(false)}
                      className="w-1/2 cursor-pointer"
                    >
                      {s.cancelBtn}
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      className="w-1/2 cursor-pointer"
                    >
                      {s.confirmOrderBtn}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-6 space-y-4">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                    <Check className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[#0B2346]">
                    {s.orderSuccessTitle}
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed max-w-sm mx-auto">
                    {locale === 'ar'
                      ? `شكرًا لك، ${fullName || 'عزيزي العميل'}. تم تسجيل طلبك لـ ${selectedProduct.name} بسعر (${formatDzdPrice(selectedProduct.priceDzd, locale)}) إلى ولاية ${wilaya}. سيتصل بك فريقنا على الرقم ${phone || 'رقم هاتفك'} لتنسيق موعد التسليم.`
                      : locale === 'fr'
                      ? `Merci, ${fullName || 'cher client'}. Votre commande pour ${selectedProduct.name} (${formatDzdPrice(selectedProduct.priceDzd, locale)}) à destination de ${wilaya} est enregistrée. Notre équipe vous appellera au ${phone || 'votre numéro'} pour organiser la remise du colis.`
                      : `Thank you, ${fullName || 'Customer'}. Your order for ${selectedProduct.name} (${formatDzdPrice(selectedProduct.priceDzd, locale)}) for delivery to ${wilaya} has been logged. Our dispatch team will contact you at ${phone || 'your phone number'} to coordinate delivery.`}
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setOrderModalOpen(false)}
                    className="cursor-pointer"
                  >
                    {s.closeBtn}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

