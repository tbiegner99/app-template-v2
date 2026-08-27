import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';

export interface MenuSectionProps {
  title?: React.ReactNode;
  children?: React.ReactNode;
}
export const MenuDivider: React.FC = () => <Divider sx={{ my: 1 }} />;

export const MenuSection: React.FC<MenuSectionProps> = ({ title, children }) => {
  return (
    <Box component="section" sx={{ px: 1 }}>
      {title ? (
        <Box sx={{ px: 1, py: 0 }}>
          {typeof title === 'string' ? (
            <Typography variant="overline" component="div" sx={{ fontSize: 12 }}>
              {title}
            </Typography>
          ) : (
            title
          )}
        </Box>
      ) : null}
      <List dense>{children}</List>
    </Box>
  );
};

export default MenuSection;
