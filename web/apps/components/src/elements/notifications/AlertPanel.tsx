import React from 'react';

export interface Alert {
  id: string;
  title: string;
  body: string;
  route?: string;
}

export interface AlertPanelProps {
  alerts: Alert[];
  onDismiss?: (id: string) => void;
  onDismissAll?: () => void;
  onNavigate?: (route: string) => void;
}

export const AlertPanel: React.FC<AlertPanelProps> = ({ alerts, onDismiss, onDismissAll, onNavigate }) => {
  return (
    <div style={{ minWidth: 320, maxWidth: 480, backgroundColor: 'white', borderRadius: 8, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontWeight: 600, fontSize: 15, color: '#2d3748' }}>Alerts</span>
        {alerts.length > 0 && onDismissAll && (
          <button onClick={onDismissAll} style={{ background: 'none', border: 'none', color: '#667eea', cursor: 'pointer', fontSize: 13 }}>
            Dismiss all
          </button>
        )}
      </div>
      {alerts.length === 0 ? (
        <div style={{ padding: 24, textAlign: 'center', color: '#a0aec0', fontSize: 14 }}>No active alerts</div>
      ) : (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, maxHeight: 360, overflowY: 'auto' }}>
          {alerts.map((alert, i) => (
            <li
              key={alert.id}
              style={{ padding: '12px 16px', borderBottom: i < alerts.length - 1 ? '1px solid #e2e8f0' : 'none', display: 'flex', alignItems: 'flex-start', gap: 8 }}
            >
              <div
                style={{ flex: 1, cursor: alert.route ? 'pointer' : 'default' }}
                onClick={() => alert.route && onNavigate?.(alert.route)}
              >
                <div style={{ fontWeight: 600, fontSize: 14, color: '#2d3748' }}>{alert.title}</div>
                <div style={{ fontSize: 13, color: '#718096', marginTop: 2 }}>{alert.body}</div>
              </div>
              {onDismiss && (
                <button
                  onClick={() => onDismiss(alert.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a0aec0', fontSize: 16, padding: 0, lineHeight: 1 }}
                  aria-label="Dismiss"
                >
                  ×
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
