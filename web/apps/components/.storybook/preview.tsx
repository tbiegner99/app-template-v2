import React from 'react';
import type { Preview } from '@storybook/react';
import { ThemeProvider, ThemeMode } from '../src/context/ThemeProvider';

export const globalTypes = {
  theme: {
    name: 'Theme',
    description: 'Global theme for components',
    defaultValue: 'light',
    toolbar: {
      icon: 'circlehollow',
      items: [
        { value: 'light', icon: 'sun', title: 'Light' },
        { value: 'dark', icon: 'moon', title: 'Dark' },
      ],
      showName: true,
      dynamicTitle: true,
    },
  },
};

export const decorators = [
  (Story, context) => {
    const mode = context.globals.theme as ThemeMode;
    return (
      <ThemeProvider mode={mode}>
        <div style={{ padding: 16 }}>
          <Story />
        </div>
      </ThemeProvider>
    );
  },
];

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
  },
};

export default preview;
