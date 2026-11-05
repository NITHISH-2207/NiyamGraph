import React from 'react';

interface BrandEmblemProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'dark' | 'gold';
}

export const BrandEmblem: React.FC<BrandEmblemProps> = ({
  className = '',
  size = 'md',
  variant = 'light',
}) => {
  const sizeMap = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const isDarkBg = variant === 'light'; // Light emblem on dark bg
  const pedimentColor = variant === 'gold' ? '#C5A45E' : isDarkBg ? '#C5A45E' : '#183B5D';
  const pillarColor = isDarkBg ? '#FFFFFF' : '#183B5D';
  const baseColor = variant === 'gold' ? '#C5A45E' : isDarkBg ? '#C5A45E' : '#245B82';

  return (
    <svg
      className={`${sizeMap[size]} ${className} shrink-0`}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Institutional Pediment (Roof) */}
      <path
        d="M20 7L6 14.5V17H34V14.5L20 7Z"
        fill={pedimentColor}
      />
      {/* Entablature */}
      <rect x="7" y="17.5" width="26" height="2" rx="0.5" fill={baseColor} />
      {/* 4 Classical Pillars */}
      <rect x="9.5" y="21" width="3" height="10" rx="0.5" fill={pillarColor} />
      <rect x="15.5" y="21" width="3" height="10" rx="0.5" fill={pillarColor} />
      <rect x="21.5" y="21" width="3" height="10" rx="0.5" fill={pillarColor} />
      <rect x="27.5" y="21" width="3" height="10" rx="0.5" fill={pillarColor} />
      {/* Stylobate / Base Steps */}
      <rect x="6.5" y="31.5" width="27" height="2.5" rx="0.5" fill={baseColor} />
      <rect x="4.5" y="34.5" width="31" height="2.5" rx="0.5" fill={pedimentColor} />
    </svg>
  );
};

