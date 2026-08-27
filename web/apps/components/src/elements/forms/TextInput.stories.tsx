import React from 'react';
import { Meta } from '@storybook/react';
import TextInput from './TextInput';
import { action } from 'storybook/actions';
import { FlexColumn } from '../containers';

type Args = {
  value?: string;
  placeholder?: string;
  label?: string;
  size?: 'small' | 'medium';
  disabled?: boolean;
  fullWidth?: boolean;
  type?: 'text' | 'password' | 'email';
};

const meta: Meta<Args> = {
  title: 'elements/forms/TextInput',
  tags: ['autodocs'],
  args: {
    value: '',
    placeholder: 'Type here',
    label: 'Name',
    size: 'medium',
    disabled: false,
    fullWidth: false,
    type: 'text',
  },
  argTypes: {
    value: { control: 'text' },
    placeholder: { control: 'text' },
    label: { control: 'text' },
    size: { control: { type: 'inline-radio', options: ['small', 'medium'] } },
    disabled: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
    type: {
      control: { type: 'inline-radio', options: ['text', 'password', 'email'] },
    },
  },
};

export default meta;

export const All = () => (
  <FlexColumn gap={12}>
    <TextInput label="Default" placeholder="Placeholder" />
    <TextInput label="Small" size="small" placeholder="Small" />
    <TextInput label="Disabled" disabled placeholder="Can't type" />
  </FlexColumn>
);

export const Interactive = (args: Args) => {
  const [value, setValue] = React.useState(args.value ?? '');
  React.useEffect(() => setValue(args.value ?? ''), [args.value]);

  const handleChange = (v: string) => {
    setValue(v);
    action('change')(v);
  };

  return (
    <div style={{ padding: 12, maxWidth: args.fullWidth ? '100%' : 360 }}>
      <TextInput
        value={value}
        placeholder={args.placeholder}
        label={args.label}
        size={args.size}
        disabled={args.disabled}
        type={args.type}
        onChange={handleChange}
      />
    </div>
  );
};
