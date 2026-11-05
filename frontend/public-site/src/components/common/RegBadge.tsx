import React from 'react';

interface RegBadgeProps {
  className?: string;
}

export const RegBadge: React.FC<RegBadgeProps> = ({ className = '' }) => {
  return (
    <span
      className={`inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded bg-[#C5A45E] text-[#102A45] shadow-xs select-none ${className}`}
      title="Statutory Regulatory Portal"
    >
      REG
    </span>
  );
};

