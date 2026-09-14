import React from 'react';
import { useI18n } from '@/context/I18nContext';
import { Card } from '@/components/design-system/Card';
import { GridPattern } from '@/components/design-system/GridPattern';
import { Building2, Compass, ShieldCheck } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { content } = useI18n();

  return (
    <div className="py-12 bg-[#F5F7FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Dossier */}
        <div className="mb-10 bg-white border border-[#E2E8F0] p-6 sm:p-10 relative overflow-hidden">
          <GridPattern />
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-gray-100 border border-[#E2E8F0] mb-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#0B2346]">
                {content.about.tag}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#0B2346] mb-4">
              {content.about.title}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              {content.about.subtitle}
            </p>
          </div>
        </div>

        {/* Corporate Content Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card variant="default" padding="lg">
            <div className="w-10 h-10 bg-[#0B2346] text-white flex items-center justify-center mb-4">
              <Compass className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-[#0B2346] mb-2">
              {content.about.missionTitle}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              {content.about.missionBody}
            </p>
          </Card>

          <Card variant="default" padding="lg">
            <div className="w-10 h-10 bg-[#0B2346] text-white flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-[#0B2346] mb-2">
              {content.about.standardsTitle}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              {content.about.standardsBody}
            </p>
          </Card>

          <Card variant="default" padding="lg">
            <div className="w-10 h-10 bg-[#0B2346] text-white flex items-center justify-center mb-4">
              <Building2 className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-[#0B2346] mb-2">
              {content.about.governanceTitle}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              {content.about.governanceBody}
            </p>
          </Card>
        </div>

        {/* Legal Identity Note */}
        <div className="bg-white border border-[#E2E8F0] p-6 text-xs text-gray-600">
          <span className="font-bold text-[#0B2346] block mb-1">
            Corporate Entity Notice
          </span>
          <p>
            {content.brand.name} operates under international quality standards for phase-based nutritional wellness protocols. All brand trademarks and serialized identifiers are strictly proprietary.
          </p>
        </div>
      </div>
    </div>
  );
};
