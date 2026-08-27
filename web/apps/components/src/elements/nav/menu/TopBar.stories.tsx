import React from 'react';
import { Meta } from '@storybook/react';
import { action } from 'storybook/actions';
import IconButton from '@mui/material/IconButton';
import NotificationsIcon from '@mui/icons-material/Notifications';
import TopBar from './TopBar';
import AvatarMenuItem from './AvatarMenuItem';

const meta: Meta = {
  title: 'elements/nav/TopBar',
  tags: ['autodocs'],
};

export default meta;

export const Default = () => (
  <TopBar
    title="__DISPLAY_NAME__"
    onMenuClick={action('menu-click')}
    rightActions={[
      <IconButton key="notifications" color="inherit">
        <NotificationsIcon />
      </IconButton>,
      <AvatarMenuItem
        key="avatar-menu"
        name="TJ"
        menuItems={[
          { label: 'Profile', onClick: action('profile') },
          { label: 'Logout', onClick: action('logout') },
        ]}
      />,
    ]}
  />
);
