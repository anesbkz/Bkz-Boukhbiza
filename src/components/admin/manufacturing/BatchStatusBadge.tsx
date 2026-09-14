import React from 'react';
import { BatchStatus } from '@/types/models';
import { CheckCircle2, AlertTriangle, Archive } from 'lucide-react';

interface BatchStatusBadgeProps {
  status: BatchStatus | string;
  className?: string;
}

export const BatchStatusBadge: React.FC<BatchStatusBadgeProps> = ({ status, className = '' }) => {
  const normalizedStatus = (status || '').toUpperCase() as BatchStatus;

  switch (normalizedStatus) {
    case 'ACTIVE':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-300 ${className}`}
        >
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          ACTIVE
        </span>
      );
    case 'DISABLED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-300 ${className}`}
        >
          <AlertTriangle className="w-3 h-3 text-amber-600" />
          DISABLED
        </span>
      );
    case 'ARCHIVED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-gray-100 text-gray-700 border border-gray-300 ${className}`}
        >
          <Archive className="w-3 h-3 text-gray-500" />
          ARCHIVED
        </span>
      );
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-gray-50 text-gray-600 border border-gray-200 ${className}`}
        >
          {status || 'UNKNOWN'}
        </span>
      );
  }
};
