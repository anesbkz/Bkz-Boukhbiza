import React, { useState, useEffect } from 'react';
import { useI18n } from '@/context/I18nContext';
import { useAuth } from '@/context/AuthContext';
import { SchoolCategory } from '@/types/models';
import { listSchoolCategories } from '@/services/schoolService';
import { Button } from '@/components/design-system/Button';
import { GridPattern } from '@/components/design-system/GridPattern';
import { getSiteContent } from '@/lib/content/site-content';
import { getAppTranslations } from '@/lib/i18n/appTranslations';
import {
  GraduationCap,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Cpu,
  Sprout,
  TrendingUp,
  Compass,
  Wrench,
  Briefcase,
  BarChart3,
  Loader2,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Sparkles,
  Cpu,
  Sprout,
  TrendingUp,
  Compass,
  Wrench,
  Briefcase,
  BarChart3,
};

export const SchoolPage: React.FC = () => {
  const { locale, dir, navigate } = useI18n();
  const { user } = useAuth();
  const content = getSiteContent(locale);
  const t = getAppTranslations(locale);
  const [categories, setCategories] = useState<SchoolCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await listSchoolCategories(false);
        setCategories(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const schoolContent = content.school;

  return (
    <div className="py-12 bg-[#F5F7FA]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header Dossier */}
        <div className="bg-white border border-[#E2E8F0] p-8 sm:p-12 relative overflow-hidden">
          <GridPattern />
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-gray-100 border border-[#E2E8F0] mb-4">
              <GraduationCap className="w-3.5 h-3.5 text-[#0B2346]" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#0B2346] font-bold">
                {schoolContent.heroBadge}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#0B2346] mb-4">
              {schoolContent.heroTitle}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-6">
              {schoolContent.heroSubtitle}
            </p>

            <div className="flex flex-wrap gap-3">
              {user ? (
                <Button
                  onClick={() => navigate('app/school')}
                  variant="primary"
                  size="lg"
                  className="cursor-pointer inline-flex items-center gap-2"
                >
                  <span>{schoolContent.enterPortalBtn}</span>
                  {dir === 'rtl' ? (
                    <ArrowLeft className="w-4 h-4" />
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )}
                </Button>
              ) : (
                <>
                  <Button
                    onClick={() => navigate('register')}
                    variant="primary"
                    size="lg"
                    className="cursor-pointer inline-flex items-center gap-2"
                  >
                    <span>{schoolContent.enrollBtn}</span>
                    {dir === 'rtl' ? (
                      <ArrowLeft className="w-4 h-4" />
                    ) : (
                      <ArrowRight className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    onClick={() => navigate('verify')}
                    variant="outline"
                    size="lg"
                    className="cursor-pointer"
                  >
                    {schoolContent.verifyCodeBtn}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Categories Grid */}
        <div>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500 font-bold block mb-1">
                {locale === 'ar' ? 'المسارات الدراسية' : locale === 'fr' ? 'Parcours d\'études' : 'Curriculum Tracks'}
              </span>
              <h2 className="text-2xl font-black text-[#0B2346]">
                {locale === 'ar' ? 'فئات الدراسة التأسيسية' : locale === 'fr' ? 'Catégories d\'études fondamentales' : 'Foundational Study Categories'}
              </h2>
            </div>
            <span className="text-xs font-mono text-gray-500">
              <span dir="ltr">{categories.length}</span> {t.school.tracksAvailable}
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs font-mono text-gray-500 bg-white border border-[#E2E8F0]">
              <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#0B2346]" />
              {t.common.loading}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {categories.map((cat) => {
                const IconComponent = (cat.iconName && ICON_MAP[cat.iconName]) || BookOpen;
                const title = cat.title[locale] || cat.title.en;
                const desc = cat.description[locale] || cat.description.en;

                return (
                  <div
                    key={cat.id}
                    onClick={() => navigate('app/school')}
                    className="bg-white border border-[#E2E8F0] p-6 hover:border-[#0B2346] transition-colors cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-10 h-10 bg-blue-50 text-[#0B2346] flex items-center justify-center mb-4 group-hover:bg-[#0B2346] group-hover:text-white transition-colors">
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <h3 className="text-sm font-bold text-[#0B2346] mb-2">{title}</h3>
                      <p className="text-xs text-gray-600 leading-relaxed mb-4">{desc}</p>
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] font-mono font-semibold text-gray-500">
                      <span>{schoolContent.trackNumber} <span dir="ltr">#{cat.displayOrder}</span></span>
                      {dir === 'rtl' ? (
                        <ArrowLeft className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#0B2346] transition-transform group-hover:-translate-x-1" />
                      ) : (
                        <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#0B2346] transition-transform group-hover:translate-x-1" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
