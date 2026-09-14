import { describe, it, expect } from 'vitest';
import { getPublicTranslations } from '@/lib/i18n/publicTranslations';
import { getSiteContent } from '@/lib/content/site-content';
import { getLocalizedCatalog } from '@/lib/content/catalog';
import { LOCALES } from '@/lib/i18n/config';

describe('Public Navigation & Complete i18n Architecture Tests', () => {
  describe('1. Locales & Directionality Configuration', () => {
    it('defines en, fr, and ar locales with proper text directions', () => {
      expect(LOCALES.en.dir).toBe('ltr');
      expect(LOCALES.fr.dir).toBe('ltr');
      expect(LOCALES.ar.dir).toBe('rtl');
      expect(LOCALES.ar.fontClass).toBe('font-arabic');
    });
  });

  describe('2. Public Translations Completeness (No English Fallbacks in AR)', () => {
    const arPub = getPublicTranslations('ar');
    const frPub = getPublicTranslations('fr');
    const enPub = getPublicTranslations('en');

    it('provides distinct Arabic content for Home page', () => {
      expect(arPub.home.heroTitle).toContain('برنامج عافية متكامل');
      expect(arPub.home.heroTitle).not.toBe(enPub.home.heroTitle);
      expect(arPub.home.discoverBtn).toBe('استكشف ZIRON');
    });

    it('provides distinct Arabic content for FAQ page', () => {
      expect(arPub.faq.title).toContain('الأسئلة الشائعة');
      expect(arPub.faq.items.length).toBeGreaterThan(0);
      expect(arPub.faq.items[0].question).toMatch(/[\u0600-\u06FF]/); // contains Arabic script
      expect(arPub.faq.items[0].answer).toMatch(/[\u0600-\u06FF]/);
    });

    it('provides distinct Arabic content for Science & Quality pages', () => {
      expect(arPub.science.title).toMatch(/[\u0600-\u06FF]/);
      expect(arPub.quality.title).toMatch(/[\u0600-\u06FF]/);
      expect(arPub.restart.title).toMatch(/[\u0600-\u06FF]/);
    });

    it('provides complete French translations without English leakage', () => {
      expect(frPub.home.heroTitle).toContain('bien-être');
      expect(frPub.faq.title).toBe('Foire Aux Questions');
      expect(frPub.home.discoverBtn).toBe('Découvrir ZIRON');
    });
  });

  describe('3. Site Content (Navigation, School & Community Public Pages)', () => {
    it('provides full Arabic site content for Navigation including School and Community', () => {
      const arContent = getSiteContent('ar');
      const frContent = getSiteContent('fr');
      const enContent = getSiteContent('en');

      // Public Navigation items required by prompt:
      // ZIRON, 90-Day Program, Science, Quality, Community, School, Restart, FAQ
      expect(arContent.nav.product).toBe('ZIRON');
      expect(arContent.nav.program).toBe('برنامج 90 يومًا');
      expect(arContent.nav.science).toBe('الأساس العلمي');
      expect(arContent.nav.quality).toBe('الجودة');
      expect(arContent.nav.community).toBe('المجتمع');
      expect(arContent.nav.school).toBe('المدرسة');
      expect(arContent.nav.restart).toBe('Restart');
      expect(arContent.nav.faq).toBe('الأسئلة الشائعة');

      // Community Page
      expect(arContent.community.heroTitle).toContain('مجتمع');
      expect(arContent.community.heroBadge).toBe('شبكة تواصل المشاركين');

      // School Page
      expect(arContent.school.heroTitle).toContain('مدرسة');
      expect(arContent.school.heroBadge).toBe('التعلم المستمر والمناهج التطبيقية');

      // French checks
      expect(frContent.nav.community).toBe('Communauté');
      expect(frContent.nav.school).toBe('École');
      expect(frContent.nav.restart).toBe('Restart');
      expect(frContent.community.heroTitle).toContain('Communauté');
      expect(frContent.school.heroTitle).toContain('École');

      // English checks
      expect(enContent.nav.community).toBe('Community');
      expect(enContent.nav.school).toBe('School');
      expect(enContent.nav.restart).toBe('Restart');
      expect(enContent.community.heroTitle).toContain('Community');
      expect(enContent.school.heroTitle).toContain('School');
    });
  });

  describe('4. Product Catalog Localization', () => {
    it('returns fully translated product details across all 3 phases and bundle', () => {
      const arCatalog = getLocalizedCatalog('ar');
      const enCatalog = getLocalizedCatalog('en');

      expect(arCatalog.length).toBe(4);
      expect(arCatalog[0].name).toContain('المرحلة 01');
      expect(arCatalog[0].name).not.toBe(enCatalog[0].name);
      expect(arCatalog[0].description).toMatch(/[\u0600-\u06FF]/);

      // Phase 2
      expect(arCatalog[1].name).toContain('المرحلة 02');
      // Phase 3
      expect(arCatalog[2].name).toContain('المرحلة 03');
      // Bundle
      expect(arCatalog[3].name).toContain('حزمة برنامج ZIRON الكاملة لـ 90 يومًا');
    });
  });
});
