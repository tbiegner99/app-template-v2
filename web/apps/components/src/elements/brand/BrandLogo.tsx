import React from 'react';

export interface BrandLogoProps {
  width?: number;
  compact?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ width = 180, compact = false }) => {
  if (compact) {
    return (
      <svg width={40} height={40} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <polygon points="20,2 36,11 36,29 20,38 4,29 4,11" fill="#fdba74" />
        <text x="20" y="27" textAnchor="middle" fontSize="18" fontWeight="800" fontFamily="'Segoe UI',sans-serif" fill="#0f2744">__SLUG_INITIAL__</text>
      </svg>
    );
  }

  return (
    <svg width={width} height={44} viewBox="0 0 180 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="20,3 33,10.5 33,25.5 20,33 7,25.5 7,10.5" fill="#fdba74" />
      <text x="20" y="23" textAnchor="middle" fontSize="14" fontWeight="800" fontFamily="'Segoe UI',sans-serif" fill="#0f2744">__SLUG_INITIAL__</text>
      <text x="42" y="18" fontSize="12" fontWeight="800" fontFamily="'Segoe UI',sans-serif" letterSpacing="2.5" fill="#fdba74">__SLUG_UPPER__</text>
      <text x="42" y="31" fontSize="7.5" fontWeight="400" fontFamily="'Segoe UI',sans-serif" letterSpacing="0.5" fill="rgba(255,255,255,0.55)">__DISPLAY_NAME__</text>
    </svg>
  );
};

export default BrandLogo;
