import type { Meta, StoryObj } from '@storybook/react';
import { AlertPanel } from './AlertPanel';

const meta: Meta<typeof AlertPanel> = {
  title: 'Elements/Notifications/AlertPanel',
  component: AlertPanel,
  parameters: { layout: 'centered' },
};
export default meta;
type Story = StoryObj<typeof AlertPanel>;

const sampleAlerts = [
  { id: '1', title: 'Gas leak detected', body: 'Section B, Level 3 — immediate evacuation required', route: '/alerts/1' },
  { id: '2', title: 'Equipment overdue', body: 'Drill #4 inspection overdue by 2 days' },
  { id: '3', title: 'Worker SOS', body: 'Thomas B. triggered SOS at coordinates 45.2, -73.1', route: '/alerts/3' },
];

export const WithAlerts: Story = {
  args: {
    alerts: sampleAlerts,
    onDismiss: (id) => console.log('Dismiss', id),
    onDismissAll: () => console.log('Dismiss all'),
    onNavigate: (route) => console.log('Navigate to', route),
  },
};

export const Empty: Story = {
  args: {
    alerts: [],
    onDismissAll: () => console.log('Dismiss all'),
  },
};
