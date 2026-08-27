import React from 'react';
import { Meta } from '@storybook/react';
import { fn } from 'storybook/test';
import {
  ChipProps,
  PrimaryChip,
  SecondaryChip,
  SuccessChip,
  DestructiveChip,
  WarningChip,
  InfoChip,
} from './Chip';

type Args = {
  label?: string;
  size?: NonNullable<ChipProps['size']>;
  clickable?: boolean;
  deletable?: boolean;
};

const meta: Meta<Args> = {
  title: 'elements/containers/Chip',
  tags: ['autodocs'],
  args: {
    label: 'Example',
    size: 'medium',
    clickable: true,
    deletable: false,
    variant: 'filled',
  },
  argTypes: {
    label: { control: 'text' },
    variant: {
      control: { type: 'radio' },
      options: ['filled', 'outlined'],
    },
    size: { control: { type: 'radio' }, options: ['small', 'medium'] },
    clickable: { control: 'boolean' },
    deletable: { control: 'boolean' },
  },
};

export default meta;

export const All = (args) => (
  <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
    <PrimaryChip {...args} label="Primary" />
    <SecondaryChip {...args} label="Secondary" />
    <SuccessChip {...args} label="Success" />
    <DestructiveChip {...args} label="Destructive" />
    <WarningChip {...args} label="Warning" />
    <InfoChip {...args} label="Info" />
  </div>
);

export const Interactive = (args: Args) => {
  const handleClick = args.clickable ? fn() : undefined;
  const handleDelete = args.deletable ? fn() : undefined;

  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <PrimaryChip {...args} onClick={handleClick} onDelete={handleDelete} />
    </div>
  );
};
