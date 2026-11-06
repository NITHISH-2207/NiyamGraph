import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showDot = true,
}) => {
  const norm = (status || '').toLowerCase().trim();

  let bg = 'bg-slate-100';
  let text = 'text-slate-700';
  let dotColor = 'bg-slate-400';
  let border = 'border-slate-200';

  if (norm.includes('approved') || norm.includes('satisfied') || norm.includes('verified') || norm === 'compliant') {
    bg = 'bg-[#E8F5EC]';
    text = 'text-[#237A46]';
    dotColor = 'bg-[#237A46]';
    border = 'border-[#C4E6CD]';
  } else if (norm.includes('rejected') || norm.includes('critical') || norm.includes('deficient') || norm.includes('overdue')) {
    bg = 'bg-[#FCEBEC]';
    text = 'text-[#B42332]';
    dotColor = 'bg-[#B42332]';
    border = 'border-[#F7C6CB]';
  } else if (norm.includes('pending') || norm.includes('in progress') || norm.includes('missing') || norm.includes('action required')) {
    bg = 'bg-[#FFF4DD]';
    text = 'text-[#A66A0A]';
    dotColor = 'bg-[#A66A0A]';
    border = 'border-[#FFE3A8]';
  } else if (norm.includes('review') || norm.includes('conflict') || norm.includes('submitted') || norm.includes('clarification') || norm.includes('gate')) {
    bg = 'bg-[#EAF2FA]';
    text = 'text-[#245B87]';
    dotColor = 'bg-[#245B87]';
    border = 'border-[#C2DBF2]';
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-semibold',
    lg: 'px-3 py-1.5 text-sm font-semibold',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${border} ${bg} ${text} ${sizeClasses} whitespace-nowrap`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />}
      {status || 'Unknown'}
    </span>
  );
};

