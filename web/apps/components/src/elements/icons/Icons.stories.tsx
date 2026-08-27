import React from 'react';
import { Meta } from '@storybook/react';
import * as Icons from './Icons';

type IconsArgs = {
  size?: number;
  color?: string;
};

const meta: Meta<IconsArgs> = {
  title: 'theme/Icons',
  tags: ['autodocs'],
  args: {
    size: 50,
    color: '#000000',
  },
  argTypes: {
    size: { control: { type: 'number', min: 8, max: 256, step: 1 } },
    color: { control: 'color' },
  },
};

export default meta;

export const All = (args: IconsArgs) => (
  <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
    {Object.keys(Icons).map((k) => {
      const Icon = Icons[k];
      return (
        <div
          key={k}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Icon sx={{ fontSize: args.size, color: args.color }} />
          <div style={{ fontSize: 12 }}>{k}</div>
        </div>
      );
    })}
  </div>
);
