import React from 'react';
import { LucideIcon, ArrowUpRight } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: number | string;
  context: string;
  statusText?: string;
  statusType?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  icon: LucideIcon;
  onClick?: () => void;
  accentColor?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  context,
  statusText,
  statusType = 'neutral',
  icon: Icon,
  onClick,
}) => {
  const badgeStyles = {
    success: 'bg-[#E8F5EC] text-[#237A46] border-[#C4E6CD]',
    warning: 'bg-[#FFF4DD] text-[#A66A0A] border-[#FFE3A8]',
    danger: 'bg-[#FCEBEC] text-[#B42332] border-[#F7C6CB]',
    info: 'bg-[#EAF2FA] text-[#245B87] border-[#C2DBF2]',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  }[statusType];

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-[10px] border border-border p-4.5 transition-all duration-200 hover:shadow-md hover:border-navy-600/40 relative flex flex-col justify-between ${
        onClick ? 'cursor-pointer group' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-[13px] font-medium text-txt-secondary leading-snug line-clamp-1">
          {title}
        </span>
        <div className="w-8 h-8 rounded-lg bg-surface-subtle flex items-center justify-center text-navy-800 group-hover:bg-navy-800 group-hover:text-white transition-colors duration-200 flex-shrink-0 ml-2">
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-2 mb-2">
        <div className="text-2xl font-bold text-navy-900 tracking-tight">
          {value}
        </div>
        {statusText && (
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${badgeStyles}`}
          >
            {statusText}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-txt-secondary pt-2 border-t border-slate-100 mt-1">
        <span className="truncate">{context}</span>
        {onClick && (
          <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-navy-800 transition-colors duration-200 ml-1 flex-shrink-0" />
        )}
      </div>
    </div>
  );
};

