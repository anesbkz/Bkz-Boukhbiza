import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
import { AppPermission } from '@/types/rbac';
import { PublicRoute } from '@/types';
import { GridPattern } from '@/components/design-system/GridPattern';
import {
  Shield,
  Users,
  KeyRound,
  Package,
  Factory,
  QrCode,
  Truck,
  MessageSquare,
  GraduationCap,
  BookOpen,
  Award,
  Gift,
  Bell,
  FileText,
  BarChart3,
  ScrollText,
  Settings,
  LogOut,
  ChevronRight,
  ExternalLink,
  Lock,
} from 'lucide-react';

interface NavItem {
  id: PublicRoute;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  requiredPermission?: AppPermission;
  superAdminOnly?: boolean;
}

const ADMIN_NAV_ITEMS: NavItem[] = [
  { id: 'admin', label: 'Command Overview', icon: Shield },
  { id: 'admin/users', label: 'User Directory', icon: Users, requiredPermission: 'MANAGE_USERS' },
  { id: 'admin/roles', label: 'Role Governance', icon: KeyRound, requiredPermission: 'MANAGE_ROLES' },
  { id: 'admin/products', label: 'Manufacturing & Batches', icon: Factory, requiredPermission: 'MANAGE_PRODUCTS' },
  { id: 'admin/codes', label: 'Serialization Codes', icon: QrCode, requiredPermission: 'MANAGE_CODES' },
  { id: 'admin/orders', label: 'Orders & Supply', icon: Truck, requiredPermission: 'MANAGE_ORDERS' },
  { id: 'admin/community', label: 'Community Moderation', icon: MessageSquare, requiredPermission: 'MANAGE_COMMUNITY' },
  { id: 'admin/school', label: 'School Categories', icon: GraduationCap, requiredPermission: 'MANAGE_SCHOOL' },
  { id: 'admin/courses', label: 'Course Curricula', icon: BookOpen, requiredPermission: 'MANAGE_COURSES' },
  { id: 'admin/certificates', label: 'Certificates Registry', icon: Award, requiredPermission: 'MANAGE_SCHOOL' },
  { id: 'admin/rewards', label: 'Rewards & XP Rules', icon: Gift, requiredPermission: 'MANAGE_ALL' },
  { id: 'admin/notifications', label: 'Broadcast Notifications', icon: Bell, requiredPermission: 'MANAGE_COMMUNITY' },
  { id: 'admin/cms', label: 'Dynamic CMS Editor', icon: FileText, requiredPermission: 'MANAGE_CMS' },
  { id: 'admin/analytics', label: 'Analytics Telemetry', icon: BarChart3, requiredPermission: 'VIEW_ANALYTICS' },
  { id: 'admin/audit', label: 'Immutable Audit Log', icon: ScrollText, requiredPermission: 'VIEW_AUDIT_LOGS' },
  { id: 'admin/settings', label: 'System Settings', icon: Settings, requiredPermission: 'MANAGE_SETTINGS' },
];

export const AdminShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, loading, isStaff, isSuperAdmin, hasPermission, logout } = useAuth();
  const { route, navigate } = useI18n();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B2346] flex flex-col items-center justify-center text-white font-mono text-xs p-6">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white animate-spin mb-4" />
        <div>INITIALIZING SECURITY CONTEXT...</div>
      </div>
    );
  }

  // Security barrier: Non-staff or unauthenticated users cannot access Admin shell
  if (!user || !isStaff) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-[#E2E8F0] p-8 shadow-sm relative text-center">
          <GridPattern />
          <div className="relative z-10">
            <div className="w-12 h-12 bg-red-50 border border-red-200 text-[#D62828] flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#D62828] font-bold block mb-1">
              RESTRICTED ACCESS
            </span>
            <h1 className="text-xl font-black text-[#0B2346] mb-3">
              VIREXON Command Center
            </h1>
            <p className="text-xs text-gray-600 leading-relaxed mb-6">
              Administrative credentials required. Your authenticated identity does not hold active administrator or manager roles within the VIREXON BIOSCIENCES governance registry.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => navigate('login')}
                className="flex-1 px-4 py-2.5 bg-[#0B2346] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#07162c] cursor-pointer"
              >
                Switch Account
              </button>
              <button
                onClick={() => navigate('')}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-[#0B2346] text-xs font-bold uppercase tracking-wider hover:bg-gray-200 cursor-pointer"
              >
                Return to Site
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Filter navigation items based on real permissions
  const visibleNav = ADMIN_NAV_ITEMS.filter((item) => {
    if (item.superAdminOnly && !isSuperAdmin) return false;
    if (item.requiredPermission && !hasPermission(item.requiredPermission)) return false;
    return true;
  });

  const activeNavItem = ADMIN_NAV_ITEMS.find((item) => item.id === route) || ADMIN_NAV_ITEMS[0];

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col font-sans text-gray-900">
      {/* Top Bar */}
      <header className="bg-[#0B2346] text-white h-14 border-b border-white/10 px-4 sm:px-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 bg-[#2E9E45] rounded-full animate-pulse" />
          <div className="text-xs font-black tracking-wider uppercase">
            VIREXON <span className="font-mono text-[10px] text-gray-400">COMMAND CENTER</span>
          </div>
          <span className="hidden sm:inline-block px-2 py-0.5 bg-white/10 text-[9px] font-mono uppercase tracking-widest text-emerald-400">
            {profile?.roles?.join(' • ') || 'STAFF'}
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="hidden md:flex flex-col text-end font-mono text-[11px] leading-tight">
            <span className="text-white font-bold">{profile?.displayName || user.email}</span>
            <span className="text-gray-400 text-[9px]">{user.email}</span>
          </div>

          <button
            onClick={() => navigate('')}
            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-gray-300 hover:text-white hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
            title="View Public Site"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Public Site</span>
          </button>

          <button
            onClick={logout}
            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-red-300 hover:text-white hover:bg-red-900/50 border border-red-500/30 transition-colors cursor-pointer"
            title="Terminate Administrative Session"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-[#E2E8F0] shrink-0 flex flex-col justify-between overflow-y-auto">
          <div className="p-3">
            <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-widest text-gray-400">
              Operational Subsystems
            </div>
            <nav className="space-y-0.5">
              {visibleNav.map((item) => {
                const Icon = item.icon;
                const isActive = route === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold tracking-wide transition-colors cursor-pointer text-start ${
                      isActive
                        ? 'bg-[#0B2346] text-white shadow-xs'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-[#0B2346]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-3 border-t border-gray-100 text-[10px] font-mono text-gray-500 space-y-1">
            <div className="flex justify-between">
              <span>SECURITY ENGINE</span>
              <span className="text-emerald-600 font-bold">ACTIVE</span>
            </div>
            <div className="flex justify-between">
              <span>FIRESTORE RULES</span>
              <span className="text-gray-700 font-semibold">ENFORCED</span>
            </div>
            <div className="truncate text-gray-400 text-[9px] pt-1">
              UID: {user.uid.slice(0, 12)}...
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {/* Breadcrumb Header */}
          <div className="mb-6 flex items-center gap-2 text-xs text-gray-500 font-mono">
            <span
              onClick={() => navigate('admin')}
              className="cursor-pointer hover:text-[#0B2346] font-bold"
            >
              COMMAND
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-[#0B2346] font-bold uppercase">{activeNavItem.label}</span>
          </div>

          {children}
        </main>
      </div>
    </div>
  );
};
