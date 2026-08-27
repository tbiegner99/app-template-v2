/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Meta } from '@storybook/react';
import {
  H1,
  H2,
  H3,
  H4,
  H5,
  H6,
  Title,
  Subtitle,
  SubtitleSmall,
  Body,
  BodySmall,
  Caption,
  Overline,
} from './TextElements';
import { FlexColumn } from '../containers';

const meta: Meta = {
  title: 'theme/Typography',
  tags: ['autodocs'],
  args: {
    decorationColor: '',
    decorationStyle: '',
    italic: false,
    bold: false,
    overline: false,
    underline: false,
    strike: false,
  },
  argTypes: {
    kind: {
      control: { type: 'select' },
      options: [
        'textElement',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'title',
        'subtitle',
        'subtitleSmall',
        'body',
        'bodySmall',
        'caption',
        'overline',
      ],
    },
    children: { control: 'text' },
    onClick: { action: 'clicked' },
  },
};

export default meta;

export const All = (args) => (
  <FlexColumn style={{ padding: 16 }}>
    <H1 {...args}>H1 Heading</H1>
    <H2 {...args}>H2 Heading</H2>
    <H3 {...args}>H3 Heading</H3>
    <H4 {...args}>H4 Heading</H4>
    <H5 {...args}>H5 Heading</H5>
    <H6 {...args}>H6 Heading</H6>
    <Title {...args}>Title</Title>
    <Subtitle {...args}>Subtitle</Subtitle>
    <SubtitleSmall {...args}>Subtitle Small</SubtitleSmall>
    <Body {...args}>Body text</Body>
    <BodySmall {...args}>Body Small</BodySmall>
    <Caption {...args}>Caption text</Caption>
    <Overline {...args}>Overline text</Overline>
  </FlexColumn>
);

const compMap: Record<string, any> = {
  h1: H1,
  h2: H2,
  h3: H3,
  h4: H4,
  h5: H5,
  h6: H6,
  title: Title,
  subtitle: Subtitle,
  subtitleSmall: SubtitleSmall,
  body: Body,
  bodySmall: BodySmall,
  caption: Caption,
  overline: Overline,
};

const Template = (args: any) => {
  const { kind = 'textElement', children, ...rest } = args;
  const C = compMap[kind];
  return (
    <FlexColumn style={{ padding: 16 }}>
      <C {...rest}>{children}</C>
    </FlexColumn>
  );
};

export const Interactive = Template.bind({});
Interactive.args = { kind: 'h1', children: 'Interactive heading' };
