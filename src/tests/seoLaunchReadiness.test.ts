import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  PUBLIC_SEO_CONFIGS,
  isPrivateRoute,
  buildCanonicalUrl,
  resolveCanonicalOrigin,
} from '@/lib/seo/config';
import {
  generateOrganizationSchema,
  generateWebSiteSchema,
  generateProductsSchema,
  generateFaqSchema,
  generateBreadcrumbSchema,
} from '@/lib/seo/schemaGenerators';

describe('ZIRON MVP — SEO & Public Launch Readiness', () => {
  describe('1. Public Routes SEO Metadata', () => {
    const requiredPublicRoutes = [
      '',
      'ziron',
      'program',
      'science',
      'quality',
      'verify',
      'verify/certificate',
      'shop',
      'about',
      'restart',
      'restart/fund',
      'school',
      'community',
      'faq',
    ];

    it('covers all canonical public routes with unique titles and descriptions', () => {
      const titlesEn = new Set<string>();
      const descriptionsEn = new Set<string>();

      requiredPublicRoutes.forEach((route) => {
        const config = PUBLIC_SEO_CONFIGS[route];
        expect(config, `Missing SEO config for route "${route}"`).toBeDefined();

        // Check English
        expect(config.title.en.length).toBeGreaterThan(15);
        expect(config.description.en.length).toBeGreaterThan(30);
        expect(titlesEn.has(config.title.en)).toBe(false);
        expect(descriptionsEn.has(config.description.en)).toBe(false);
        titlesEn.add(config.title.en);
        descriptionsEn.add(config.description.en);

        // Check French
        expect(config.title.fr.length).toBeGreaterThan(15);
        expect(config.description.fr.length).toBeGreaterThan(30);

        // Check Arabic
        expect(config.title.ar.length).toBeGreaterThan(10);
        expect(config.description.ar.length).toBeGreaterThan(20);
      });
    });

    it('does not contain unsupported medical claims or clinical cure promises', () => {
      const bannedWords = ['cure', 'cures', 'guaranteed cure', 'miracle', 'prevents cancer', 'guarantees treatment'];
      Object.values(PUBLIC_SEO_CONFIGS).forEach((config) => {
        const fullText = `${config.title.en} ${config.description.en}`.toLowerCase();
        bannedWords.forEach((banned) => {
          expect(fullText.includes(banned)).toBe(false);
        });
      });
    });
  });

  describe('2. Canonical URL Resolution', () => {
    it('resolves canonical URLs with valid HTTPS schemes', () => {
      const origin = resolveCanonicalOrigin();
      expect(origin).toMatch(/^https?:\/\//);

      const homeUrl = buildCanonicalUrl('', 'en');
      expect(homeUrl).toBe(origin);

      const shopUrl = buildCanonicalUrl('shop', 'en');
      expect(shopUrl).toBe(`${origin}/shop`);

      const shopFrUrl = buildCanonicalUrl('shop', 'fr');
      expect(shopFrUrl).toBe(`${origin}/fr/shop`);

      const shopArUrl = buildCanonicalUrl('shop', 'ar');
      expect(shopArUrl).toBe(`${origin}/ar/shop`);
    });
  });

  describe('3. Private Route Classification (noindex)', () => {
    const privateTestCases = [
      'app',
      'app/journey',
      'app/products',
      'app/products/activate',
      'app/orders',
      'app/orders/ord_123',
      'app/community',
      'app/school',
      'app/school/courses',
      'app/school/certificates',
      'app/restart',
      'app/restart/fund',
      'app/rewards',
      'app/profile',
      'profile',
      'admin',
      'admin/users',
      'admin/orders',
      'admin/orders/ord_456',
      'admin/settings',
      'login',
      'register',
    ];

    it('correctly marks all sensitive and private routes as private', () => {
      privateTestCases.forEach((route) => {
        expect(isPrivateRoute(route), `Route "${route}" should be identified as private`).toBe(true);
      });
    });

    it('does not falsely classify public routes as private', () => {
      const publicRoutes = ['', 'ziron', 'program', 'shop', 'science', 'about', 'faq'];
      publicRoutes.forEach((route) => {
        expect(isPrivateRoute(route), `Route "${route}" should be public`).toBe(false);
      });
    });
  });

  describe('4. Schema.org Structured Data', () => {
    it('generates valid Organization and WebSite schemas', () => {
      const org = generateOrganizationSchema();
      expect(org['@type']).toBe('Organization');
      expect(org.name).toBe('VIREXON BIOSCIENCES');

      const website = generateWebSiteSchema();
      expect(website['@type']).toBe('WebSite');
      expect(website.name).toContain('VIREXON BIOSCIENCES');
    });

    it('generates accurate Product schema reflecting canonical commerce pricing with no fake reviews', () => {
      const products = generateProductsSchema();
      expect(products).toHaveLength(2);

      const oneMonth = products.find((p) => p.sku === 'ZR-1M-30C');
      expect(oneMonth).toBeDefined();
      expect(oneMonth?.offers.price).toBe('8000');
      expect(oneMonth?.offers.priceCurrency).toBe('DZD');

      const threeMonth = products.find((p) => p.sku === 'ZR-BNDL-90C');
      expect(threeMonth).toBeDefined();
      expect(threeMonth?.offers.price).toBe('22000');
      expect(threeMonth?.offers.priceCurrency).toBe('DZD');

      // Verify absence of fake reviews/ratings
      products.forEach((p: any) => {
        expect(p.aggregateRating).toBeUndefined();
        expect(p.review).toBeUndefined();
      });
    });

    it('generates valid FAQPage schema from visible site content', () => {
      const faq = generateFaqSchema('en');
      expect(faq).not.toBeNull();
      expect(faq?.['@type']).toBe('FAQPage');
      expect(faq?.mainEntity.length).toBeGreaterThan(0);
      expect(faq?.mainEntity[0]['@type']).toBe('Question');
      expect(faq?.mainEntity[0].acceptedAnswer['@type']).toBe('Answer');
    });

    it('generates valid BreadcrumbList schema', () => {
      const breadcrumb = generateBreadcrumbSchema('shop', 'ZIRON Official Shop', 'en');
      expect(breadcrumb).not.toBeNull();
      expect(breadcrumb?.['@type']).toBe('BreadcrumbList');
      expect(breadcrumb?.itemListElement).toHaveLength(2);
      expect(breadcrumb?.itemListElement[0].position).toBe(1);
      expect(breadcrumb?.itemListElement[1].position).toBe(2);
    });
  });

  describe('5. Robots.txt Compliance', () => {
    it('exists and contains appropriate allow/disallow directives referencing sitemap', () => {
      const robotsPath = path.resolve(process.cwd(), 'public/robots.txt');
      expect(fs.existsSync(robotsPath)).toBe(true);

      const content = fs.readFileSync(robotsPath, 'utf-8');
      expect(content).toContain('User-agent: *');
      expect(content).toContain('Allow: /');
      expect(content).toContain('Disallow: /app/');
      expect(content).toContain('Disallow: /admin/');
      expect(content).toContain('Disallow: /login');
      expect(content).toContain('Disallow: /register');
      expect(content).toContain('Disallow: /profile');
      expect(content).toContain('Sitemap: https://ziron.bio/sitemap.xml');
    });
  });

  describe('6. Sitemap.xml Compliance', () => {
    it('exists, is well-formed XML, includes all public canonical routes, and excludes private routes', () => {
      const sitemapPath = path.resolve(process.cwd(), 'public/sitemap.xml');
      expect(fs.existsSync(sitemapPath)).toBe(true);

      const content = fs.readFileSync(sitemapPath, 'utf-8');
      expect(content).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(content).toContain('<urlset');

      // Check all canonical public routes are present
      const expectedLocations = [
        'https://ziron.bio/',
        'https://ziron.bio/ziron',
        'https://ziron.bio/program',
        'https://ziron.bio/shop',
        'https://ziron.bio/science',
        'https://ziron.bio/quality',
        'https://ziron.bio/verify',
        'https://ziron.bio/verify/certificate',
        'https://ziron.bio/about',
        'https://ziron.bio/restart',
        'https://ziron.bio/restart/fund',
        'https://ziron.bio/school',
        'https://ziron.bio/community',
        'https://ziron.bio/faq',
      ];

      expectedLocations.forEach((loc) => {
        expect(content, `Sitemap must contain "${loc}"`).toContain(`<loc>${loc}</loc>`);
      });

      // Check that hreflang annotations exist
      expect(content).toContain('hreflang="en"');
      expect(content).toContain('hreflang="fr"');
      expect(content).toContain('hreflang="ar"');
      expect(content).toContain('hreflang="x-default"');

      // Check private routes are NOT in sitemap
      const forbiddenInSitemap = ['/app', '/admin', '/login', '/register', '/profile'];
      forbiddenInSitemap.forEach((forbidden) => {
        expect(content, `Sitemap must NOT contain "${forbidden}"`).not.toContain(`<loc>https://ziron.bio${forbidden}</loc>`);
      });
    });
  });
});
