import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { action } from 'storybook/actions';
import { Card, CardElevation } from './Card';
import { Elevation } from '../../theme/Palette';

const meta: Meta<typeof Card> = {
  title: 'elements/containers/Card',
  component: Card,
  tags: ['autodocs'],
  argTypes: {
    children: { control: 'text' },
    margin: { control: { type: 'number', min: 0, step: 1 } },
    elevation: {
      control: { type: 'select' },
      options: Object.keys(Elevation) as CardElevation[],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const All = () => (
  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
    {(Object.keys(Elevation) as CardElevation[]).map((level) => (
      <Card key={level} elevation={level}>elevation="{level}"</Card>
    ))}
  </div>
);

export const Interactive: Story = {
  args: {
    children: 'This is a card',
    margin: 3,
    elevation: 'low',
  },
  render: (args) => (
    <div style={{ padding: 16 }}>
      <Card {...args} sx={{ cursor: 'pointer' }} onClick={action('card-click')} />
    </div>
  ),
};
