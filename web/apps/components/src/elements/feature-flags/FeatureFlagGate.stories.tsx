import type { Meta, StoryObj } from '@storybook/react';
import { FeatureFlagGate } from './FeatureFlagGate';
import { FeatureFlagProvider } from './FeatureFlagProvider';

const meta: Meta<typeof FeatureFlagGate> = {
  title: 'Elements/FeatureFlags/FeatureFlagGate',
  component: FeatureFlagGate,
  decorators: [
    (Story, ctx) => (
      <FeatureFlagProvider flags={ctx.args['_flags'] ?? { 'my-feature': true }}>
        <Story />
      </FeatureFlagProvider>
    ),
  ],
  parameters: { layout: 'centered' },
};
export default meta;
type Story = StoryObj<typeof FeatureFlagGate>;

export const Enabled: Story = {
  decorators: [
    (Story) => (
      <FeatureFlagProvider flags={{ 'my-feature': true }}>
        <Story />
      </FeatureFlagProvider>
    ),
  ],
  args: {
    flag: 'my-feature',
    children: <div style={{ padding: 16, background: '#c6f6d5', borderRadius: 4 }}>Feature is enabled</div>,
    fallback: <div style={{ padding: 16, background: '#fed7d7', borderRadius: 4 }}>Feature is disabled</div>,
  },
};

export const Disabled: Story = {
  decorators: [
    (Story) => (
      <FeatureFlagProvider flags={{ 'my-feature': false }}>
        <Story />
      </FeatureFlagProvider>
    ),
  ],
  args: {
    flag: 'my-feature',
    children: <div style={{ padding: 16, background: '#c6f6d5', borderRadius: 4 }}>Feature is enabled</div>,
    fallback: <div style={{ padding: 16, background: '#fed7d7', borderRadius: 4 }}>Feature is disabled</div>,
  },
};
