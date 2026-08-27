import type { Meta, StoryObj } from '@storybook/react';
import { AlertBadge } from './AlertBadge';

const meta: Meta<typeof AlertBadge> = {
  title: 'Elements/Notifications/AlertBadge',
  component: AlertBadge,
  parameters: { layout: 'centered' },
};
export default meta;
type Story = StoryObj<typeof AlertBadge>;

export const WithCount: Story = {
  args: {
    count: 3,
    children: <button style={{ padding: '8px 16px', fontSize: 14 }}>Alerts</button>,
  },
};

export const HighCount: Story = {
  args: {
    count: 105,
    children: <button style={{ padding: '8px 16px', fontSize: 14 }}>Alerts</button>,
  },
};

export const ZeroCount: Story = {
  args: {
    count: 0,
    children: <button style={{ padding: '8px 16px', fontSize: 14 }}>Alerts</button>,
  },
};
