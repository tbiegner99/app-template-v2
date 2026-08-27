import type { Meta, StoryObj } from '@storybook/react';
import { UserMenu } from './UserMenu';

const meta: Meta<typeof UserMenu> = {
  title: 'Elements/Auth/UserMenu',
  component: UserMenu,
  parameters: { layout: 'centered' },
};
export default meta;
type Story = StoryObj<typeof UserMenu>;

export const Default: Story = {
  args: {
    displayName: 'Thomas Biegner',
    email: 'tbiegner99@gmail.com',
    onSignOut: () => alert('Sign out clicked'),
  },
};

export const NoEmail: Story = {
  args: {
    displayName: 'Jane Smith',
    onSignOut: () => alert('Sign out clicked'),
  },
};

export const WithExtraItems: Story = {
  args: {
    displayName: 'Thomas Biegner',
    email: 'tbiegner99@gmail.com',
    onSignOut: () => alert('Sign out clicked'),
    extraMenuItems: (
      <button
        style={{ width: '100%', padding: '12px 16px', backgroundColor: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: 14, color: '#2d3748' }}
      >
        My Profile
      </button>
    ),
  },
};
