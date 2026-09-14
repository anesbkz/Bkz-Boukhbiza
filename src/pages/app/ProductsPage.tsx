import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
import { useCustomerEntitlements } from '@/hooks/useCustomerEntitlements';
import { Button } from '@/components/design-system/Button';
import { GridPattern } from '@/components/design-system/GridPattern';
import { getAppTranslations } from '@/lib/i18n/appTranslations';
import {
  Package,
  QrCode,
  CheckCircle2,
  Calendar,
  ShieldCheck,
  MessageSquare,
  GraduationCap,
  Loader2,
} from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const { user } = useAuth();
  const { navigate, locale, dir } = useI18n();
  const t = getAppTranslations(locale);
  const {
    loading,
    hasActivatedProduct,
    activations,
    entitlements,
  } = useCustomerEntitlements();

  return (
    <div className="py-8 sm:py-10 bg-[#F5F7FA]" dir={dir}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Products Header */}
        <div className="bg-white border border-[#E2E8F0] p-6 sm:p-8 relative overflow-hidden shadow-xs">
          <GridPattern />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-blue-50 text-[#0B2346] font-mono text-[10px] uppercase font-bold tracking-wider border border-blue-100">
                <Package className="w-3.5 h-3.5 text-[#0B2346]" />
                <span>{t.products.registryBadge}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#0B2346] tracking-tight">
                {t.products.title}
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 max-w-xl leading-relaxed">
                {t.products.subtitle}
              </p>
            </div>

            <Button
              onClick={() => navigate('app/products/activate')}
              variant="primary"
              size="md"
              className="bg-[#0B2346] cursor-pointer inline-flex items-center gap-2 shrink-0 self-start sm:self-auto"
            >
              <QrCode className="w-4 h-4" />
              <span>{t.products.activateNewBtn}</span>
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-16 text-center text-xs font-mono text-gray-500">
            <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#0B2346]" />
            {t.common.loading}
          </div>
        )}

        {/* Empty State */}
        {!loading && !hasActivatedProduct && (
          <div className="bg-white border border-[#E2E8F0] p-10 sm:p-12 text-center shadow-xs">
            <div className="w-16 h-16 bg-gray-50 border border-gray-200 text-gray-400 flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-lg font-bold text-[#0B2346] mb-2">
              {t.products.emptyTitle}
            </h2>
            <p className="text-xs text-gray-600 max-w-md mx-auto mb-6 leading-relaxed">
              {t.products.emptyDesc}
            </p>
            <Button
              onClick={() => navigate('app/products/activate')}
              variant="primary"
              size="md"
              className="cursor-pointer inline-flex items-center gap-2"
            >
              <QrCode className="w-4 h-4" />
              <span>{t.products.emptyBtn}</span>
            </Button>
          </div>
        )}

        {/* Products List */}
        {!loading && hasActivatedProduct && (
          <div className="space-y-4">
            <div className="text-xs font-mono font-bold uppercase text-gray-500 tracking-wider">
              {t.products.activatedContainersCount} ({activations.length})
            </div>

            <div className="grid grid-cols-1 gap-4">
              {activations.map((activation) => {
                const dateStr = activation.activatedAt
                  ? new Date(activation.activatedAt).toLocaleDateString()
                  : t.products.activeAndVerified;

                return (
                  <div
                    key={activation.id}
                    className="bg-white border border-[#E2E8F0] p-6 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-6 hover:border-gray-300 transition-colors"
                  >
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-mono font-bold uppercase">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          {t.products.activeAndVerified}
                        </span>
                        <span className="text-[11px] font-mono bg-gray-100 text-gray-700 px-2 py-0.5">
                          {t.common.serial}: <span dir="ltr">{activation.code}</span>
                        </span>
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-[#0B2346]">
                          {activation.productSku || 'ZIRON Bio-Formulation (30 Capsules)'}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {t.products.capsuleSpecs}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          {t.common.date}: <span dir="ltr">{dateStr}</span>
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          {t.activate.tamperSealBadge}
                        </span>
                      </div>
                    </div>

                    {/* Granted Entitlements Badges */}
                    <div className="shrink-0 flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-2 border-t md:border-t-0 pt-4 md:pt-0 border-gray-100">
                      <div className="text-[10px] font-mono text-gray-400 uppercase font-bold">
                        {t.products.linkedEntitlements}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-blue-50 text-[#0B2346] px-2 py-1 border border-blue-100">
                          <MessageSquare className="w-3 h-3 text-[#2E9E45]" />
                          COMMUNITY_ACCESS
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-blue-50 text-[#0B2346] px-2 py-1 border border-blue-100">
                          <GraduationCap className="w-3 h-3 text-[#0B2346]" />
                          SCHOOL_ACCESS
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Scientific Guarantee Disclosure */}
        <div className="bg-white border border-[#E2E8F0] p-6 shadow-xs">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#0B2346] shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs leading-relaxed text-gray-600 text-start">
              <div className="font-bold text-[#0B2346] uppercase tracking-wider text-[11px]">
                {t.products.authenticityProtocolTitle}
              </div>
              <p>
                {t.products.authenticityProtocolDesc}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
