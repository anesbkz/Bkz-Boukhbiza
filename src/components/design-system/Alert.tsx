import React from 'react';
import { cn } from '@/lib/utils/cn';
import { Info, CheckCircle2, AlertTriangle, AlertCircle, ShieldAlert } from 'lucide-react';

export type AlertVariant = 'info' | 'success' | 'warning' | 'error' | 'clinical';

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  icon?: boolean;
}

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  icon = true,
  className = '',
  ...props
}) => {
  const variantStyles: Record<AlertVariant, { container: string; title: string; text: string; Icon: React.ComponentType<{ className?: string }> }> = {
    info: {
      container: 'bg-blue-50/70 border-l-4 border-blue-600 border-y border-r border-blue-100 text-blue-950',
      title: 'text-blue-900',
      text: 'text-blue-800',
      Icon: Info,
    },
    success: {
      container: 'bg-emerald-50/70 border-l-4 border-[#2E9E45] border-y border-r border-emerald-100 text-emerald-950',
      title: 'text-emerald-900',
      text: 'text-emerald-800',
      Icon: CheckCircle2,
    },
    warning: {
      container: 'bg-amber-50/70 border-l-4 border-[#F28C28] border-y border-r border-amber-100 text-amber-950',
      title: 'text-amber-900',
      text: 'text-amber-800',
      Icon: AlertTriangle,
    },
    error: {
      container: 'bg-red-50/70 border-l-4 border-[#D62828] border-y border-r border-red-100 text-red-950',
      title: 'text-red-900',
      text: 'text-red-800',
      Icon: AlertCircle,
    },
    clinical: {
      container: 'bg-[#0B2346]/5 border-l-4 border-[#0B2346] border-y border-r border-[#E2E8F0] text-[#0B2346]',
      title: 'text-[#0B2346]',
      text: 'text-gray-700',
      Icon: ShieldAlert,
    },
  };

  const style = variantStyles[variant];
  const IconComponent = style.Icon;

  return (
    <div
      role="alert"
      className={cn('p-4 text-xs select-text relative flex items-start gap-3', style.container, className)}
      {...props}
    >
      {icon && (
        <div className="shrink-0 mt-0.5">
          <IconComponent className="w-4 h-4" />
        </div>
      )}
      <div className="flex-1 space-y-1">
        {title && (
          <h5 className={cn('font-bold tracking-wide uppercase text-[11px]', style.title)}>
            {title}
          </h5>
        )}
        <div className={cn('leading-relaxed', style.text)}>{children}</div>
      </div>
    </div>
  );
};
