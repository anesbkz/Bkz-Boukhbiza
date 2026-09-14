import React from 'react';
import { Card } from '@/components/design-system/Card';
import { GridPattern } from '@/components/design-system/GridPattern';
import { Shield, Clock, AlertCircle } from 'lucide-react';

interface AdminPlaceholderProps {
  title: string;
  subtitle: string;
  code: string;
  milestoneDescription: string;
  status?: 'PLANNED' | 'SCAFFOLDED' | 'NOT IMPLEMENTED';
}

export const AdminPlaceholderPage: React.FC<AdminPlaceholderProps> = ({
  title,
  subtitle,
  code,
  milestoneDescription,
  status = 'SCAFFOLDED',
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E2E8F0] p-6">
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-gray-100 text-[#0B2346] font-mono text-[10px] uppercase font-bold tracking-wider mb-2">
          <Shield className="w-3.5 h-3.5" />
          SUBSYSTEM REF: {code}
        </div>
        <h1 className="text-xl font-black text-[#0B2346]">{title}</h1>
        <p className="text-xs text-gray-600 mt-0.5">{subtitle}</p>
      </div>

      <div className="bg-white border border-[#E2E8F0] p-8 text-center relative overflow-hidden">
        <GridPattern />
        <div className="relative z-10 max-w-md mx-auto">
          <div className="w-12 h-12 bg-gray-50 border border-gray-200 text-gray-400 flex items-center justify-center mx-auto mb-4">
            <Clock className="w-6 h-6" />
          </div>
          <h2 className="text-sm font-bold text-[#0B2346] mb-1">
            No data available yet
          </h2>
          <p className="text-xs text-gray-500 leading-relaxed mb-4">
            {milestoneDescription}
          </p>
          <div className="inline-block px-3 py-1 bg-amber-50 border border-amber-200 text-[10px] font-mono text-amber-800 font-bold uppercase">
            STATUS: {status} • NOT YET DEPLOYED
          </div>
        </div>
      </div>
    </div>
  );
};
