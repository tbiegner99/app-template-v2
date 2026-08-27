import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { Section, SectionVariant, SectionElevation } from './Section';
import { Elevation } from '../../theme/Palette';

const numberControl = { control: { type: 'number' as const, min: 0, step: 1 } };

const meta: Meta<typeof Section> = {
  title: 'elements/containers/Section',
  component: Section,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['main', 'variant', 'primary', 'secondary', 'error'] satisfies SectionVariant[],
    },
    elevation: {
      control: { type: 'select' },
      options: Object.keys(Elevation) as SectionElevation[],
    },
    padding: numberControl,
    paddingX: numberControl,
    paddingY: numberControl,
    margin: numberControl,
    marginX: numberControl,
    marginY: numberControl,
    children: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Section>;

export const All = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
    <Section variant="main" padding={4}>main — surface</Section>
    <Section variant="variant" padding={4}>variant — surface variant</Section>
    <Section variant="primary" padding={4}>primary</Section>
    <Section variant="secondary" padding={4}>secondary</Section>
    <Section variant="error" padding={4}>error</Section>
    <Section variant="main" padding={4} elevation="low">main — elevation low</Section>
    <Section variant="variant" padding={4} elevation="high">variant — elevation high</Section>
    <Section variant="main" paddingX={8} paddingY={2}>asymmetric padding (x=8, y=2)</Section>
    <Section variant="secondary" padding={4} margin={4}>with margin=4</Section>
  </div>
);

export const ElevationScale: Story = {
  args: {
    variant: 'main',
    padding: 4,
  },
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {(Object.keys(Elevation) as SectionElevation[]).map((level) => (
        <Section key={level} {...args} elevation={level}>
          elevation="{level}"
        </Section>
      ))}
    </div>
  ),
};

export const Interactive: Story = {
  args: {
    variant: 'main',
    children: 'Section content',
    padding: 4,
  },
};
