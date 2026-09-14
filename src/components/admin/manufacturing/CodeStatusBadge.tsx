import React from 'react';
import { ProductCodeStatus } from '@/types/models';
import { Sparkles, CheckCheck, Ban, ShieldAlert } from 'lucide-react';

interface CodeStatusBadgeProps {
  status: ProductCodeStatus | string;
  isActivated?: boolean;
  className?: string;
}

export const CodeStatusBadge: React.FC<CodeStatusBadgeProps> = ({
  status,
  isActivated,
  className = '',
}) => {
  const normalized = (status || '').toUpperCase();

  if (isActivated || normalized === 'ACTIVATED') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-300 ${className}`}
      >
        <CheckCheck className="w-3 h-3 text-emerald-600" />
        ACTIVATED
      </span>
    );
  }

  switch (normalized) {
    case 'UNUSED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-blue-50 text-[#0B2346] border border-blue-200 ${className}`}
        >
          <Sparkles className="w-3 h-3 text-[#0B2346]" />
          UNUSED
        </span>
      );
    case 'DISABLED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-300 ${className}`}
        >
          <Ban className="w-3 h-3 text-amber-600" />
          DISABLED
        </span>
      );
    case 'REVOKED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-red-50 text-[#D62828] border border-red-200 ${className}`}
        >
          <ShieldAlert className="w-3 h-3 text-[#D62828]" />
          REVOKED
        </span>
      );
    default:
      return (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-medium uppercase tracking-wider bg-gray-100 text-gray-700 border border-gray-200 ${className}`}
        >
          {status || 'UNKNOWN'}
        </span>
      );
  }
};
