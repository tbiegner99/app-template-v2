import React from 'react';
import { Meta } from '@storybook/react';
import { FlexRow, FlexColumn, FlexProps } from './Flex';

type Args = {
  gap?: number | string;
  align?: NonNullable<FlexProps['align']> | undefined;
  justify?: NonNullable<FlexProps['justify']> | undefined;
  wrap?: boolean;
  grow?: boolean;
  shrink?: boolean;
  basis?: string | number;
};

const meta: Meta<Args> = {
  title: 'elements/containers/Flex',
  tags: ['autodocs'],
  args: {
    gap: 12,
    align: 'center',
    justify: 'start',
    wrap: false,
    grow: false,
    shrink: false,
    basis: undefined,
  },
  argTypes: {
    gap: { control: { type: 'number', min: 0, step: 1 } },
    align: {
      control: { type: 'radio' },
      options: ['start', 'center', 'end', 'stretch', 'baseline'],
    },
    justify: {
      control: { type: 'radio' },
      options: ['start', 'center', 'end', 'between', 'around', 'evenly'],
    },
    wrap: { control: 'boolean' },
    grow: { control: 'boolean' },
    shrink: { control: 'boolean' },
    basis: { control: 'text' },
  },
};

export default meta;

const Box = ({ children, height }: { children: React.ReactNode; height?: number }) => (
  <div
    style={{
      padding: 12,
      height: height,
      background: '#f3f4f6',
      border: '1px solid #e5e7eb',
      borderRadius: 6,
      minWidth: 80,
      textAlign: 'center',
    }}
  >
    {children}
  </div>
);

export const Row = (args: Args) => (
  <FlexRow {...args} style={{ padding: 12, border: '1px dashed #ddd' }}>
    <Box>Item 1</Box>
    <Box height={100}>Item 2</Box>
    <Box>Item 3</Box>
  </FlexRow>
);

export const Column = (args: Args) => (
  <FlexColumn {...args} style={{ padding: 12, border: '1px dashed #ddd', width: 240, height: 600 }}>
    <Box>Item A</Box>
    <Box>Item B</Box>
    <Box>Item C</Box>
  </FlexColumn>
);

export const Gallery = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
    <div>
      <h4>Row examples</h4>
      <FlexRow gap={8}>
        <Box>1</Box>
        <Box>2</Box>
        <Box>3</Box>
      </FlexRow>
    </div>
    <div>
      <h4>Wrapped row</h4>
      <FlexRow gap={8} wrap>
        <Box>Long item</Box>
        <Box>2</Box>
        <Box>3</Box>
      </FlexRow>
    </div>
    <div>
      <h4>Column example</h4>
      <FlexColumn gap={8}>
        <Box>Top</Box>
        <Box>Middle</Box>
        <Box>Bottom</Box>
      </FlexColumn>
    </div>
  </div>
);
