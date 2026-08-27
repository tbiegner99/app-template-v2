import React from 'react';
import { Meta } from '@storybook/react';
import { Grid, GridItem } from './Grid';

type Args = {
  templateColumns?: string | number;
  templateRows?: string | number;
  gap?: number | string;
  rowGap?: number | string;
  columnGap?: number | string;
  areas?: string;
};

const meta: Meta<Args> = {
  title: 'elements/containers/Grid',
  tags: ['autodocs'],
  args: {
    templateColumns: 'repeat(3, 1fr)',
    gap: 12,
    areas: 'header header header\nsidebar main main\nfooter footer footer',
  },
  argTypes: {
    templateColumns: { control: 'text' },
    templateRows: { control: 'text' },
    gap: { control: 'number' },
    rowGap: { control: 'number' },
    columnGap: { control: 'number' },
    areas: { control: 'text' },
  },
};

export default meta;

const Box = ({ children }: { children: React.ReactNode }) => (
  <div style={{ padding: 12, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 4 }}>
    {children}
  </div>
);

export const Gallery = () => (
  <div style={{ display: 'flex', gap: 24, flexDirection: 'column' }}>
    <div>
      <h4>Simple columns</h4>
      <Grid templateColumns={3} gap={12}>
        <GridItem><Box>1</Box></GridItem>
        <GridItem><Box>2</Box></GridItem>
        <GridItem><Box>3</Box></GridItem>
      </Grid>
    </div>

    <div>
      <h4>Explicit columns</h4>
      <Grid templateColumns="200px 1fr" gap={12}>
        <GridItem><Box>Fixed</Box></GridItem>
        <GridItem><Box>Flexible</Box></GridItem>
      </Grid>
    </div>
  </div>
);

export const Areas = (args: Args) => {
  const areas = args.areas ? args.areas.split('\n').map((r) => r.trim()) : undefined;
  return (
    <div style={{ padding: 12 }}>
      <Grid templateColumns={args.templateColumns as any} gap={args.gap} areas={areas}>
        <GridItem area="header"><Box>Header</Box></GridItem>
        <GridItem area="sidebar"><Box>Sidebar</Box></GridItem>
        <GridItem area="main"><Box>Main</Box></GridItem>
        <GridItem area="footer"><Box>Footer</Box></GridItem>
      </Grid>
    </div>
  );
};

export const Interactive = (args: Args) => {
  const areas = args.areas ? args.areas.split('\n').map((r) => r.trim()) : undefined;
  return (
    <div style={{ padding: 12 }}>
      <Grid
        templateColumns={args.templateColumns as any}
        templateRows={args.templateRows as any}
        gap={args.gap}
        rowGap={args.rowGap}
        columnGap={args.columnGap}
        areas={areas}
      >
        <GridItem style={{ minHeight: 48 }}><Box>Item A</Box></GridItem>
        <GridItem style={{ minHeight: 48 }}><Box>Item B</Box></GridItem>
        <GridItem style={{ minHeight: 48 }}><Box>Item C</Box></GridItem>
        <GridItem style={{ minHeight: 48 }}><Box>Item D</Box></GridItem>
      </Grid>
    </div>
  );
};
