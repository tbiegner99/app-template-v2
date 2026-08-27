import React from 'react';
import MuiTabs from '@mui/material/Tabs';
import MuiTab from '@mui/material/Tab';
import Box from '@mui/material/Box';

export interface TabItem {
  key: string;
  label: React.ReactNode;
  content?: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  value?: string;
  onChange?: (key: string) => void;
  items: TabItem[];
  centered?: boolean;
  variant?: 'standard' | 'scrollable' | 'fullWidth';
}

export const Tabs: React.FC<TabsProps> = ({ value, onChange, items, centered = false, variant = 'standard' }) => {
  const handleChange = (_: React.SyntheticEvent, newValue: string) => {
    onChange?.(newValue);
  };

  const selected = value ?? (items.length > 0 ? items[0].key : '');

  return (
    <Box>
      <MuiTabs value={selected} onChange={handleChange} centered={centered} variant={variant} aria-label="tabs">
        {items.map((it) => (
          <MuiTab key={it.key} label={it.label} value={it.key} disabled={it.disabled} />
        ))}
      </MuiTabs>
      <Box sx={{ mt: 2 }}>
        {items.map((it) => (
          <div key={it.key} role="tabpanel" hidden={selected !== it.key} aria-hidden={selected !== it.key}>
            {selected === it.key ? it.content : null}
          </div>
        ))}
      </Box>
    </Box>
  );
};

export default Tabs;
