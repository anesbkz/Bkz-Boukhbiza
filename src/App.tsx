import React from 'react';
import { I18nProvider, useI18n } from '@/context/I18nContext';
import { AuthProvider } from '@/context/AuthContext';
import { PublicShell } from '@/components/shells/PublicShell';
import { AdminShell } from '@/components/shells/AdminShell';
import { CustomerAppShell } from '@/components/shells/CustomerAppShell';

// Public pages
import { HomePage } from '@/pages/HomePage';
import { ZironProductPage } from '@/pages/ZironProductPage';
import { ProgramPage } from '@/pages/ProgramPage';
import { SciencePage } from '@/pages/SciencePage';
import { QualityPage } from '@/pages/QualityPage';
import { VerifyPage } from '@/pages/VerifyPage';
import { ShopPage } from '@/pages/ShopPage';
import { AboutPage } from '@/pages/AboutPage';
import { RestartPage } from '@/pages/RestartPage';
import { FaqPage } from '@/pages/FaqPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { CommunityPage } from '@/pages/CommunityPage';
import { SchoolPage } from '@/pages/SchoolPage';
import { CertificateVerificationPage } from '@/pages/public/CertificateVerificationPage';

// Authenticated app pages
import { DashboardPage } from '@/pages/app/DashboardPage';
import { JourneyPage } from '@/pages/app/JourneyPage';
import { ProductsPage } from '@/pages/app/ProductsPage';
import { ActivateProductPage } from '@/pages/app/ActivateProductPage';
import { ProfilePage } from '@/pages/app/ProfilePage';
import { AppCommunityPage } from '@/pages/app/AppCommunityPage';
import { AppSchoolPage } from '@/pages/app/AppSchoolPage';
import { AppRestartPage } from '@/pages/app/AppRestartPage';
import { RewardsPage } from '@/pages/app/RewardsPage';
import { CertificatesPage } from '@/pages/app/CertificatesPage';
import { CustomerRouteGuard } from '@/components/guards/CustomerRouteGuard';

// Admin pages
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { AdminSchoolPage } from '@/pages/admin/AdminSchoolPage';
import { AdminCommunityPage } from '@/pages/admin/AdminCommunityPage';
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage';
import { AdminRolesPage } from '@/pages/admin/AdminRolesPage';
import { AdminAuditPage } from '@/pages/admin/AdminAuditPage';
import { AdminCmsPage } from '@/pages/admin/AdminCmsPage';
import { AdminProductsPage } from '@/pages/admin/AdminProductsPage';
import { AdminCodesPage } from '@/pages/admin/AdminCodesPage';
import { AdminCertificatesPage } from '@/pages/admin/AdminCertificatesPage';
import { AdminPlaceholderPage } from '@/pages/admin/AdminPlaceholderPage';
import { AdminRouteGuard } from '@/components/guards/AdminRouteGuard';

function RouterOutlet() {
  const { route } = useI18n();

  // Admin routes routed through AdminShell
  if (route.startsWith('admin')) {
    let adminContent: React.ReactNode;
    switch (route) {
      case 'admin/school':
        adminContent = (
          <AdminRouteGuard requiredPermission="MANAGE_SCHOOL">
            <AdminSchoolPage />
          </AdminRouteGuard>
        );
        break;
      case 'admin/community':
        adminContent = (
          <AdminRouteGuard requiredPermission="MANAGE_COMMUNITY">
            <AdminCommunityPage />
          </AdminRouteGuard>
        );
        break;
      case 'admin/users':
        adminContent = (
          <AdminRouteGuard requiredPermission="MANAGE_USERS">
            <AdminUsersPage />
          </AdminRouteGuard>
        );
        break;
      case 'admin/roles':
        adminContent = (
          <AdminRouteGuard requiredPermission="MANAGE_ROLES">
            <AdminRolesPage />
          </AdminRouteGuard>
        );
        break;
      case 'admin/audit':
        adminContent = (
          <AdminRouteGuard requiredPermission="VIEW_AUDIT_LOGS">
            <AdminAuditPage />
          </AdminRouteGuard>
        );
        break;
      case 'admin/cms':
        adminContent = (
          <AdminRouteGuard requiredPermission="MANAGE_CMS">
            <AdminCmsPage />
          </AdminRouteGuard>
        );
        break;
      case 'admin/products':
        adminContent = (
          <AdminRouteGuard requiredPermission="MANAGE_PRODUCTS">
            <AdminProductsPage />
          </AdminRouteGuard>
        );
        break;
      case 'admin/codes':
        adminContent = (
          <AdminRouteGuard requiredPermission="MANAGE_CODES">
            <AdminCodesPage />
          </AdminRouteGuard>
        );
        break;
      case 'admin/orders':
        adminContent = (
          <AdminRouteGuard requiredPermission="MANAGE_ORDERS">
            <AdminPlaceholderPage
              title="Supply & Fulfillment Orders"
              subtitle="Review customer orders, Algerian DZD transactions, and logistics status."
              code="FULFILL_01"
              status="PLANNED"
              milestoneDescription="Order queue data models defined. Algerian DZD payment reconciliation and logistics queue interface planned for upcoming milestone."
            />
          </AdminRouteGuard>
        );
        break;
      case 'admin/courses':
        adminContent = (
          <AdminRouteGuard requiredPermission="MANAGE_COURSES">
            <AdminPlaceholderPage
              title="Curriculum Courses & Lessons"
              subtitle="Assemble structured modules, lesson markdown, and laboratory exercises for ZIRON School."
              code="CURRICULA_01"
              status="SCAFFOLDED"
              milestoneDescription="Curriculum category CMS is fully functional in Firestore. Course lesson sequence editor planned for next milestone."
            />
          </AdminRouteGuard>
        );
        break;
      case 'admin/certificates':
        adminContent = (
          <AdminRouteGuard requiredPermission="MANAGE_SCHOOL">
            <AdminCertificatesPage />
          </AdminRouteGuard>
        );
        break;
      case 'admin/rewards':
        adminContent = (
          <AdminRouteGuard requiredPermission="MANAGE_ALL">
            <AdminPlaceholderPage
              title="Rewards & XP Gamification Engine"
              subtitle="Configure milestone reward thresholds, daily check-in XP, and streak badges."
              code="GAMIFY_01"
              status="PLANNED"
              milestoneDescription="Gamification XP and Leveling schemas defined. Milestone trigger control panel planned for gamification milestone."
            />
          </AdminRouteGuard>
        );
        break;
      case 'admin/notifications':
        adminContent = (
          <AdminRouteGuard requiredPermission="MANAGE_COMMUNITY">
            <AdminPlaceholderPage
              title="Broadcast Notifications"
              subtitle="Dispatch platform-wide notices, protocol reminders, and email advisories."
              code="NOTIF_01"
              status="PLANNED"
              milestoneDescription="Community announcement service active. Direct push and multi-channel notification dispatcher planned for messaging milestone."
            />
          </AdminRouteGuard>
        );
        break;
      case 'admin/analytics':
        adminContent = (
          <AdminRouteGuard requiredPermission="VIEW_ANALYTICS">
            <AdminPlaceholderPage
              title="Operational Analytics & Telemetry"
              subtitle="Real-time participant engagement, completion ratios, and inventory velocity."
              code="ANALYTICS_01"
              status="PLANNED"
              milestoneDescription="Data logging models configured. Real aggregated cohort telemetry will stream dynamically as subject participation expands."
            />
          </AdminRouteGuard>
        );
        break;
      case 'admin/settings':
        adminContent = (
          <AdminRouteGuard requiredPermission="MANAGE_SETTINGS">
            <AdminPlaceholderPage
              title="Platform Settings & Compliance"
              subtitle="Configure market currency (DZD), localization defaults, and security policies."
              code="SETTINGS_01"
              status="PLANNED"
              milestoneDescription="Platform configuration schemas established. Live system preference control panel planned for compliance milestone."
            />
          </AdminRouteGuard>
        );
        break;
      case 'admin':
      default:
        adminContent = (
          <AdminRouteGuard>
            <AdminDashboardPage />
          </AdminRouteGuard>
        );
        break;
    }

    return <AdminShell>{adminContent}</AdminShell>;
  }

  // Customer application routes routed through CustomerAppShell
  if (route.startsWith('app')) {
    let appContent: React.ReactNode;
    switch (route) {
      case 'app/journey':
        appContent = (
          <CustomerRouteGuard>
            <JourneyPage />
          </CustomerRouteGuard>
        );
        break;
      case 'app/products':
        appContent = (
          <CustomerRouteGuard>
            <ProductsPage />
          </CustomerRouteGuard>
        );
        break;
      case 'app/products/activate':
        appContent = (
          <CustomerRouteGuard>
            <ActivateProductPage />
          </CustomerRouteGuard>
        );
        break;
      case 'app/community':
        appContent = (
          <CustomerRouteGuard>
            <AppCommunityPage />
          </CustomerRouteGuard>
        );
        break;
      case 'app/school':
        appContent = (
          <CustomerRouteGuard>
            <AppSchoolPage initialView="dashboard" />
          </CustomerRouteGuard>
        );
        break;
      case 'app/school/courses':
        appContent = (
          <CustomerRouteGuard>
            <AppSchoolPage initialView="catalog" />
          </CustomerRouteGuard>
        );
        break;
      case 'app/school/certificates':
        appContent = (
          <CustomerRouteGuard>
            <CertificatesPage />
          </CustomerRouteGuard>
        );
        break;
      case 'app/restart':
        appContent = (
          <CustomerRouteGuard>
            <AppRestartPage />
          </CustomerRouteGuard>
        );
        break;
      case 'app/rewards':
        appContent = (
          <CustomerRouteGuard>
            <RewardsPage />
          </CustomerRouteGuard>
        );
        break;
      case 'app/certificates':
        appContent = (
          <CustomerRouteGuard>
            <CertificatesPage />
          </CustomerRouteGuard>
        );
        break;
      case 'app/profile':
        appContent = (
          <CustomerRouteGuard>
            <ProfilePage />
          </CustomerRouteGuard>
        );
        break;
      case 'app':
      default:
        if (route.startsWith('app/school/courses/')) {
          const coursePath = route.replace('app/school/courses/', '');
          if (coursePath.endsWith('/learn')) {
            const courseId = coursePath.replace('/learn', '');
            appContent = (
              <CustomerRouteGuard>
                <AppSchoolPage initialView="player" initialCourseId={courseId} />
              </CustomerRouteGuard>
            );
          } else {
            appContent = (
              <CustomerRouteGuard>
                <AppSchoolPage initialView="detail" initialCourseId={coursePath} />
              </CustomerRouteGuard>
            );
          }
        } else {
          appContent = (
            <CustomerRouteGuard>
              <DashboardPage />
            </CustomerRouteGuard>
          );
        }
        break;
    }

    return <CustomerAppShell>{appContent}</CustomerAppShell>;
  }

  // Public routes routed through PublicShell
  let publicContent: React.ReactNode;
  switch (route) {
    case 'profile':
      publicContent = (
        <CustomerRouteGuard>
          <ProfilePage />
        </CustomerRouteGuard>
      );
      break;
    case 'community':
      publicContent = <CommunityPage />;
      break;
    case 'school':
      publicContent = <SchoolPage />;
      break;
    case 'ziron':
      publicContent = <ZironProductPage />;
      break;
    case 'program':
      publicContent = <ProgramPage />;
      break;
    case 'science':
      publicContent = <SciencePage />;
      break;
    case 'quality':
      publicContent = <QualityPage />;
      break;
    case 'verify':
      publicContent = <VerifyPage />;
      break;
    case 'verify/certificate':
    case 'verify-certificate':
      publicContent = <CertificateVerificationPage />;
      break;
    case 'shop':
      publicContent = <ShopPage />;
      break;
    case 'about':
      publicContent = <AboutPage />;
      break;
    case 'restart':
      publicContent = <RestartPage />;
      break;
    case 'faq':
      publicContent = <FaqPage />;
      break;
    case 'login':
      publicContent = <LoginPage />;
      break;
    case 'register':
      publicContent = <RegisterPage />;
      break;
    case '':
    default:
      publicContent = <HomePage />;
      break;
  }

  return <PublicShell>{publicContent}</PublicShell>;
}

export default function App() {
  return (
    <AuthProvider>
      <I18nProvider>
        <RouterOutlet />
      </I18nProvider>
    </AuthProvider>
  );
}
