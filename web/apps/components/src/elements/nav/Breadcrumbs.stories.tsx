import React from 'react';
import { Meta } from '@storybook/react';
import { action } from 'storybook/actions';
import Breadcrumbs from './Breadcrumbs';

type Args = {
  itemsCSV?: string;
  separator?: string;
  maxItems?: number;
};

const meta: Meta<Args> = {
  title: 'elements/nav/Breadcrumbs',
  tags: ['autodocs'],
  args: {
    itemsCSV: 'Home,Products,Clothing,Shirts',
    separator: '/',
    maxItems: undefined,
  },
  argTypes: {
    itemsCSV: { control: 'text' },
    separator: { control: 'text' },
    maxItems: { control: { type: 'number', min: 0 } },
  },
};

export default meta;

const toItems = (csv?: string) =>
  (csv || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((label, i) => ({ label, href: i < 3 ? `#/${label.toLowerCase()}` : undefined }));

export const Interactive = (args: Args) => {
  const items = toItems(args.itemsCSV);
  const sep = args.separator || '/';
  const handle = action('breadcrumb-click');
  // attach click handler to non-last
  const itemsWithClick = items.map((it, i) => ({
    ...it,
    onClick:
      i < items.length - 1
        ? (e: React.MouseEvent) => {
            e.preventDefault();
            handle(it.label);
          }
        : undefined,
  }));

  return <Breadcrumbs items={itemsWithClick} separator={sep} maxItems={args.maxItems} />;
};

export const Gallery = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    <div>
      <h4>Simple</h4>
      <Breadcrumbs
        items={[{ label: 'Home', href: '#' }, { label: 'Section', href: '#' }, { label: 'Page' }]}
      />
    </div>
    <div>
      <h4>Many items (collapses)</h4>
      <Breadcrumbs
        items={['Home', 'A', 'B', 'C', 'D', 'E'].map((l, i) => ({
          label: l,
          href: i < 5 ? '#' : undefined,
        }))}
        maxItems={4}
      />
    </div>
  </div>
);
