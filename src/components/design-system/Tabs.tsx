import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface TabItem<T extends string = string> {
  id: T;
  label: string;
  badge?: string | number;
  icon?: React.ComponentType<{ className?: string }>;
}

interface TabsProps<T extends string = string> {
  tabs: TabItem<T>[];
  activeTab: T;
  onChange: (id: T) => void;
  className?: string;
  variant?: 'underline' | 'pills' | 'segmented';
}

export function Tabs<T extends string = string>({
  tabs,
  activeTab,
  onChange,
  className = '',
  variant = 'underline',
}: TabsProps<T>) {
  if (variant === 'segmented') {
    return (
      <div className={cn('inline-flex p-1 bg-gray-100 border border-[#E2E8F0] gap-1', className)}>
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={cn(
                'px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer select-none',
                isActive
                  ? 'bg-white text-[#0B2346] shadow-xs font-bold'
                  : 'text-gray-500 hover:text-[#0B2346]'
              )}
            >
              {Icon && <Icon className="w-3.5 h-3.5" />}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={cn(
                    'text-[10px] px-1.5 py-0.2 font-mono font-bold',
                    isActive ? 'bg-[#0B2346] text-white' : 'bg-gray-200 text-gray-700'
                  )}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  if (variant === 'pills') {
    return (
      <div className={cn('flex flex-wrap gap-2', className)}>
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={cn(
                'px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer border select-none',
                isActive
                  ? 'bg-[#0B2346] text-white border-[#0B2346]'
                  : 'bg-white text-gray-600 border-[#E2E8F0] hover:border-[#0B2346] hover:text-[#0B2346]'
              )}
            >
              {Icon && <Icon className="w-3.5 h-3.5" />}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={cn(
                    'text-[10px] px-1.5 py-0.2 font-mono',
                    isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                  )}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // default 'underline'
  return (
    <div className={cn('border-b border-[#E2E8F0] flex gap-2 overflow-x-auto', className)}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              'px-4 py-3 text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer border-b-2 whitespace-nowrap select-none -mb-px',
              isActive
                ? 'border-[#0B2346] text-[#0B2346] font-bold'
                : 'border-transparent text-gray-500 hover:text-[#0B2346] hover:border-gray-300'
            )}
          >
            {Icon && <Icon className="w-3.5 h-3.5" />}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={cn(
                  'text-[10px] px-1.5 py-0.2 font-mono',
                  isActive ? 'bg-[#0B2346] text-white' : 'bg-gray-100 text-gray-600'
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
