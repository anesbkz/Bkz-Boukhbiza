import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { RESTART_FUND_TRANSLATIONS } from '../lib/i18n/restartFundTranslations';
import { CUSTOMER_NAV_ITEMS } from '../components/shells/CustomerAppShell';
import { SITE_CONTENT } from '../lib/content/site-content';

describe('Phase 9 — ZIRON RESTART FUND Regression & Security Hardening', () => {
  const restartFundPagePath = path.resolve(__dirname, '../pages/RestartFundPage.tsx');
  const appRestartPagePath = path.resolve(__dirname, '../pages/app/AppRestartPage.tsx');
  const customerShellPath = path.resolve(__dirname, '../components/shells/CustomerAppShell.tsx');
  const appTsxPath = path.resolve(__dirname, '../App.tsx');
  const typesPath = path.resolve(__dirname, '../types/index.ts');
  const schoolRulesPath = path.resolve(__dirname, '../../firestore.rules');

  const restartFundContent = fs.readFileSync(restartFundPagePath, 'utf8');
  const appRestartContent = fs.readFileSync(appRestartPagePath, 'utf8');
  const customerShellContent = fs.readFileSync(customerShellPath, 'utf8');
  const appTsxContent = fs.readFileSync(appTsxPath, 'utf8');
  const typesContent = fs.readFileSync(typesPath, 'utf8');

  // Test 1: /restart/fund route exists
  it('1. registers /restart/fund in router, types, and navigation structures', () => {
    expect(typesContent).toContain("'restart/fund'");
    expect(appTsxContent).toContain("route === 'restart/fund'");
    expect(appTsxContent).toContain('RestartFundPage');
  });

  // Test 2: RESTART FUND appears in customer navigation
  it('2. integrates RESTART FUND into customer navigation (desktop and mobile)', () => {
    expect(customerShellContent).toContain('customer-nav-desktop-restart-fund');
    expect(customerShellContent).toContain('customer-nav-mobile-restart-fund');
    expect(customerShellContent).toContain('customer-restart-fund-btn');
    expect(customerShellContent).toContain("handleNav('restart/fund')");
  });

  // Test 3: RESTART FUND active navigation state works
  it('3. highlights RESTART FUND when route is active', () => {
    expect(customerShellContent).toContain("route === 'restart/fund' || route === 'app/restart/fund'");
    expect(customerShellContent).toContain('text-amber-900 border-amber-600 bg-amber-50');
  });

  // Test 4: Page displays maximum assistance as "up to 2,500,000 DZD"
  it('4. displays maximum assistance as up to 2,500,000 DZD in AR, EN, and FR', () => {
    // English
    expect(RESTART_FUND_TRANSLATIONS.en.hero.headline).toBe('Financial assistance of up to 2,500,000 DZD');
    expect(RESTART_FUND_TRANSLATIONS.en.maxAssistance.amount).toBe('2,500,000');
    expect(RESTART_FUND_TRANSLATIONS.en.maxAssistance.currency).toBe('DZD');
    expect(RESTART_FUND_TRANSLATIONS.en.maxAssistance.qualifier).toContain('up to 2,500,000 DZD');

    // Arabic
    expect(RESTART_FUND_TRANSLATIONS.ar.hero.headline).toBe('مساعدة مالية تصل إلى 2,500,000 دج');
    expect(RESTART_FUND_TRANSLATIONS.ar.maxAssistance.amount).toBe('2,500,000');
    expect(RESTART_FUND_TRANSLATIONS.ar.maxAssistance.currency).toBe('دج');

    // French
    expect(RESTART_FUND_TRANSLATIONS.fr.hero.headline).toBe("Aide financière jusqu'à 2 500 000 DZD");
    expect(RESTART_FUND_TRANSLATIONS.fr.maxAssistance.amount).toBe('2 500 000');
    expect(RESTART_FUND_TRANSLATIONS.fr.maxAssistance.currency).toBe('DZD');
  });

  // Test 5: Page clearly states that the program is currently closed
  it('5. explicitly states that the program is closed and coming soon', () => {
    expect(RESTART_FUND_TRANSLATIONS.ar.hero.statusBadge).toContain('غير مفتوح حاليًا');
    expect(RESTART_FUND_TRANSLATIONS.en.hero.statusBadge).toContain('COMING SOON');
    expect(RESTART_FUND_TRANSLATIONS.en.currentStatus.headline).toBe('Program currently closed');
    expect(RESTART_FUND_TRANSLATIONS.ar.currentStatus.headline).toBe('برنامج غير مفتوح حاليًا');
    expect(RESTART_FUND_TRANSLATIONS.fr.currentStatus.headline).toBe('Programme actuellement fermé');

    // Explicit core 4 points
    expect(RESTART_FUND_TRANSLATIONS.en.currentStatus.bullets).toHaveLength(4);
    expect(RESTART_FUND_TRANSLATIONS.ar.currentStatus.bullets).toHaveLength(4);
    expect(RESTART_FUND_TRANSLATIONS.fr.currentStatus.bullets).toHaveLength(4);
  });

  // Test 6: Page does not contain an application workflow
  it('6. strictly prohibits application workflows, forms, or payment processors', () => {
    // Check page code does not have form inputs or submit actions
    expect(restartFundContent).not.toContain('<form');
    expect(restartFundContent).not.toContain('onSubmit');
    expect(restartFundContent).not.toContain('input type="file"');
    expect(restartFundContent).not.toContain('bank_account');
    expect(restartFundContent).not.toContain('iban');
    expect(restartFundContent).not.toContain('credit_card');
    expect(restartFundContent).not.toContain('Apply Now');
    expect(restartFundContent).not.toContain('Claim Your Grant');
  });

  // Test 7: Page does not create a financial entitlement
  it('7. enforces invariant that School/certificates do not grant financial entitlement', () => {
    expect(RESTART_FUND_TRANSLATIONS.en.ecosystemFit.noAutoEntitlementNotice).toContain(
      'does NOT automatically confer any financial entitlement or grant'
    );
    expect(RESTART_FUND_TRANSLATIONS.ar.ecosystemFit.noAutoEntitlementNotice).toContain(
      'لا يُنشئ أي استحقاق مالي تلقائي ولا يضمن استلام أي مبلغ مالي'
    );
    expect(RESTART_FUND_TRANSLATIONS.fr.ecosystemFit.noAutoEntitlementNotice).toContain(
      'ne confère AUCUN droit financier automatique'
    );
  });

  // Test 8: Page does not require equipment purchase
  it('8. clarifies that assistance is NOT restricted to purchasing equipment', () => {
    expect(RESTART_FUND_TRANSLATIONS.en.freedomOfUse.coreStatement).toBe(
      'The future assistance is not restricted to purchasing specific equipment or a predefined investment.'
    );
    expect(RESTART_FUND_TRANSLATIONS.ar.freedomOfUse.coreStatement).toBe(
      'المساعدة المالية المستقبلية غير مقيدة بشراء معدات محددة أو استثمار محدد سلفًا.'
    );
    expect(RESTART_FUND_TRANSLATIONS.fr.freedomOfUse.coreStatement).toBe(
      "L'aide financière future n'est pas limitée à l'achat d'équipements imposés ou à un investissement prédéfini."
    );
  });

  // Test 9: Page does not describe the assistance as a loan
  it('9. explicitly emphasizes that the fund is NOT A LOAN ("ليست قرضًا")', () => {
    expect(RESTART_FUND_TRANSLATIONS.ar.notALoan.title).toBe('ليست قرضًا');
    expect(RESTART_FUND_TRANSLATIONS.en.notALoan.title).toBe('Not a Loan');
    expect(RESTART_FUND_TRANSLATIONS.fr.notALoan.title).toBe("Ce n'est pas un prêt");

    expect(RESTART_FUND_TRANSLATIONS.en.notALoan.statement).toContain(
      'The ZIRON Restart Fund is designed as financial assistance, not a loan. It is not intended to create a repayment obligation.'
    );
    expect(RESTART_FUND_TRANSLATIONS.ar.notALoan.statement).toContain(
      'صندوق ZIRON Restart مصمم كمساعدة مالية، وليس قرضًا'
    );
  });

  // Test 10: Page states that use is based on beneficiary needs rather than mandatory investment
  it('10. verifies use is based on personal needs across living, housing, education, etc.', () => {
    const categories = RESTART_FUND_TRANSLATIONS.en.freedomOfUse.categories;
    const catIds = categories.map((c) => c.id);

    expect(catIds).toContain('living');
    expect(catIds).toContain('housing');
    expect(catIds).toContain('education');
    expect(catIds).toContain('employment');
    expect(catIds).toContain('obligations');
    expect(catIds).toContain('activity');
    expect(catIds).toContain('family');
    expect(catIds).toContain('newstart');

    expect(RESTART_FUND_TRANSLATIONS.en.freedomOfUse.disclaimerNotice).toContain(
      'illustrative examples of legitimate personal stabilization needs, NOT mandatory spending quotas'
    );
  });

  // Test 11: Existing /app/restart remains functional
  it('11. preserves existing /app/restart functionality, pillars, and links to Fund', () => {
    expect(appRestartContent).toContain('Recovery');
    expect(appRestartContent).toContain('Learning');
    expect(appRestartContent).toContain('Skills');
    expect(appRestartContent).toContain('Certification');
    expect(appRestartContent).toContain('Opportunity');
    expect(appRestartContent).toContain('New Start');
    expect(appRestartContent).toContain('restart-page-view-fund-info-btn');
    expect(appRestartContent).toContain("navigate('restart/fund')");
  });

  // Test 12: Existing School entitlement rule remains unchanged
  it('12. preserves exact 3-container School entitlement rule without modification', () => {
    const entitlementsHookPath = path.resolve(__dirname, '../hooks/useCustomerEntitlements.ts');
    const entitlementsContent = fs.readFileSync(entitlementsHookPath, 'utf8');

    // Rule: ANY 3 unique activated containers
    expect(entitlementsContent).toContain('qualifyingContainerCount >= 3');
    expect(entitlementsContent).toContain('distinctContainerCodes');
  });

  // Test 13: Existing certificate security remains unchanged
  it('13. maintains server-authoritative certificate issuance and security invariants', () => {
    const certServicePath = path.resolve(__dirname, '../services/certificateService.ts');
    const certContent = fs.readFileSync(certServicePath, 'utf8');

    expect(certContent).toContain("'issueCourseCertificate'");
    expect(certContent).toContain('Authoritatively issues / claims a certificate');
    expect(certContent).toContain('verifyCertificatePublic');
  });

  // Test 14: Existing public certificate verification remains unchanged
  it('14. preserves public certificate verification routing and logic', () => {
    expect(appTsxContent).toContain("case 'verify/certificate':");
    expect(appTsxContent).toContain('CertificateVerificationPage');
  });

  // Test 15: Existing navigation invariants remain valid
  it('15. maintains the exact 9 customer navigation items and adds RESTART subnav', () => {
    expect(CUSTOMER_NAV_ITEMS).toHaveLength(9);
    const ids = CUSTOMER_NAV_ITEMS.map((item) => item.id);
    expect(ids).toEqual([
      'app',
      'app/journey',
      'app/products',
      'app/products/activate',
      'app/community',
      'app/school',
      'app/rewards',
      'app/certificates',
      'app/profile',
    ]);

    // Check that restart navigation includes the sub-nav structure
    const restartSubNavPath = path.resolve(__dirname, '../components/navigation/RestartSubNav.tsx');
    expect(fs.existsSync(restartSubNavPath)).toBe(true);
    const subNavContent = fs.readFileSync(restartSubNavPath, 'utf8');
    expect(subNavContent).toContain('ZIRON RESTART');
    expect(subNavContent).toContain('overview');
    expect(subNavContent).toContain('school');
    expect(subNavContent).toContain('certificates');
    expect(subNavContent).toContain('opportunities');
    expect(subNavContent).toContain('fund');
  });
});
