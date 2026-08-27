import type { Meta, StoryObj } from '@storybook/react';
import { RequireRoles } from './RequireRoles';

const meta: Meta<typeof RequireRoles> = {
  title: 'Elements/Auth/RequireRoles',
  component: RequireRoles,
};
export default meta;
type Story = StoryObj<typeof RequireRoles>;

export const AccessGranted: Story = {
  args: {
    userRoles: ['admin'],
    requiredRoles: ['admin'],
    children: <div style={{ padding: 16, background: '#c6f6d5', borderRadius: 4 }}>Protected content visible</div>,
    accessDeniedComponent: <div style={{ padding: 16, background: '#fed7d7', borderRadius: 4 }}>Access denied</div>,
  },
};

export const AccessDenied: Story = {
  args: {
    userRoles: ['viewer'],
    requiredRoles: ['admin'],
    children: <div style={{ padding: 16, background: '#c6f6d5', borderRadius: 4 }}>Protected content visible</div>,
    accessDeniedComponent: <div style={{ padding: 16, background: '#fed7d7', borderRadius: 4 }}>Access denied</div>,
  },
};

export const WithContextId: Story = {
  args: {
    userRoles: [{ name: 'manager', contextId: 'site-123' }],
    requiredRoles: [{ name: 'manager', contextId: 'site-123' }],
    children: <div style={{ padding: 16, background: '#c6f6d5', borderRadius: 4 }}>Site 123 manager</div>,
    accessDeniedComponent: <div style={{ padding: 16, background: '#fed7d7', borderRadius: 4 }}>Wrong site</div>,
  },
};
