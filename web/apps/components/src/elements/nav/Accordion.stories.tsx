import React from 'react';
import { Meta } from '@storybook/react';
import Accordion from './Accordion';

type Args = {
  summary?: string;
  defaultExpanded?: boolean;
};

const meta: Meta<Args> = {
  title: 'elements/nav/Accordion',
  tags: ['autodocs'],
  args: {
    summary: 'More details',
    defaultExpanded: false,
  },
  argTypes: {
    summary: { control: 'text' },
    defaultExpanded: { control: 'boolean' },
  },
};

export default meta;

export const Interactive = (args: Args) => (
  <Accordion summary={args.summary} defaultExpanded={args.defaultExpanded}>
    <div style={{ padding: 8 }}>This is the accordion content.</div>
  </Accordion>
);

export const Gallery = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
    <Accordion summary="Item One">Content for item one</Accordion>
    <Accordion summary="Item Two" defaultExpanded>
      Expanded content for item two
    </Accordion>
    <Accordion summary={<span style={{ fontWeight: 600 }}>Custom Summary</span>}>
      Content with a custom summary node
    </Accordion>
  </div>
);
