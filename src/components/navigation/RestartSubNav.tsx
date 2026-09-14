import React from 'react';
import { useI18n } from '@/context/I18nContext';
import { useAuth } from '@/context/AuthContext';
import { PublicRoute } from '@/types';
import { Sparkles, GraduationCap, Award, Briefcase, Coins } from 'lucide-react';
import { RESTART_FUND_TRANSLATIONS } from '@/lib/i18n/restartFundTranslations';

export type RestartSubNavItem = 'overview' | 'school' | 'certificates' | 'opportunities' | 'fund';

interface RestartSubNavProps {
  activeItem: RestartSubNavItem;
  className?: string;
}

export const RestartSubNav: React.FC<RestartSubNavProps> = ({ activeItem, className = '' }) => {
  const { locale, navigate } = useI18n();
  const { user } = useAuth();
  const t = RESTART_FUND_TRANSLATIONS[locale].navigation;

  const items: Array<{
    id: RestartSubNavItem;
    label: string;
    route: PublicRoute;
    icon: React.ComponentType<{ className?: string }>;
    tag?: string;
  }> = [
    {
      id: 'overview',
      label: t.overview,
      route: user ? 'app/restart' : 'restart',
      icon: Sparkles,
    },
    {
      id: 'school',
      label: t.school,
      route: user ? 'app/school' : 'school',
      icon: GraduationCap,
    },
    {
      id: 'certificates',
      label: t.certificates,
      route: user ? 'app/school/certificates' : 'verify',
      icon: Award,
    },
    {
      id: 'opportunities',
      label: t.opportunities,
      route: user ? 'app/restart' : 'restart',
      icon: Briefcase,
    },
    {
      id: 'fund',
      label: t.restartFund,
      route: 'restart/fund',
      icon: Coins,
      tag: locale === 'ar' ? 'قريبًا' : locale === 'fr' ? 'BIENTÔT' : 'SOON',
    },
  ];

  return (
    <div
      id="restart-sub-navigation"
      className={`w-full bg-[#0B2346] border-y border-amber-500/30 shadow-xs ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between overflow-x-auto no-scrollbar py-2 gap-2">
          {/* Submenu Header Indicator */}
          <div className="hidden md:flex items-center gap-2 pr-3 border-r border-amber-500/30 rtl:border-r-0 rtl:border-l rtl:pl-3 rtl:pr-0 shrink-0">
            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
              ZIRON RESTART
            </span>
          </div>

          {/* Submenu items */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {items.map((item) => {
              const isActive = activeItem === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  id={`restart-subnav-${item.id}`}
                  onClick={() => navigate(item.route)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer shrink-0 border ${
                    isActive
                      ? 'bg-amber-400 text-[#0B2346] border-amber-300 font-black shadow-xs'
                      : 'text-amber-100 hover:text-white border-amber-500/20 hover:border-amber-400/50 bg-amber-950/20'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#0B2346]' : 'text-amber-300'}`} />
                  <span>{item.label}</span>
                  {item.tag && (
                    <span
                      className={`text-[8px] font-mono px-1 py-0.2 font-bold tracking-tighter ${
                        isActive ? 'bg-[#0B2346] text-amber-300' : 'bg-amber-500 text-[#0B2346]'
                      }`}
                    >
                      {item.tag}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
