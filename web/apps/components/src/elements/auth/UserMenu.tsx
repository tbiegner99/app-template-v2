import React, { useState, useRef, useEffect } from 'react';

export interface UserMenuProps {
  displayName?: string;
  email?: string;
  onSignOut: () => void;
  extraMenuItems?: React.ReactNode;
}

const getInitials = (name?: string): string => {
  if (!name) return '?';
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
};

export const UserMenu: React.FC<UserMenuProps> = ({ displayName, email, onSignOut, extraMenuItems }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handle = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    const id = setTimeout(() => document.addEventListener('mousedown', handle), 0);
    return () => { clearTimeout(id); document.removeEventListener('mousedown', handle); };
  }, [isOpen]);

  return (
    <div style={{ position: 'relative' }} ref={menuRef}>
      <button
        data-id="user-menu-button"
        onClick={() => setIsOpen((o) => !o)}
        style={{
          width: 40, height: 40, borderRadius: '50%', backgroundColor: '#667eea',
          color: 'white', border: 'none', cursor: 'pointer', fontSize: 14,
          fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
        aria-label="User menu"
      >
        {getInitials(displayName)}
      </button>

      {isOpen && (
        <div
          data-id="user-menu-dropdown"
          style={{
            position: 'absolute', top: 48, right: 0, backgroundColor: 'white',
            borderRadius: 8, boxShadow: '0 4px 6px rgba(0,0,0,0.1)', minWidth: 200,
            zIndex: 1000, overflow: 'hidden',
          }}
        >
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#2d3748' }}>{displayName}</div>
            {email && <div style={{ fontSize: 12, color: '#718096', wordBreak: 'break-all' }}>{email}</div>}
          </div>
          {extraMenuItems}
          <button
            data-id="logout-button"
            onClick={onSignOut}
            style={{
              width: '100%', padding: '12px 16px', backgroundColor: 'transparent',
              border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: 14, color: '#2d3748',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f7fafc'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};
