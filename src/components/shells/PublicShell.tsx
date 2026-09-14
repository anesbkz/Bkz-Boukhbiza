import React, { useState } from 'react';
import { useI18n } from '@/context/I18nContext';
import { useAuth } from '@/context/AuthContext';
import { LOCALES } from '@/lib/i18n/config';
import { Locale, PublicRoute } from '@/types';
import { Button } from '@/components/design-system/Button';
import { Shield, Menu, X, Globe, ChevronRight, User, LogOut, ShieldAlert } from 'lucide-react';
import { BUILD_SHA } from '@/config/version';

export const PublicShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { locale, setLocale, route, navigate, content, dir } = useI18n();
  const { user, profile, isStaff, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks: { label: string; route: PublicRoute }[] = [
    { label: content.nav.product, route: 'ziron' },
    { label: content.nav.program, route: 'program' },
    { label: content.nav.science, route: 'science' },
    { label: content.nav.quality, route: 'quality' },
    { label: content.nav.community, route: 'community' },
    { label: content.nav.school, route: 'school' },
    { label: content.nav.restart, route: 'restart' },
    { label: content.nav.faq, route: 'faq' },
  ];

  const drawerLinks: { label: string; route: PublicRoute }[] = [
    { label: content.nav.product, route: 'ziron' },
    { label: content.nav.program, route: 'program' },
    { label: content.nav.science, route: 'science' },
    { label: content.nav.quality, route: 'quality' },
    { label: content.nav.community, route: 'community' },
    { label: content.nav.school, route: 'school' },
    { label: content.nav.restart, route: 'restart' },
    { label: content.nav.faq, route: 'faq' },
    { label: content.nav.shop, route: 'shop' },
    { label: content.nav.about, route: 'about' },
  ];

  const handleNavClick = (targetRoute: PublicRoute) => {
    navigate(targetRoute);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FA] text-[#0B2346]">
      {/* Top Protocol Notice Bar */}
      <aside aria-label="System notice" className="bg-[#0B2346] text-white/80 text-[11px] py-2 px-4 border-b border-white/10 tracking-wide">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1.5 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#2E9E45]" />
            <span className="font-semibold tracking-wider uppercase text-white/90">
              {content.brand.name}
            </span>
            <span className="hidden md:inline text-white/40">|</span>
            <span className="hidden md:inline text-white/70">
              {content.brand.tagline}
            </span>
          </div>
          <div className="text-[10px] text-white/60 tracking-wider">
            {content.footer.securityTag}
          </div>
        </div>
      </aside>

      {/* Main Corporate Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <div
            onClick={() => handleNavClick('')}
            className="cursor-pointer flex items-center gap-3 select-none"
            role="button"
            tabIndex={0}
          >
            <div className="w-8 h-8 bg-[#0B2346] text-white flex items-center justify-center font-bold text-sm tracking-tighter shadow-sm">
              VX
            </div>
            <div className="flex flex-col">
              <span className="font-black text-sm tracking-widest text-[#0B2346]">
                VIREXON
              </span>
              <span className="text-[9px] font-medium tracking-[0.2em] text-gray-500 uppercase -mt-1">
                BIOSCIENCES
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1">
            {navLinks.map((item) => {
              const isActive = route === item.route;
              return (
                <button
                  key={item.route}
                  onClick={() => handleNavClick(item.route)}
                  className={`px-1.5 xl:px-2.5 py-1.5 text-[10px] xl:text-[11px] font-semibold uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'text-[#0B2346] border-b-2 border-[#0B2346]'
                      : 'text-gray-600 hover:text-[#0B2346]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Area: Locale Switcher & Actions */}
          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <div className="flex items-center border border-[#E2E8F0] p-0.5 bg-gray-50">
              <Globe className="w-3.5 h-3.5 mx-1.5 text-gray-400" />
              {(['en', 'fr', 'ar'] as Locale[]).map((loc) => (
                <button
                  key={loc}
                  onClick={() => setLocale(loc)}
                  className={`px-2 py-1 text-[11px] font-bold uppercase transition-all cursor-pointer ${
                    locale === loc
                      ? 'bg-[#0B2346] text-white shadow-xs'
                      : 'text-gray-600 hover:text-[#0B2346]'
                  }`}
                >
                  {LOCALES[loc].nativeLabel}
                </button>
              ))}
            </div>

            {/* Quick Verify CTA */}
            <Button
              variant={route === 'verify' ? 'outline' : 'primary'}
              size="sm"
              onClick={() => handleNavClick('verify')}
              className="hidden sm:inline-flex items-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>{content.nav.verifyProduct}</span>
            </Button>

            {/* Auth Session Controls */}
            {user ? (
              <div className="hidden lg:flex items-center gap-2">
                {isStaff && (
                  <button
                    onClick={() => handleNavClick('admin')}
                    className="px-2.5 py-1.5 bg-[#0B2346] text-white text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 hover:bg-[#07162c] cursor-pointer"
                  >
                    <ShieldAlert className="w-3 h-3 text-emerald-400" />
                    <span>{content.nav.commandCenter || 'Command Center'}</span>
                  </button>
                )}
                <button
                  onClick={() => handleNavClick('app')}
                  className="px-2.5 py-1.5 border border-[#E2E8F0] hover:bg-gray-50 text-[11px] font-bold text-[#0B2346] uppercase flex items-center gap-1 cursor-pointer"
                  title="Dashboard"
                >
                  <User className="w-3 h-3" />
                  <span>{profile?.displayName || 'Dashboard'}</span>
                </button>
                <button
                  onClick={() => handleNavClick('app/profile')}
                  className="px-2 py-1.5 bg-gray-50 hover:bg-gray-100 border border-[#E2E8F0] text-[10px] font-mono font-bold text-[#0B2346] uppercase flex items-center gap-1 cursor-pointer"
                  title="Profile Dossier"
                >
                  <span>{content.nav.dossier || 'Dossier'}</span>
                </button>
                <button
                  onClick={logout}
                  className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-gray-100 cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleNavClick('login')}
                className="hidden lg:inline-flex items-center gap-1 px-3 py-1.5 border border-[#0B2346] text-[#0B2346] text-[11px] font-bold uppercase tracking-wider hover:bg-[#0B2346] hover:text-white transition-colors cursor-pointer"
              >
                <span>{content.nav.login}</span>
              </button>
            )}

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-[#0B2346] hover:bg-gray-100 border border-[#E2E8F0] cursor-pointer"
              aria-label={content.nav.menu}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-[#E2E8F0] px-4 py-4 space-y-1">
            {drawerLinks.map((item) => (
              <button
                key={item.route}
                onClick={() => handleNavClick(item.route)}
                className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#0B2346] hover:bg-gray-50 text-start cursor-pointer"
              >
                <span>{item.label}</span>
                <ChevronRight className="w-3.5 h-3.5 text-gray-400 rtl:rotate-180" />
              </button>
            ))}
            <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => handleNavClick('verify')}
                className="w-full justify-center"
              >
                <Shield className="w-4 h-4 mr-1.5" />
                {content.nav.verifyProduct}
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Main Body */}
      <main className="flex-1 w-full">{children}</main>

      {/* Corporate Footer */}
      <footer className="bg-[#0B2346] text-white border-t border-white/10 mt-16 pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10 pb-8 border-b border-white/10">
            {/* Col 1: Identity */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-white text-[#0B2346] flex items-center justify-center font-bold text-xs">
                  VX
                </div>
                <span className="font-bold tracking-wider text-sm">
                  {content.brand.name}
                </span>
              </div>
              <p className="text-xs text-white/70 leading-relaxed">
                {content.footer.description}
              </p>
              <div className="pt-2">
                <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase">
                  {content.footer.securityTag}
                </span>
              </div>
            </div>

            {/* Col 2: Navigation */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white/90 mb-3">
                {content.nav.protocolAndProducts || 'Protocol & Products'}
              </h4>
              <ul className="space-y-2 text-xs text-white/70">
                <li>
                  <button onClick={() => handleNavClick('ziron')} className="hover:text-white transition-colors cursor-pointer">
                    {content.nav.product}
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavClick('program')} className="hover:text-white transition-colors cursor-pointer">
                    {content.nav.program}
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavClick('community')} className="hover:text-white transition-colors cursor-pointer">
                    {content.nav.community}
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavClick('school')} className="hover:text-white transition-colors cursor-pointer">
                    {content.nav.school}
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavClick('shop')} className="hover:text-white transition-colors cursor-pointer">
                    {content.nav.shop}
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavClick('restart')} className="hover:text-white transition-colors cursor-pointer">
                    {content.nav.restart}
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 3: Quality & Standards */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white/90 mb-3">
                {content.nav.standardsAndVerification || 'Standards & Verification'}
              </h4>
              <ul className="space-y-2 text-xs text-white/70">
                <li>
                  <button onClick={() => handleNavClick('science')} className="hover:text-white transition-colors cursor-pointer">
                    {content.nav.science}
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavClick('quality')} className="hover:text-white transition-colors cursor-pointer">
                    {content.nav.quality}
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavClick('verify')} className="hover:text-white transition-colors cursor-pointer">
                    {content.nav.verify}
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavClick('faq')} className="hover:text-white transition-colors cursor-pointer">
                    {content.nav.faq}
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 4: Corporate Notice */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white/90 mb-3">
                {content.nav.corporateGovernance || 'Corporate Governance'}
              </h4>
              <p className="text-[11px] text-white/60 leading-relaxed">
                {content.brand.manufacturingNotice}
              </p>
              <div className="pt-2">
                <button
                  onClick={() => handleNavClick('about')}
                  className="text-xs font-semibold text-white/80 hover:text-white underline cursor-pointer"
                >
                  {content.nav.about} {dir === 'rtl' ? '←' : '→'}
                </button>
              </div>
            </div>
          </div>

          {/* Mandatory Health Disclaimer Box */}
          <div className="bg-black/20 p-4 border border-white/5 text-[11px] text-white/65 leading-relaxed mb-6">
            <p className="font-semibold text-white/80 mb-1">
              {content.nav.mandatoryDisclosure || 'MANDATORY REGULATORY DISCLOSURE'}
            </p>
            <p>{content.footer.mandatoryHealthNotice}</p>
          </div>

          {/* Bottom Copyright & Status */}
          <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-white/50 gap-2">
            <div>
              © {new Date().getFullYear()} {content.footer.copyrightNotice}
            </div>
            <div className="flex items-center gap-4 text-[10px] tracking-wider uppercase">
              <span>{content.nav.algeriaMarketTag || 'ALGERIA TARGET MARKET (DZD) • VERIFIED BATCH COMPLIANCE'}</span>
              <span id="ziron-build-marker" data-testid="ziron-build-sha" className="font-mono text-[9px] text-white/40 lowercase" title={`Build SHA: ${BUILD_SHA}`}>
                sha:{BUILD_SHA.slice(0, 7)}
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
