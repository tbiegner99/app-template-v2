import React, { useState } from 'react';
import { Meta } from '@storybook/react';
import TiptapEditor from './TiptapEditor';

const meta: Meta = {
  title: 'elements/forms/Wysiwig/TiptapEditor',
  tags: ['autodocs'],
};

export default meta;

export const Default = () => {
  const [html, setHtml] = useState('<p>Hello <strong>world</strong></p>');
  return (
    <div style={{ padding: 16 }}>
      <TiptapEditor value={html} onChange={(h) => setHtml(h)} placeholder="Write something..." />
      <div style={{ marginTop: 16 }}>
        <h4>Output</h4>
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  );
};
