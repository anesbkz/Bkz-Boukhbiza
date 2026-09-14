import React from 'react';
import { cn } from '@/lib/utils/cn';
import { Inbox } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className = '',
}) => {
  return (
    <div
      className={cn(
        'bg-white border border-[#E2E8F0] p-10 sm:p-14 text-center max-w-xl mx-auto shadow-xs',
        className
      )}
    >
      <div className="w-14 h-14 bg-gray-50 border border-gray-200 text-gray-400 flex items-center justify-center mx-auto mb-4">
        <Icon className="w-7 h-7 text-gray-400" />
      </div>
      <h3 className="text-base font-bold text-[#0B2346] mb-2">{title}</h3>
      <p className="text-xs text-gray-600 leading-relaxed max-w-md mx-auto mb-6">{description}</p>
      {(actionLabel || secondaryActionLabel) && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {actionLabel && onAction && (
            <Button onClick={onAction} variant="primary" size="md">
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button onClick={onSecondaryAction} variant="outline" size="md">
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
