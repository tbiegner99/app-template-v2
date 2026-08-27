import React from 'react';
import { Meta } from '@storybook/react';
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import MailIcon from '@mui/icons-material/Mail';
import SideMenu from './SideMenu';
import MenuSection from './MenuSection';
import MenuItem from './MenuItem';
import AccordionMenu from './AccordionMenu';

const meta: Meta = {
  title: 'elements/nav/menu/SideMenu',
  tags: ['autodocs'],
};

export default meta;

export const Default = () => (
  <div style={{ display: 'flex' }}>
    <SideMenu title="__DISPLAY_NAME__">
      <MenuSection>
        <MenuItem label="Home" icon={<HomeIcon />} href="#/home" active />
        <MenuItem label="Messages" icon={<MailIcon />} href="#/messages" badge={3} />
      </MenuSection>

      <MenuSection title="Users">
        <AccordionMenu
          title="Directory"
          icon={<PeopleIcon />}
          items={[
            { label: 'All users', href: '#/users' },
            { label: 'Teams', href: '#/teams' },
          ]}
        />
        <MenuItem label="Settings" icon={<SettingsIcon />} href="#/settings" />
      </MenuSection>
    </SideMenu>
    <div style={{ padding: 24 }}>Main content area</div>
  </div>
);
