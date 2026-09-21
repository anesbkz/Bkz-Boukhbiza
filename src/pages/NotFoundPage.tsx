import React from 'react';
import { useI18n } from '@/context/I18nContext';
import { Button } from '@/components/design-system/Button';
import { Card } from '@/components/design-system/Card';
import { GridPattern } from '@/components/design-system/GridPattern';
import { Compass, Home, ShoppingBag } from 'lucide-react';
import { SeoHead } from '@/components/seo/SeoHead';

export const NotFoundPage: React.FC = () => {
  const { navigate, locale } = useI18n();

  const isFrench = locale === 'fr';
  const isArabic = locale === 'ar';

  const heading = isArabic
    ? 'الصفحة غير موجودة'
    : isFrench
    ? 'Page Non Trouvée'
    : 'Page Not Found';

  const message = isArabic
    ? 'المسار الذي طلبته غير موجود أو تم نقله. يرجى التحقق من العنوان أو العودة إلى الصفحة الرئيسية.'
    : isFrench
    ? 'La page demandée n’existe pas ou a été déplacée. Veuillez vérifier l’URL ou revenir à l’accueil.'
    : 'The requested resource could not be found. Please verify the URL or return to the main platform.';

  const homeBtn = isArabic ? 'العودة للرئيسية' : isFrench ? 'Accueil' : 'Return Home';
  const shopBtn = isArabic ? 'متجر المنتجات' : isFrench ? 'Boutique' : 'Explore Shop';

  return (
    <>
      <SeoHead
        title="404 — Page Not Found | ZIRON | VIREXON BIOSCIENCES"
        noindex={true}
      />
      <div className="py-20 bg-[#F5F7FA]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card variant="default" padding="lg" className="relative overflow-hidden text-center">
            <GridPattern />
            <div className="relative z-10 py-10">
              <div className="w-14 h-14 mx-auto bg-[#0B2346] text-white flex items-center justify-center mb-6">
                <Compass className="w-7 h-7 text-[#2E9E45]" />
              </div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-gray-100 border border-[#E2E8F0] mb-4">
                <span className="text-[10px] font-mono uppercase tracking-widest text-red-600 font-bold">
                  HTTP 404 • ROUTE UNRESOLVED
                </span>
              </div>
              <h1 className="text-3xl font-black text-[#0B2346] mb-3">{heading}</h1>
              <p className="text-sm text-gray-600 max-w-md mx-auto mb-8 leading-relaxed">
                {message}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => navigate('')}
                  className="flex items-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  {homeBtn}
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => navigate('shop')}
                  className="flex items-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  {shopBtn}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};
