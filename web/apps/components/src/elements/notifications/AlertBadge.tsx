import React from 'react';

export interface AlertBadgeProps {
  count: number;
  children: React.ReactNode;
}

export const AlertBadge: React.FC<AlertBadgeProps> = ({ count, children }) => {
  if (count === 0) return <>{children}</>;
  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      {children}
      <span
        style={{
          position: 'absolute', top: -6, right: -6,
          minWidth: 18, height: 18, borderRadius: 9,
          backgroundColor: '#e53e3e', color: 'white',
          fontSize: 11, fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '0 4px', lineHeight: 1,
        }}
      >
        {count > 99 ? '99+' : count}
      </span>
    </div>
  );
};
