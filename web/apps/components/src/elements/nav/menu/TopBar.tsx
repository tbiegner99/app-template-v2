import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Badge from '@mui/material/Badge';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MenuIcon from '@mui/icons-material/Menu';

export interface TopBarProps {
  title?: React.ReactNode;
  onMenuClick?: () => void;
  sticky?: boolean;
  rightActions?: React.ReactNode;
}

export const TopBar: React.FC<TopBarProps> = ({ title, onMenuClick, rightActions, sticky }) => {
  return (
    <AppBar position={sticky ? 'sticky' : 'static'} elevation={0}>
      <Toolbar sx={{ minHeight: 56 }}>
        {onMenuClick ? (
          <IconButton edge="start" color="inherit" onClick={onMenuClick} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
        ) : null}

        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {title}
        </Typography>

        {rightActions ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 1 }}>{rightActions}</Box>
        ) : (
          <IconButton color="inherit" sx={{ mr: 1 }}>
            <Badge color="error" variant="dot">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
