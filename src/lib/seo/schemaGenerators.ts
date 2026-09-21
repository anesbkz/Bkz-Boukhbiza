import { Locale } from '@/types';
import { resolveCanonicalOrigin, buildCanonicalUrl } from './config';
import { ZIRON_CATALOG } from '@/lib/content/catalog';
import { SITE_CONTENT } from '@/lib/content/site-content';

/**
 * Builds Schema.org Organization structured data.
 */
export function generateOrganizationSchema(origin: string = resolveCanonicalOrigin()) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'VIREXON BIOSCIENCES',
    url: origin,
    logo: `${origin}/favicon.svg`,
    description:
      'Phase-based nutritional wellness protocols, sequential habit formation, and transparent batch serialization.',
  };
}

/**
 * Builds Schema.org WebSite structured data.
 */
export function generateWebSiteSchema(origin: string = resolveCanonicalOrigin()) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'ZIRON | VIREXON BIOSCIENCES',
    url: origin,
    description:
      'Sequential 90-day dietary wellness protocol structured across three designated phases by VIREXON BIOSCIENCES.',
  };
}

/**
 * Builds Schema.org Product structured data for ZIRON canonical commerce offerings.
 * Conforms strictly to factual catalog data without fake reviews or ratings.
 */
export function generateProductsSchema(origin: string = resolveCanonicalOrigin()) {
  const shopUrl = `${origin}/shop`;

  const item1m = ZIRON_CATALOG.find((it) => it.sku === 'ZR-1M-30C') || {
    name: 'ZIRON 1 Month',
    priceDzd: 8000,
    sku: 'ZR-1M-30C',
  };

  const bundle = ZIRON_CATALOG.find((it) => it.sku === 'ZR-BNDL-90C') || {
    name: 'ZIRON 90-Day Complete Program Bundle',
    priceDzd: 22000,
    sku: 'ZR-BNDL-90C',
  };

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'ZIRON 1 Month (30 Capsules)',
      sku: 'ZR-1M-30C',
      description:
        'Sequential 30-day dietary supplement capsules formulated for disciplined morning intake habits and routine consistency.',
      brand: {
        '@type': 'Brand',
        name: 'VIREXON BIOSCIENCES',
      },
      offers: {
        '@type': 'Offer',
        price: item1m.priceDzd.toString(),
        priceCurrency: 'DZD',
        availability: 'https://schema.org/InStock',
        url: shopUrl,
        priceValidUntil: '2027-12-31',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'ZIRON 90-Day Complete Program Bundle',
      sku: 'ZR-BNDL-90C',
      description:
        'Complete 3-phase nutritional wellness protocol containing all three 30-capsule sequential containers (90 days total).',
      brand: {
        '@type': 'Brand',
        name: 'VIREXON BIOSCIENCES',
      },
      offers: {
        '@type': 'Offer',
        price: bundle.priceDzd.toString(),
        priceCurrency: 'DZD',
        availability: 'https://schema.org/InStock',
        url: shopUrl,
        priceValidUntil: '2027-12-31',
      },
    },
  ];
}

/**
 * Builds Schema.org FAQPage structured data using real questions from SITE_CONTENT.
 */
export function generateFaqSchema(locale: Locale = 'en') {
  const faqContent = SITE_CONTENT[locale]?.faq;
  if (!faqContent || !faqContent.items || faqContent.items.length === 0) {
    return null;
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqContent.items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

/**
 * Builds Schema.org BreadcrumbList structured data for a public route.
 */
export function generateBreadcrumbSchema(
  route: string,
  pageTitle: string,
  locale: Locale = 'en',
  origin: string = resolveCanonicalOrigin()
) {
  if (!route) return null;

  const items = [
    {
      '@type': 'ListItem',
      position: 1,
      name: locale === 'fr' ? 'Accueil' : locale === 'ar' ? 'الرئيسية' : 'Home',
      item: origin,
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: pageTitle,
      item: buildCanonicalUrl(route, locale),
    },
  ];

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  };
}
