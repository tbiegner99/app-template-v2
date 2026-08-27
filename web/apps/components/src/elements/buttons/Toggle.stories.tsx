import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { Toggle } from './Toggle';

const meta: Meta<typeof Toggle> = {
  title: 'elements/buttons/Toggle',
  component: Toggle,
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    helperText: { control: 'text' },
    value: { control: 'boolean' },
    disabled: { control: 'boolean' },
    size: { control: 'radio', options: ['small', 'medium'] },
    labelPlacement: { control: 'radio', options: ['start', 'end', 'top', 'bottom'] },
  },
};

export default meta;
type Story = StoryObj<typeof Toggle>;

export const All = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
    <Toggle label="Off" value={false} />
    <Toggle label="On" value={true} />
    <Toggle label="Small off" value={false} size="small" />
    <Toggle label="Small on" value={true} size="small" />
    <Toggle label="With helper text" value={true} helperText="This setting affects all users" />
    <Toggle label="Disabled off" value={false} disabled />
    <Toggle label="Disabled on" value={true} disabled />
    <Toggle label="Label start" value={true} labelPlacement="start" />
  </div>
);

export const Interactive: Story = {
  args: {
    label: 'Enable feature',
    value: false,
    helperText: 'Toggle to enable or disable this feature',
    disabled: false,
    size: 'medium',
    labelPlacement: 'end',
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
      <Toggle label="Medium" value={true} size="medium" />
      <Toggle label="Small" value={true} size="small" />
    </div>
  ),
};

export const LabelPlacements: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 32, alignItems: 'center', flexWrap: 'wrap' }}>
      <Toggle label="End (default)" value={true} labelPlacement="end" />
      <Toggle label="Start" value={true} labelPlacement="start" />
      <Toggle label="Top" value={true} labelPlacement="top" />
      <Toggle label="Bottom" value={true} labelPlacement="bottom" />
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
      <Toggle label="Off" value={false} />
      <Toggle label="On" value={true} />
      <Toggle label="Disabled off" value={false} disabled />
      <Toggle label="Disabled on" value={true} disabled />
      <Toggle label="With helper" value={true} helperText="Helper text" />
    </div>
  ),
};
