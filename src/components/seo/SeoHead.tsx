import React, { useEffect } from 'react';
import { Locale } from '@/types';
import { resolveCanonicalOrigin, buildCanonicalUrl } from '@/lib/seo/config';

export interface SeoHeadProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  noindex?: boolean;
  ogType?: 'website' | 'product' | 'article';
  ogImage?: string;
  structuredData?: object | object[] | null;
  route?: string;
  locale?: Locale;
}

function setMetaTag(nameOrProperty: 'name' | 'property', attrValue: string, content: string | null) {
  if (typeof document === 'undefined') return;
  const selector = `meta[${nameOrProperty}="${attrValue}"]`;
  let element = document.querySelector(selector) as HTMLMetaElement | null;

  if (content === null || content === undefined || content === '') {
    if (element) element.remove();
    return;
  }

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(nameOrProperty, attrValue);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function setLinkTag(rel: string, href: string | null, extraAttrs: Record<string, string> = {}) {
  if (typeof document === 'undefined') return;
  
  let selector = `link[rel="${rel}"]`;
  if (extraAttrs.hreflang) {
    selector += `[hreflang="${extraAttrs.hreflang}"]`;
  }
  
  let element = document.querySelector(selector) as HTMLLinkElement | null;

  if (href === null || href === undefined || href === '') {
    if (element) element.remove();
    return;
  }

  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
  Object.entries(extraAttrs).forEach(([k, v]) => element!.setAttribute(k, v));
}

function setJsonLdScript(data: object | object[] | null) {
  if (typeof document === 'undefined') return;
  const scriptId = 'schema-structured-data';
  let script = document.getElementById(scriptId) as HTMLScriptElement | null;

  if (!data) {
    if (script) script.remove();
    return;
  }

  if (!script) {
    script = document.createElement('script');
    script.id = scriptId;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data);
}

export const SeoHead = ({
  title,
  description,
  canonicalUrl,
  noindex = false,
  ogType = 'website',
  ogImage,
  structuredData,
  route,
  locale = 'en' as Locale,
}: SeoHeadProps) => {
  useEffect(() => {
    if (typeof document === 'undefined') return;

    // 1. Page Title
    const finalTitle = title || 'ZIRON | VIREXON BIOSCIENCES';
    document.title = finalTitle;

    // 2. Robots Directive
    if (noindex) {
      setMetaTag('name', 'robots', 'noindex, nofollow');
      // For private pages, remove canonical to avoid confusing search indexers
      setLinkTag('canonical', null);
      // Remove alternate hreflang tags for private pages
      document.querySelectorAll('link[rel="alternate"][hreflang]').forEach((el) => el.remove());
      setJsonLdScript(null);
    } else {
      setMetaTag('name', 'robots', 'index, follow');

      // 3. Canonical URL
      const origin = resolveCanonicalOrigin();
      const resolvedCanonical = canonicalUrl || (route !== undefined ? buildCanonicalUrl(route, locale) : origin);
      setLinkTag('canonical', resolvedCanonical);

      // 4. Multilingual Hreflang Relationships
      if (route !== undefined) {
        setLinkTag('alternate', buildCanonicalUrl(route, 'en'), { hreflang: 'en' });
        setLinkTag('alternate', buildCanonicalUrl(route, 'fr'), { hreflang: 'fr' });
        setLinkTag('alternate', buildCanonicalUrl(route, 'ar'), { hreflang: 'ar' });
        setLinkTag('alternate', buildCanonicalUrl(route, 'en'), { hreflang: 'x-default' });
      }

      // 5. Open Graph Metadata
      setMetaTag('property', 'og:title', finalTitle);
      if (description) setMetaTag('property', 'og:description', description);
      setMetaTag('property', 'og:url', resolvedCanonical);
      setMetaTag('property', 'og:type', ogType);
      setMetaTag('property', 'og:site_name', 'VIREXON BIOSCIENCES | ZIRON');

      const localeMap: Record<Locale, string> = {
        en: 'en_US',
        fr: 'fr_DZ',
        ar: 'ar_DZ',
      };
      setMetaTag('property', 'og:locale', localeMap[locale] || 'en_US');

      const defaultImage = `${origin}/favicon.svg`;
      setMetaTag('property', 'og:image', ogImage || defaultImage);

      // 6. Twitter Card Metadata
      setMetaTag('name', 'twitter:card', 'summary_large_image');
      setMetaTag('name', 'twitter:title', finalTitle);
      if (description) setMetaTag('name', 'twitter:description', description);
      setMetaTag('name', 'twitter:image', ogImage || defaultImage);

      // 7. Structured Data (JSON-LD)
      if (structuredData) {
        setJsonLdScript(structuredData);
      } else {
        setJsonLdScript(null);
      }
    }

    // 8. Meta Description
    if (description) {
      setMetaTag('name', 'description', description);
    }
  }, [title, description, canonicalUrl, noindex, ogType, ogImage, structuredData, route, locale]);

  return null;
};
