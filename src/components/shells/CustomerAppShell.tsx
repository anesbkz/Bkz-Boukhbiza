import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
import { useCustomerEntitlements } from '@/hooks/useCustomerEntitlements';
import { PublicRoute } from '@/types';
import { LOCALES } from '@/lib/i18n/config';
import { Locale } from '@/types';
import { getAppTranslations } from '@/lib/i18n/appTranslations';
import {
  LayoutDashboard,
  Compass,
  Package,
  QrCode,
  MessageSquare,
  GraduationCap,
  Gift,
  Award,
  User,
  LogOut,
  Menu,
  X,
  Shield,
  Lock,
  ExternalLink,
  Globe,
  Sparkles,
  Coins,
} from 'lucide-react';

interface NavItem {
  id: PublicRoute;
  label: string;
  labelAr: string;
  labelFr: string;
  icon: React.ComponentType<{ className?: string }>;
  gatedBy?: 'COMMUNITY_ACCESS' | 'SCHOOL_ACCESS';
  badge?: string;
}

export const CUSTOMER_NAV_ITEMS: NavItem[] = [
  {
    id: 'app',
    label: 'Dashboard',
    labelAr: 'لوحة التحكم',
    labelFr: 'Tableau de bord',
    icon: LayoutDashboard,
  },
  {
    id: 'app/journey',
    label: 'My Journey',
    labelAr: 'مساري',
    labelFr: 'Mon Parcours',
    icon: Compass,
  },
  {
    id: 'app/products',
    label: 'My Products',
    labelAr: 'منتجاتي',
    labelFr: 'Mes Produits',
    icon: Package,
  },
  {
    id: 'app/products/activate',
    label: 'Activate Product',
    labelAr: 'تفعيل عبوة',
    labelFr: 'Activer un Flacon',
    icon: QrCode,
    badge: 'NEW',
  },
  {
    id: 'app/community',
    label: 'Community',
    labelAr: 'المجتمع',
    labelFr: 'Communauté',
    icon: MessageSquare,
    gatedBy: 'COMMUNITY_ACCESS',
  },
  {
    id: 'app/school',
    label: 'Restart School',
    labelAr: 'مدرسة Restart',
    labelFr: 'École Restart',
    icon: GraduationCap,
    gatedBy: 'SCHOOL_ACCESS',
  },
  {
    id: 'app/rewards',
    label: 'Rewards',
    labelAr: 'المكافآت',
    labelFr: 'Récompenses',
    icon: Gift,
  },
  {
    id: 'app/certificates',
    label: 'Certificates',
    labelAr: 'الشهادات',
    labelFr: 'Certificats',
    icon: Award,
  },
  {
    id: 'app/profile',
    label: 'Profile',
    labelAr: 'الملف الشخصي',
    labelFr: 'Profil',
    icon: User,
  },
];

export const CustomerAppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, loading: authLoading, isStaff, logout } = useAuth();
  const { route, navigate, locale, setLocale, dir } = useI18n();
  const t = getAppTranslations(locale);
  const { hasCommunityAccess, hasSchoolAccess } = useCustomerEntitlements();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0B2346] flex flex-col items-center justify-center text-white font-mono text-xs p-6">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white animate-spin mb-4" />
        <div className="tracking-widest uppercase">{t.common.verifying}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center p-4" dir={dir}>
        <div className="max-w-md w-full bg-white border border-[#E2E8F0] p-8 shadow-sm text-center">
          <div className="w-12 h-12 bg-blue-50 border border-blue-200 text-[#0B2346] flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#0B2346] font-bold block mb-1">
            <span dir="ltr">VIREXON BIOSCIENCES</span>
          </span>
          <h1 className="text-xl font-black text-[#0B2346] mb-3">
            {t.shell.authRequiredTitle}
          </h1>
          <p className="text-xs text-gray-600 leading-relaxed mb-6">
            {t.shell.authRequiredDesc}
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => navigate('login')}
              className="flex-1 px-4 py-2.5 bg-[#0B2346] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#07162c] cursor-pointer"
            >
              {t.common.signIn}
            </button>
            <button
              onClick={() => navigate('')}
              className="flex-1 px-4 py-2.5 bg-gray-100 text-[#0B2346] text-xs font-bold uppercase tracking-wider hover:bg-gray-200 cursor-pointer"
            >
              {t.common.returnHome}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getLocalizedLabel = (item: NavItem) => {
    if (locale === 'ar') return item.labelAr;
    if (locale === 'fr') return item.labelFr;
    return item.label;
  };

  const getLocalizedLockHint = (item: NavItem) => {
    if (item.id === 'app/community') return t.shell.lockHintCommunity;
    if (item.id === 'app/school') return t.shell.lockHintSchool;
    return '';
  };

  const handleNav = (target: PublicRoute) => {
    navigate(target);
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#0B2346] flex flex-col antialiased" dir={dir}>
      {/* Top Clinical Utility Bar */}
      <aside aria-label="System status" className="bg-[#0B2346] text-white text-[11px] py-1.5 px-4 border-b border-white/10 select-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#2E9E45] animate-pulse" />
            <span dir="ltr" className="font-bold tracking-wider uppercase text-white/90 text-[10px]">
              VIREXON BIOSCIENCES
            </span>
            <span className="text-white/30 hidden sm:inline">|</span>
            <span dir="ltr" className="text-white/70 hidden sm:inline text-[10px]">
              ZIRON Digital Platform
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* ZIRON RESTART Platform Group */}
            <div className="flex items-center gap-1.5">
              <button
                id="customer-restart-hub-btn"
                onClick={() => navigate('app/restart')}
                className={`text-[10px] uppercase font-mono font-bold tracking-wider inline-flex items-center gap-1 cursor-pointer px-2 py-0.5 border transition-colors ${
                  route === 'app/restart'
                    ? 'bg-amber-400 text-[#0B2346] border-amber-300 shadow-xs'
                    : 'text-amber-200 hover:text-white border-amber-400/50 hover:border-amber-300 bg-amber-950/30'
                }`}
                title="ZIRON RESTART Platform"
              >
                <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                <span>RESTART</span>
              </button>

              <button
                id="customer-restart-fund-btn"
                onClick={() => navigate('restart/fund')}
                className={`text-[10px] uppercase font-mono font-bold tracking-wider inline-flex items-center gap-1 cursor-pointer px-2 py-0.5 border transition-colors ${
                  route === 'restart/fund' || route === 'app/restart/fund'
                    ? 'bg-amber-400 text-[#0B2346] border-amber-300 shadow-xs'
                    : 'text-amber-200 hover:text-white border-amber-400/50 hover:border-amber-300 bg-amber-950/30'
                }`}
                title="ZIRON RESTART Fund"
              >
                <Coins className="w-2.5 h-2.5 text-amber-300" />
                <span>{locale === 'ar' ? 'صندوق RESTART' : locale === 'fr' ? 'FONDS RESTART' : 'RESTART FUND'}</span>
              </button>
            </div>

            {isStaff && (
              <button
                onClick={() => navigate('admin')}
                className="text-[10px] font-mono font-bold bg-[#D62828] text-white px-2 py-0.5 uppercase tracking-wider hover:bg-red-700 cursor-pointer inline-flex items-center gap-1"
              >
                <Shield className="w-3 h-3" />
                <span>{t.common.commandCenter}</span>
              </button>
            )}

            {/* Locale Selector */}
            <div className="flex items-center gap-1 text-[10px] font-mono border border-white/20 px-1 py-0.5 bg-black/20">
              <Globe className="w-3 h-3 text-white/70" />
              {Object.values(LOCALES).map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLocale(l.code as Locale)}
                  className={`px-1 rounded-xs uppercase cursor-pointer ${
                    locale === l.code
                      ? 'bg-white text-[#0B2346] font-bold'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  {l.code}
                </button>
              ))}
            </div>

            {/* Return to Public Site */}
            <button
              onClick={() => navigate('')}
              className="text-white/60 hover:text-white text-[10px] uppercase font-bold tracking-wider inline-flex items-center gap-1 cursor-pointer"
              title={t.common.publicSite}
            >
              <span>{t.common.publicSite}</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main App Header Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#E2E8F0] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Mark */}
          <div
            onClick={() => handleNav('app')}
            className="flex items-center gap-3 cursor-pointer select-none shrink-0"
            role="button"
            tabIndex={0}
          >
            <div className="w-9 h-9 bg-[#0B2346] text-white flex items-center justify-center font-black text-sm tracking-tight shadow-xs">
              ZR
            </div>
            <div className="flex flex-col">
              <span dir="ltr" className="font-black text-base tracking-widest text-[#0B2346] leading-none">
                ZIRON
              </span>
              <span dir="ltr" className="text-[8px] font-bold tracking-[0.25em] text-gray-400 uppercase mt-0.5">
                BY VIREXON
              </span>
            </div>
          </div>

          {/* Desktop Right User Dossier & Actions */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            <button
              id="customer-profile-dossier-btn"
              onClick={() => handleNav('app/profile')}
              className="flex items-center gap-2 p-1.5 px-3 bg-gray-50 border border-[#E2E8F0] hover:border-gray-300 transition-colors cursor-pointer"
            >
              <div className="flex flex-col text-start">
                <span className="text-xs font-bold text-[#0B2346] leading-tight">
                  {profile?.firstName ? `${profile.firstName} ${profile.lastName || ''}` : profile?.displayName || t.shell.participant}
                </span>
                <span className="text-[9px] font-mono text-gray-500 uppercase tracking-wider">
                  {profile?.roles?.[0] || t.shell.customerRole}
                </span>
              </div>
              <div className="w-7 h-7 bg-[#0B2346] text-white flex items-center justify-center font-bold text-[11px]">
                {profile?.firstName ? profile.firstName[0].toUpperCase() : 'U'}
              </div>
            </button>

            <button
              id="customer-logout-btn"
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-[#D62828] hover:bg-red-50 border border-[#E2E8F0] transition-colors cursor-pointer"
              title={t.common.logout}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              id="customer-mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 border border-[#E2E8F0] text-[#0B2346] hover:bg-gray-100 cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Dedicated Desktop Horizontal Navigation Bar */}
        <div className="hidden lg:block border-t border-gray-100 bg-[#FAFAFA]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center gap-1 xl:gap-1.5 flex-wrap xl:flex-nowrap py-1.5">
              {CUSTOMER_NAV_ITEMS.map((item) => {
                const isActive =
                  route === item.id ||
                  (item.id === 'app/school' && (route.startsWith('app/school') && route !== 'app/school/certificates')) ||
                  (item.id === 'app/certificates' && route === 'app/school/certificates');
                const isGated =
                  (item.gatedBy === 'COMMUNITY_ACCESS' && !hasCommunityAccess) ||
                  (item.gatedBy === 'SCHOOL_ACCESS' && !hasSchoolAccess);

                return (
                  <button
                    key={item.id}
                    id={`customer-nav-desktop-${item.id.replace(/\//g, '-')}`}
                    onClick={() => handleNav(item.id)}
                    title={isGated ? getLocalizedLockHint(item) : getLocalizedLabel(item)}
                    className={`px-2.5 xl:px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-1.5 cursor-pointer shrink-0 border-b-2 ${
                      isActive
                        ? 'text-[#0B2346] border-[#0B2346] bg-white shadow-2xs font-black'
                        : 'text-gray-600 hover:text-[#0B2346] hover:bg-white border-transparent'
                    }`}
                  >
                    <item.icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#0B2346]' : 'text-gray-400'}`} />
                    <span>{getLocalizedLabel(item)}</span>
                    {isGated && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-mono px-1 py-0.2 bg-amber-50 text-amber-700 border border-amber-200">
                        <Lock className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                        <span className="hidden xl:inline text-[8px] font-bold">{t.common.locked}</span>
                      </span>
                    )}
                    {item.badge && !isActive && (
                      <span className="text-[8px] font-mono px-1 py-0.2 bg-[#F28C28] text-white font-bold tracking-tighter">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}

              {/* RESTART FUND Customer Navigation Item */}
              <div className="ms-auto flex items-center shrink-0">
                <button
                  id="customer-nav-desktop-restart-fund"
                  onClick={() => handleNav('restart/fund')}
                  title={locale === 'ar' ? 'صندوق ZIRON RESTART المستقبلي' : locale === 'fr' ? 'Fonds ZIRON RESTART' : 'ZIRON RESTART Fund'}
                  className={`px-2.5 xl:px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-1.5 cursor-pointer shrink-0 border-b-2 ${
                    route === 'restart/fund' || route === 'app/restart/fund'
                      ? 'text-amber-900 border-amber-600 bg-amber-50 shadow-2xs font-black'
                      : 'text-amber-800 hover:text-amber-950 hover:bg-amber-50/70 border-transparent'
                  }`}
                >
                  <Coins className={`w-3.5 h-3.5 shrink-0 ${route === 'restart/fund' || route === 'app/restart/fund' ? 'text-amber-600' : 'text-amber-500'}`} />
                  <span>{locale === 'ar' ? 'صندوق RESTART' : locale === 'fr' ? 'FONDS RESTART' : 'RESTART FUND'}</span>
                  <span className="text-[8px] font-mono px-1 py-0.2 bg-amber-600 text-white font-bold tracking-tighter">
                    {locale === 'ar' ? 'قريبًا' : locale === 'fr' ? 'BIENTÔT' : 'SOON'}
                  </span>
                </button>
              </div>
            </nav>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#E2E8F0] bg-white px-4 py-4 space-y-2 shadow-lg animate-in fade-in slide-in-from-top-2">
            {/* User header in mobile */}
            <div className="p-3 bg-gray-50 border border-[#E2E8F0] flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-[#0B2346] text-white flex items-center justify-center font-bold text-xs">
                  {profile?.firstName ? profile.firstName[0].toUpperCase() : 'U'}
                </div>
                <div>
                  <div className="text-xs font-bold text-[#0B2346]">
                    {profile?.firstName ? `${profile.firstName} ${profile.lastName || ''}` : profile?.displayName || t.shell.participant}
                  </div>
                  <div dir="ltr" className="text-[10px] font-mono text-gray-500">
                    {user.email}
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 text-gray-500 hover:text-[#D62828] text-xs font-bold cursor-pointer inline-flex items-center gap-1"
                title={t.common.logout}
              >
                <LogOut className="w-4 h-4" />
                <span className="text-[10px] uppercase font-bold">{t.common.logout}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-1.5">
              {CUSTOMER_NAV_ITEMS.map((item) => {
                const isActive =
                  route === item.id ||
                  (item.id === 'app/school' && (route.startsWith('app/school') && route !== 'app/school/certificates')) ||
                  (item.id === 'app/certificates' && route === 'app/school/certificates');
                const isGated =
                  (item.gatedBy === 'COMMUNITY_ACCESS' && !hasCommunityAccess) ||
                  (item.gatedBy === 'SCHOOL_ACCESS' && !hasSchoolAccess);

                return (
                  <button
                    key={item.id}
                    id={`customer-nav-mobile-${item.id.replace(/\//g, '-')}`}
                    onClick={() => handleNav(item.id)}
                    className={`w-full flex flex-col items-start px-3 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer text-start ${
                      isActive
                        ? 'bg-[#0B2346] text-white'
                        : 'bg-gray-50 text-[#0B2346] hover:bg-gray-100'
                    }`}
                  >
                    <div className="w-full flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                        <span>{getLocalizedLabel(item)}</span>
                      </div>
                      {item.badge && !isGated && !isActive && (
                        <span className="text-[8px] font-mono px-1.5 py-0.5 bg-[#F28C28] text-white font-bold">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    {isGated && (
                      <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-sans font-medium px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200">
                        <Lock className="w-3 h-3 text-amber-600 shrink-0" />
                        <span>{getLocalizedLockHint(item)}</span>
                      </div>
                    )}
                  </button>
                );
              })}

              {/* RESTART FUND Mobile Navigation Item */}
              <button
                id="customer-nav-mobile-restart-fund"
                onClick={() => {
                  handleNav('restart/fund');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex flex-col items-start px-3 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer text-start ${
                  route === 'restart/fund' || route === 'app/restart/fund'
                    ? 'bg-amber-500 text-[#0B2346]'
                    : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                <div className="w-full flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Coins className={`w-4 h-4 ${route === 'restart/fund' || route === 'app/restart/fund' ? 'text-[#0B2346]' : 'text-amber-600'}`} />
                    <span>{locale === 'ar' ? 'صندوق RESTART' : locale === 'fr' ? 'FONDS RESTART' : 'RESTART FUND'}</span>
                  </div>
                  <span className="text-[8px] font-mono px-1.5 py-0.5 bg-amber-600 text-white font-bold">
                    {locale === 'ar' ? 'قريبًا' : locale === 'fr' ? 'BIENTÔT' : 'SOON'}
                  </span>
                </div>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Application Content Area */}
      <main className="flex-1 w-full">
        {children}
      </main>

      {/* Structured Customer App Footer */}
      <footer className="bg-white border-t border-[#E2E8F0] py-6 px-4 sm:px-6 lg:px-8 mt-12 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span dir="ltr" className="font-bold text-[#0B2346]">ZIRON</span>
            <span>•</span>
            <span><span dir="ltr">VIREXON BIOSCIENCES</span> Research & Innovation</span>
          </div>
          <div className="text-[11px] text-gray-400">
            {t.shell.footerDisclaimer}
          </div>
        </div>
      </footer>
    </div>
  );
};

