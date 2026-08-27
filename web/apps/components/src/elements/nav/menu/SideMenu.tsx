import React from 'react';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import { H6 } from '../../typography';

export interface SideMenuProps {
  width?: number;
  open?: boolean;
  children?: React.ReactNode;
  title?: React.ReactNode;
}

export const SideMenu: React.FC<SideMenuProps> = ({
  width = 240,
  open = true,
  children,
  title,
}) => {
  return (
    <Drawer
      variant="permanent"
      open={open}
      PaperProps={{
        sx: (theme) => ({
          width,
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.secondary.main,
          borderRight: 'none',
        }),
      }}
    >
      <Toolbar sx={{ px: 0 }}>
        <Box>{title ? typeof title === 'string' ? <H6 style={{ color: 'inherit' }}>{title}</H6> : title : null}</Box>
      </Toolbar>
      <Box sx={{ overflow: 'auto' }}>{children}</Box>
    </Drawer>
  );
};

export default SideMenu;
