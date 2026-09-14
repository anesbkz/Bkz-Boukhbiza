import React from 'react';
import { useI18n } from '@/context/I18nContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/design-system/Button';
import { GridPattern } from '@/components/design-system/GridPattern';
import { getSiteContent } from '@/lib/content/site-content';
import {
  MessageSquare,
  ShieldCheck,
  Users,
  Sparkles,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

export const CommunityPage: React.FC = () => {
  const { locale, dir, navigate } = useI18n();
  const { user } = useAuth();
  const siteContent = getSiteContent(locale);
  const comm = siteContent.community;

  return (
    <div className="py-12 bg-[#F5F7FA]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header Hero */}
        <div className="bg-white border border-[#E2E8F0] p-8 sm:p-12 relative overflow-hidden">
          <GridPattern />
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-gray-100 border border-[#E2E8F0] mb-4">
              <MessageSquare className="w-3.5 h-3.5 text-[#0B2346]" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#0B2346] font-bold">
                {comm.heroBadge}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#0B2346] mb-4">
              {comm.heroTitle}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-6">
              {comm.heroSubtitle}
            </p>

            <div className="flex flex-wrap gap-3">
              {user ? (
                <Button
                  onClick={() => navigate('app/community')}
                  variant="primary"
                  size="lg"
                  className="cursor-pointer inline-flex items-center gap-2"
                >
                  <span>{comm.enterCommunityBtn}</span>
                  {dir === 'rtl' ? (
                    <ArrowLeft className="w-4 h-4" />
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )}
                </Button>
              ) : (
                <>
                  <Button
                    onClick={() => navigate('register')}
                    variant="primary"
                    size="lg"
                    className="cursor-pointer inline-flex items-center gap-2"
                  >
                    <span>{comm.enrollBtn}</span>
                    {dir === 'rtl' ? (
                      <ArrowLeft className="w-4 h-4" />
                    ) : (
                      <ArrowRight className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    onClick={() => navigate('verify')}
                    variant="outline"
                    size="lg"
                    className="cursor-pointer"
                  >
                    {comm.verifyCodeBtn}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Access Model Architecture */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-[#E2E8F0] p-6">
            <div className="w-10 h-10 bg-blue-50 text-[#0B2346] flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#0B2346] mb-2">
              {comm.shieldTitle}
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              {comm.shieldDesc}
            </p>
          </div>

          <div className="bg-white border border-[#E2E8F0] p-6">
            <div className="w-10 h-10 bg-emerald-50 text-[#2E9E45] flex items-center justify-center mb-4">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#0B2346] mb-2">
              {comm.cohortTitle}
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              {comm.cohortDesc}
            </p>
          </div>

          <div className="bg-white border border-[#E2E8F0] p-6">
            <div className="w-10 h-10 bg-amber-50 text-[#F28C28] flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#0B2346] mb-2">
              {comm.moderationTitle}
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              {comm.moderationDesc}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

