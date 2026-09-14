import React from 'react';

export const GridPattern: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 opacity-[0.03] select-none ${className}`}
      style={{
        backgroundImage: `radial-gradient(#0B2346 1px, transparent 1px)`,
        backgroundSize: '24px 24px',
      }}
    />
  );
};
