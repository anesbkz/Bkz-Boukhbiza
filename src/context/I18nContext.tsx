import React, { createContext, useContext, useState, useEffect } from 'react';
import { Locale, Direction, PublicRoute } from '@/types';
import { LOCALES, DEFAULT_LOCALE } from '@/lib/i18n/config';
import { getSiteContent } from '@/lib/content/site-content';
import { SiteContent } from '@/lib/content/types';

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  route: PublicRoute;
  navigate: (route: PublicRoute, targetLocale?: Locale) => void;
  content: SiteContent;
  dir: Direction;
  fontClass: string;
}

const I18nContext = createContext<I18nContextType | null>(null);

function parsePath(pathname: string): { locale: Locale; route: PublicRoute } {
  const segments = pathname.split('/').filter(Boolean);
  let locale: Locale = DEFAULT_LOCALE;
  let route: PublicRoute = '';

  if (segments.length > 0) {
    if (segments[0] === 'en' || segments[0] === 'fr' || segments[0] === 'ar') {
      locale = segments[0] as Locale;
      route = (segments.slice(1).join('/') || '') as PublicRoute;
    } else {
      route = (segments.join('/') || '') as PublicRoute;
    }
  }

  return { locale, route };
}

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initial = typeof window !== 'undefined' ? parsePath(window.location.pathname) : { locale: DEFAULT_LOCALE, route: '' as PublicRoute };
  const [locale, setLocaleState] = useState<Locale>(initial.locale);
  const [route, setRouteState] = useState<PublicRoute>(initial.route);

  useEffect(() => {
    const handlePopState = () => {
      const parsed = parsePath(window.location.pathname);
      setLocaleState(parsed.locale);
      setRouteState(parsed.route);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (nextRoute: PublicRoute, targetLocale?: Locale) => {
    const activeLocale = targetLocale || locale;
    const path = nextRoute ? `/${activeLocale}/${nextRoute}` : `/${activeLocale}`;
    window.history.pushState({}, '', path);
    setLocaleState(activeLocale);
    setRouteState(nextRoute);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const setLocale = (newLocale: Locale) => {
    navigate(route, newLocale);
  };

  const dir = LOCALES[locale]?.dir || 'ltr';
  const fontClass = LOCALES[locale]?.fontClass || 'font-latin';
  const content = getSiteContent(locale);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [locale, dir]);

  return (
    <I18nContext.Provider
      value={{
        locale,
        setLocale,
        route,
        navigate,
        content,
        dir,
        fontClass,
      }}
    >
      <div dir={dir} className={fontClass}>
        {children}
      </div>
    </I18nContext.Provider>
  );
};

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
