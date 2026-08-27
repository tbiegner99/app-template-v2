import React, { useState } from 'react';
import { Meta } from '@storybook/react';
import { Tabs } from './Tabs';

const meta: Meta = {
  title: 'elements/containers/Tabs',
  tags: ['autodocs'],
};

export default meta;

export const Basic = () => {
  const [value, setValue] = useState('one');
  const items = [
    { key: 'one', label: 'One', content: <div>Content One</div> },
    { key: 'two', label: 'Two', content: <div>Content Two</div> },
    { key: 'three', label: 'Three', content: <div>Content Three</div> },
  ];
  return <Tabs items={items} value={value} onChange={(k) => setValue(k)} />;
};

export const Centered = () => {
  const [value, setValue] = useState('one');
  const items = [
    { key: 'one', label: 'One', content: <div>Content One</div> },
    { key: 'two', label: 'Two', content: <div>Content Two</div> },
  ];
  return <Tabs items={items} value={value} onChange={(k) => setValue(k)} centered variant="fullWidth" />;
};
