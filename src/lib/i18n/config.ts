import { Locale, Direction } from '@/types';

export interface LocaleMeta {
  code: Locale;
  label: string;
  nativeLabel: string;
  dir: Direction;
  fontClass: string;
}

export const LOCALES: Record<Locale, LocaleMeta> = {
  en: {
    code: 'en',
    label: 'English',
    nativeLabel: 'English',
    dir: 'ltr',
    fontClass: 'font-latin',
  },
  fr: {
    code: 'fr',
    label: 'French',
    nativeLabel: 'Français',
    dir: 'ltr',
    fontClass: 'font-latin',
  },
  ar: {
    code: 'ar',
    label: 'Arabic',
    nativeLabel: 'العربية',
    dir: 'rtl',
    fontClass: 'font-arabic',
  },
};

export const DEFAULT_LOCALE: Locale = 'en';
