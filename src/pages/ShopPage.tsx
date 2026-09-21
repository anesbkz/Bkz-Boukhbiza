import React, { useState, useEffect } from 'react';
import { useI18n } from '@/context/I18nContext';
import { useAuth } from '@/context/AuthContext';
import { getLocalizedCatalog, formatDzdPrice, CatalogItem } from '@/lib/content/catalog';
import { getPublicTranslations } from '@/lib/i18n/publicTranslations';
import { createOrder } from '@/services/commerce/orderService';
import { CreateOrderRequest } from '@/types/commerce';
import { PublicRoute } from '@/types';
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
  Loader2,
  AlertCircle,
  LogIn,
  UserPlus,
} from 'lucide-react';

export const ShopPage: React.FC = () => {
  const { locale, navigate } = useI18n();
  const { user, profile } = useAuth();
  const t = getPublicTranslations(locale);
  const s = t.shop;

  const catalog = getLocalizedCatalog(locale);
  const oneMonthItem = catalog.find((item) => item.id === 'ziron-1-month') || catalog[0];
  const bundleItem = catalog.find((item) => item.phase === 'BUNDLE');
  const stagePhases = catalog.filter((item) => typeof item.phase === 'number' && item.id !== 'ziron-1-month');

  const [selectedProduct, setSelectedProduct] = useState<CatalogItem | null>(null);
  const [orderModalOpen, setOrderModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  // Form State
  const [fullName, setFullName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [wilaya, setWilaya] = useState<string>('16 - Alger');
  const [city, setCity] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

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

  // Prefill shipping information from profile when available
  useEffect(() => {
    if (profile) {
      if (!fullName) {
        const name = profile.displayName || [profile.firstName, profile.lastName].filter(Boolean).join(' ');
        if (name) setFullName(name);
      }
      if (!phone && (profile.phone || profile.phoneNumber)) {
        setPhone(profile.phone || profile.phoneNumber || '');
      }
      if (profile.wilaya && wilaya === '16 - Alger') {
        const matched = wilayasList.find((w) =>
          w.toLowerCase().includes(profile.wilaya!.toLowerCase())
        );
        if (matched) setWilaya(matched);
      }
      if (!city && profile.city) {
        setCity(profile.city);
      }
      if (!address && profile.address) {
        setAddress(profile.address);
      }
    }
  }, [profile]);

  const handleOpenOrder = (product: CatalogItem) => {
    setSelectedProduct(product);
    setOrderError(null);
    setOrderModalOpen(true);
  };

  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Require authenticated user before order submission
    if (!user) {
      setOrderError(
        locale === 'ar'
          ? 'يرجى تسجيل الدخول أو إنشاء حساب لإتمام الطلب'
          : locale === 'fr'
          ? 'Veuillez vous connecter ou créer un compte pour commander'
          : 'Please sign in or create an account to place an order'
      );
      // 2. Direct unauthenticated user to login/registration flow
      navigate('login');
      return;
    }

    if (!selectedProduct) {
      setOrderError(
        locale === 'ar' ? 'لم يتم تحديد أي منتج' : locale === 'fr' ? 'Aucun produit sélectionné' : 'No product selected'
      );
      return;
    }

    const trimmedName = fullName.trim();
    if (!trimmedName || trimmedName.length < 2) {
      setOrderError(
        locale === 'ar'
          ? 'يرجى إدخال اسم المستلم الكامل (حرفان على الأقل)'
          : locale === 'fr'
          ? 'Veuillez saisir un nom complet valide (au moins 2 caractères)'
          : 'Please enter a valid recipient name (minimum 2 characters)'
      );
      return;
    }

    const trimmedPhone = phone.trim();
    if (!trimmedPhone || trimmedPhone.length < 8) {
      setOrderError(
        locale === 'ar'
          ? 'يرجى إدخال رقم هاتف صحيح (8 أرقام على الأقل)'
          : locale === 'fr'
          ? 'Veuillez saisir un numéro de téléphone valide (au moins 8 caractères)'
          : 'Please enter a valid phone number (minimum 8 characters)'
      );
      return;
    }

    const trimmedAddress = address.trim();
    if (!trimmedAddress) {
      setOrderError(
        locale === 'ar'
          ? 'يرجى إدخال عنوان التوصيل بالتفصيل'
          : locale === 'fr'
          ? 'Veuillez saisir une adresse de livraison détaillée'
          : 'Please enter a detailed delivery address'
      );
      return;
    }

    setIsSubmitting(true);
    setOrderError(null);

    try {
      // 4. Pass selected SKU/variant (standard var- prefix matching backend catalog and productVariants)
      const variantId = 'var-' + selectedProduct.sku.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const resolvedCity = city.trim() || wilaya.split('-')[1]?.trim() || wilaya.trim();
      const idempotencyKey = `order_${user.uid}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      // 3. Connect to authoritative backend createOrder
      const orderPayload: CreateOrderRequest = {
        items: [
          {
            variantId,
            quantity: 1,
          },
        ],
        shippingAddress: {
          recipientName: trimmedName,
          phone: trimmedPhone,
          wilaya: wilaya.trim(),
          city: resolvedCity,
          address: trimmedAddress,
          notes: notes.trim() || undefined,
        },
        idempotencyKey,
      };

      const result = await createOrder(orderPayload);

      // 5. On successful order creation, navigate to /app/orders/:orderId
      if (result.success && result.order?.id) {
        setOrderModalOpen(false);
        navigate(`app/orders/${result.order.id}` as PublicRoute);
      } else {
        throw new Error(result.message || 'Order creation failed.');
      }
    } catch (err: any) {
      console.error('Failed to create customer order:', err);
      const msg =
        err?.message ||
        (locale === 'ar'
          ? 'تعذر إتمام الطلب، يرجى التحقق من صحة البيانات والمحاولة مرة أخرى.'
          : locale === 'fr'
          ? 'Échec de la création de la commande. Veuillez vérifier vos informations et réessayer.'
          : 'Could not create order. Please verify your details and try again.');
      setOrderError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

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
                    {locale === 'ar'
                      ? 'توفير 2,000 د.ج مقارنة بـ 3 عبوات شهرية (24,000 د.ج) + شحن مجاني متضمن'
                      : locale === 'fr'
                      ? 'Économie de 2 000 DZD par rapport à 3 flacons individuels (24 000 DZD) + Livraison gratuite incluse'
                      : 'Save 2,000 DZD compared to 3 individual containers (24,000 DZD) + Free Shipping Included'}
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

        {/* SECTION 3: PRODUCT A — ZIRON 1 MONTH */}
        <section className="space-y-6">
          <div className="bg-white border-2 border-slate-300 p-6 sm:p-10 shadow-sm relative">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="max-w-2xl space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="navy">{oneMonthItem.badgeText}</Badge>
                  <span className="text-xs font-mono text-gray-400">{oneMonthItem.sku}</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-[#0B2346] tracking-tight">
                  {oneMonthItem.name}
                </h2>

                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  {oneMonthItem.description}
                </p>

                {/* PROTOCOL PHASE FORMULATION CLARIFICATION */}
                <div className="pt-2 space-y-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-gray-500 font-bold block">
                    {locale === 'ar' ? 'مراحل التركيبة الشهرية لبروتوكول ZIRON:' : locale === 'fr' ? 'Étapes de formulation du protocole ZIRON :' : 'ZIRON Protocol Monthly Formulation Stages:'}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {stagePhases.map((phase) => (
                      <div key={phase.id} className="p-3 bg-[#F5F7FA] border border-[#E2E8F0] space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold" style={{ color: phase.containerColorHex }}>
                            {phase.badgeText}
                          </span>
                          <span className="text-[10px] font-mono text-gray-400">{phase.capsuleCount} cap</span>
                        </div>
                        <span className="text-xs font-bold text-[#0B2346] block">{phase.name}</span>
                        <span className="text-[10px] text-gray-500 block leading-tight">{phase.description}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-gray-500 italic">
                    {locale === 'ar'
                      ? 'ملاحظة: تتوفر عبوة ZIRON الشهرية لكل مرحلة من مراحل البروتوكول وتتضمن ختم أمان ملون ورمز تحقق أمني مشفر.'
                      : locale === 'fr'
                      ? 'Remarque : chaque flacon mensuel ZIRON correspond à une étape du protocole avec scellé sécurisé et code de vérification cryptographique.'
                      : 'Note: ZIRON 1-Month containers correspond to protocol progression stages, each equipped with tamper-evident seals and serialized security codes.'}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-start lg:items-end justify-between gap-4 border-t lg:border-t-0 pt-6 lg:pt-0 border-gray-100 shrink-0">
                <div className="text-start lg:text-end">
                  <span className="text-[11px] uppercase tracking-wider text-gray-500 block">
                    {locale === 'ar' ? 'سعر العبوة الشهرية (30 كبسولة)' : locale === 'fr' ? 'Prix Flacon Mensuel (30 Gélules)' : 'Monthly Container (30 Capsules)'}
                  </span>
                  <span className="text-2xl sm:text-3xl font-black font-mono text-[#0B2346]">
                    {formatDzdPrice(oneMonthItem.priceDzd, locale)}
                  </span>
                  <span className="text-[11px] text-amber-700 block font-medium mt-0.5">
                    {locale === 'ar'
                      ? 'الشحن: يُتفق عليه مع العميل حسب الولاية (الدفع عند الاستلام)'
                      : locale === 'fr'
                      ? 'Livraison : Convenue avec le client selon la wilaya (Paiement à la livraison)'
                      : 'Shipping: Agreed with customer based on wilaya (Cash on delivery)'}
                  </span>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => handleOpenOrder(oneMonthItem)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>
                    {locale === 'ar' ? 'طلب عبوة شهر واحد (8,000 د.ج)' : locale === 'fr' ? 'Commander 1 Mois (8 000 DZD)' : 'Order 1 Month (8,000 DZD)'}
                  </span>
                </Button>
              </div>
            </div>
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
                disabled={isSubmitting}
                onClick={() => setOrderModalOpen(false)}
                className="absolute right-4 top-4 rtl:left-4 rtl:right-auto text-gray-400 hover:text-gray-600 disabled:opacity-50 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <form onSubmit={handleConfirmOrder} className="space-y-5">
                <div className="border-b border-gray-100 pb-3">
                  <span className="text-[10px] font-mono uppercase text-gray-400">
                    {s.modalTitle}
                  </span>
                  <h3 className="text-lg font-bold text-[#0B2346]">
                    {selectedProduct.name}
                  </h3>
                  {selectedProduct.phase === 'BUNDLE' ? (
                    <div className="text-xs font-mono font-bold text-emerald-700 mt-0.5">
                      {locale === 'ar'
                        ? `السعر: ${formatDzdPrice(selectedProduct.priceDzd, locale)} • الشحن مجاني متضمن (${s.codTag})`
                        : locale === 'fr'
                        ? `Prix : ${formatDzdPrice(selectedProduct.priceDzd, locale)} • Livraison gratuite incluse (${s.codTag})`
                        : `Price: ${formatDzdPrice(selectedProduct.priceDzd, locale)} • Free Shipping Included (${s.codTag})`}
                    </div>
                  ) : (
                    <div className="text-xs font-mono font-bold text-[#0B2346] mt-0.5">
                      {locale === 'ar'
                        ? `السعر: ${formatDzdPrice(selectedProduct.priceDzd, locale)} • تكلفة الشحن يتم الاتفاق عليها حسب الولاية (${s.codTag})`
                        : locale === 'fr'
                        ? `Prix : ${formatDzdPrice(selectedProduct.priceDzd, locale)} • Frais de livraison convenus selon la wilaya (${s.codTag})`
                        : `Price: ${formatDzdPrice(selectedProduct.priceDzd, locale)} • Shipping fee agreed based on wilaya (${s.codTag})`}
                    </div>
                  )}
                </div>

                {/* 1 & 2. Authentication Requirement Banner for Unauthenticated Visitors */}
                {!user && (
                  <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 space-y-3">
                    <div className="flex items-center gap-2 font-bold text-xs">
                      <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                      <span>
                        {locale === 'ar'
                          ? 'تسجيل الدخول مطلوب لإتمام الطلب'
                          : locale === 'fr'
                          ? 'Connexion requise pour commander'
                          : 'Account Required to Place Order'}
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      {locale === 'ar'
                        ? 'يرجى تسجيل الدخول أو إنشاء حساب جديد لربط شحنتك بحسابك ومتابعة التوصيل وتفعيل كود المنتج في المنصة.'
                        : locale === 'fr'
                        ? 'Veuillez vous connecter ou créer un compte pour lier votre commande, suivre la livraison et activer votre code produit.'
                        : 'Please sign in or create an account to link your order, track delivery in real time, and activate your product code.'}
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={() => navigate('login')}
                        className="cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>{locale === 'ar' ? 'تسجيل الدخول' : locale === 'fr' ? 'Se connecter' : 'Sign In'}</span>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('register')}
                        className="cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>{locale === 'ar' ? 'إنشاء حساب جديد' : locale === 'fr' ? 'Créer un compte' : 'Create Account'}</span>
                      </Button>
                    </div>
                  </div>
                )}

                {/* Shipping Form Fields */}
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">
                      {s.fullNameLabel} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      disabled={isSubmitting}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={locale === 'ar' ? 'مثال: كريم المنصوري' : 'e.g. Karim Mansouri'}
                      className="w-full bg-[#F5F7FA] border border-[#E2E8F0] px-3 py-2 text-xs text-[#0B2346] focus:outline-none focus:ring-1 focus:ring-[#0B2346] disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">
                      {s.phoneLabel} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      disabled={isSubmitting}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0550 12 34 56"
                      className="w-full bg-[#F5F7FA] border border-[#E2E8F0] px-3 py-2 text-xs text-[#0B2346] focus:outline-none focus:ring-1 focus:ring-[#0B2346] disabled:opacity-50"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">
                        {s.wilayaLabel} <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={wilaya}
                        disabled={isSubmitting}
                        onChange={(e) => setWilaya(e.target.value)}
                        className="w-full bg-[#F5F7FA] border border-[#E2E8F0] px-3 py-2 text-xs text-[#0B2346] focus:outline-none focus:ring-1 focus:ring-[#0B2346] disabled:opacity-50"
                      >
                        {wilayasList.map((w) => (
                          <option key={w} value={w}>
                            {w}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">
                        {locale === 'ar' ? 'المدينة / البلدية' : locale === 'fr' ? 'Commune / Ville' : 'City / Municipality'}
                      </label>
                      <input
                        type="text"
                        disabled={isSubmitting}
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder={locale === 'ar' ? 'مثال: باب الزوار' : 'e.g. Bab Ezzouar'}
                        className="w-full bg-[#F5F7FA] border border-[#E2E8F0] px-3 py-2 text-xs text-[#0B2346] focus:outline-none focus:ring-1 focus:ring-[#0B2346] disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">
                      {locale === 'ar' ? 'عنوان التوصيل بالتفصيل' : locale === 'fr' ? 'Adresse de livraison' : 'Delivery Address'} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      disabled={isSubmitting}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder={locale === 'ar' ? 'الحي، الشارع، رقم العمارة أو المنزل' : 'Street, building, apartment / home'}
                      className="w-full bg-[#F5F7FA] border border-[#E2E8F0] px-3 py-2 text-xs text-[#0B2346] focus:outline-none focus:ring-1 focus:ring-[#0B2346] disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">
                      {locale === 'ar' ? 'ملاحظات التوصيل (اختياري)' : locale === 'fr' ? 'Instructions de livraison (Optionnel)' : 'Delivery Notes (Optional)'}
                    </label>
                    <input
                      type="text"
                      disabled={isSubmitting}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={locale === 'ar' ? 'الاتصال قبل التوصيل، موعد مفضل...' : 'Call before arrival, preferred delivery time...'}
                      className="w-full bg-[#F5F7FA] border border-[#E2E8F0] px-3 py-2 text-xs text-[#0B2346] focus:outline-none focus:ring-1 focus:ring-[#0B2346] disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 text-[11px] text-blue-900 leading-relaxed">
                  <strong>{locale === 'ar' ? 'طريقة الاستلام والدفع:' : locale === 'fr' ? 'Modalités de livraison :' : 'Payment Terms:'}</strong>{' '}
                  {selectedProduct.phase === 'BUNDLE'
                    ? locale === 'ar'
                      ? 'الشحن مجاني بالكامل لحزمة الـ 90 يومًا. يتم دفع 22,000 د.ج نقدًا لمندوب التوصيل عند استلام الطرد بعد التأكد من سلامة الأختام. سيتصل بك فريقنا لتأكيد موعد التسليم.'
                      : locale === 'fr'
                      ? 'La livraison est 100% offerte pour le Pack 90 Jours. Vous réglez 22 000 DZD en espèces à la réception après contrôle des scellés. Notre équipe vous contactera pour coordonner le créneau.'
                      : 'Delivery is 100% free for the 90-Day Pack. You pay 22,000 DZD in cash upon delivery after inspecting intact tamper-evident seals. Our dispatch team will call to schedule delivery.'
                    : locale === 'ar'
                      ? 'يتم دفع 8,000 د.ج للمنتج بالإضافة إلى تكلفة الشحن المتفق عليها نقدًا عند الاستلام. سيتصل بك فريق التوصيل لتأكيد العنوان وتكلفة التوصيل المناسبة لولايتك.'
                      : locale === 'fr'
                      ? 'Le paiement de 8 000 DZD plus les frais de livraison convenus s’effectue en espèces à la livraison. Notre équipe vous appellera pour convenir du tarif selon votre wilaya.'
                      : 'Payment of 8,000 DZD plus the agreed delivery fee is collected in cash upon arrival. Our team will call to confirm the delivery terms for your specific wilaya.'}
                </div>

                {/* 6. Display Error State */}
                {orderError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{orderError}</span>
                  </div>
                )}

                <div className="pt-2 flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    disabled={isSubmitting}
                    onClick={() => setOrderModalOpen(false)}
                    className="w-1/2 cursor-pointer disabled:opacity-50"
                  >
                    {s.cancelBtn}
                  </Button>

                  {!user ? (
                    <Button
                      type="button"
                      variant="primary"
                      size="md"
                      onClick={() => navigate('login')}
                      className="w-1/2 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>{locale === 'ar' ? 'تسجيل الدخول للطلب' : locale === 'fr' ? 'Se connecter' : 'Sign In to Order'}</span>
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      disabled={isSubmitting}
                      className="w-1/2 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-75"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>
                            {locale === 'ar'
                              ? 'جاري تأكيد الطلب...'
                              : locale === 'fr'
                              ? 'Envoi en cours...'
                              : 'Submitting...'}
                          </span>
                        </>
                      ) : (
                        <span>{s.confirmOrderBtn}</span>
                      )}
                    </Button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

