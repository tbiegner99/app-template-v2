import React from 'react';
import { Meta } from '@storybook/react';
import dayjs from 'dayjs';
import DatePicker, { DateRangePicker } from './DatePicker';

type Args = {
  value?: string;
  minDate?: string;
  maxDate?: string;
};

const meta: Meta<Args> = {
  title: 'elements/forms/DatePicker',
  tags: ['autodocs'],
  args: {
    value: dayjs().format('YYYY-MM-DD'),
    minDate: undefined,
    maxDate: undefined,
  },
  argTypes: {
    value: { control: 'text' },
    minDate: { control: 'text' },
    maxDate: { control: 'text' },
  },
};

export default meta;

export const Single = (args: Args) => {
  const [value, setValue] = React.useState(dayjs(args.value));
  return (
    <div style={{ padding: 12 }}>
      <DatePicker
        value={value}
        onChange={(d) => setValue(d ?? null)}
        minDate={args.minDate ? dayjs(args.minDate) : undefined}
        maxDate={args.maxDate ? dayjs(args.maxDate) : undefined}
      />
      <div style={{ marginTop: 12 }}>Selected: {value ? value.format('YYYY-MM-DD') : 'none'}</div>
    </div>
  );
};

export const Range = (args: Args) => {
  const [start, setStart] = React.useState(dayjs());
  const [end, setEnd] = React.useState(dayjs().add(3, 'day'));
  return (
    <div style={{ padding: 12 }}>
      <DateRangePicker
        start={start}
        end={end}
        onChange={(r) => {
          setStart(r.start ?? null);
          setEnd(r.end ?? null);
        }}
        minDate={args.minDate ? dayjs(args.minDate) : undefined}
        maxDate={args.maxDate ? dayjs(args.maxDate) : undefined}
      />
      <div style={{ marginTop: 12 }}>
        Selected: {start ? start.format('YYYY-MM-DD') : 'none'} —{' '}
        {end ? end.format('YYYY-MM-DD') : 'none'}
      </div>
    </div>
  );
};
