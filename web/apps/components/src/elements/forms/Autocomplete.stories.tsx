import React from 'react';
import { Meta } from '@storybook/react';
import { action } from 'storybook/actions';
import Autocomplete from './Autocomplete';
import { Option } from './Autocomplete';

type Args = {
  optionsCSV?: string;
  multiple?: boolean;
  freeSolo?: boolean;
  disabled?: boolean;
  label?: string;
  placeholder?: string;
  value?: string;
};

const meta: Meta<Args> = {
  title: 'elements/forms/Autocomplete',
  tags: ['autodocs'],
  args: {
    optionsCSV: 'Apple,Banana,Cherry,Date,Elderberry',
    multiple: false,
    freeSolo: false,
    disabled: false,
    label: 'Fruit',
    placeholder: 'Choose a fruit',
    value: '',
  },
  argTypes: {
    optionsCSV: { control: 'text' },
    multiple: { control: 'boolean' },
    freeSolo: { control: 'boolean' },
    disabled: { control: 'boolean' },
    label: { control: 'text' },
    placeholder: { control: 'text' },
    value: { control: 'text' },
  },
};

export default meta;

const parse = (csv?: string) =>
  (csv || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

const toOptions = (arr: string[]) => arr.map((s) => ({ label: s, value: s }));

export const All = () => (
  <div style={{ display: 'flex', gap: 12, flexDirection: 'column' }}>
    <div>
      <h4>Default</h4>
      <Autocomplete options={toOptions(['One', 'Two', 'Three'])} label="Default" />
    </div>
    <div>
      <h4>Multiple</h4>
      <Autocomplete options={toOptions(['A', 'B', 'C'])} multiple label="Multiple" />
    </div>
    <div>
      <h4>Free solo</h4>
      <Autocomplete options={toOptions(['Red', 'Green'])} label="Free" />
    </div>
  </div>
);

export const Interactive = (args: Args) => {
  const opts = parse(args.optionsCSV);
  const options = toOptions(opts);
  const findSelected = (val?: string) => {
    if (!val) return args.multiple ? [] : null;
    const found = options.find((o) => o.value === val);
    return args.multiple ? (found ? [found] : []) : found || null;
  };

  const [value, setValue] = React.useState<Option | Option[] | null>(findSelected(args.value));
  React.useEffect(() => setValue(findSelected(args.value)), [args.value, args.multiple]);

  const handleChange = (v: Option | Option[] | null) => {
    setValue(v);
    action('change')(v);
  };

  return (
    <div style={{ padding: 12, maxWidth: 480 }}>
      <Autocomplete
        options={options}
        multiple={args.multiple}
        disabled={args.disabled}
        label={args.label}
        placeholder={args.placeholder}
        value={value}
        onChange={handleChange}
      />
    </div>
  );
};
