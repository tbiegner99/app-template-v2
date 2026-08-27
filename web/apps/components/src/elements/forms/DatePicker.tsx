import React from 'react';
import { Dayjs } from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker as MUIDatePicker } from '@mui/x-date-pickers/DatePicker';
import { FormElementProps } from './Form';
import { useFormElement } from './useFormElement';
import { FlexRow } from '../containers';
import { useTheme } from '../../context';
// Use two individual MUI DatePickers for range selection instead of the RangePicker

export interface DatePickerProps extends FormElementProps<Dayjs | null> {
  label?: string;
  minDate?: Dayjs | null;
  maxDate?: Dayjs | null;
  disabled?: boolean;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value = null,
  onChange,
  validationRules,
  label,
  name,
  minDate,
  maxDate,
  disabled = false,
}) => {
  const formElement = useFormElement<Dayjs | null>({
    onChange,
    value,
    name,
    validationRules,
  });
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={undefined}>
      <MUIDatePicker
        value={formElement.value}
        onChange={(d) => formElement.onChange?.(d ?? null)}
        label={label}
        minDate={minDate ?? undefined}
        maxDate={maxDate ?? undefined}
        disabled={disabled}
        slotProps={{
          textField: {
            InputLabelProps: { shrink: true },
            error: formElement.shouldShowError,
            helperText: formElement.shouldShowError ? formElement.errorMessage : undefined,
          },
        }}
      />
    </LocalizationProvider>
  );
};

export interface DateRange {
  start: Dayjs | null;
  end: Dayjs | null;
}

export interface DateRangePickerProps extends FormElementProps<DateRange> {
  minDate?: Dayjs | null;
  maxDate?: Dayjs | null;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value,
  onChange,
  name,
  validationRules,
  minDate,
  maxDate,
}) => {
  const formElement = useFormElement<DateRange>({
    onChange,
    value,
    name,
    validationRules,
  });
  const { getSpacing } = useTheme();
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={undefined}>
      <FlexRow gap={getSpacing(2)} align="center">
        <MUIDatePicker
          label="Start"
          value={formElement.value?.start ?? null}
          onChange={(s) => {
            if (!s)
              return formElement.onChange?.({ start: null, end: formElement.value?.end ?? null });
            let ns = s;
            if (minDate && ns.isBefore(minDate, 'day')) ns = minDate;
            if (maxDate && ns.isAfter(maxDate, 'day')) ns = maxDate;
            let ne = formElement.value?.end ?? null;
            if (ne && ns.isAfter(ne, 'day')) {
              ne = ns;
            }
            formElement.onChange?.({ start: ns ?? null, end: ne ?? null });
          }}
          minDate={minDate ?? undefined}
          maxDate={maxDate ?? undefined}
          slotProps={{
            textField: {
              InputLabelProps: { shrink: true },
              error: formElement.shouldShowError,
              helperText: formElement.shouldShowError ? formElement.errorMessage : undefined,
            },
          }}
        />

        <div style={{ paddingBottom: 8 }}>—</div>

        <MUIDatePicker
          label="End"
          value={formElement.value?.end ?? null}
          onChange={(e) => {
            if (!e)
              return formElement.onChange?.({ start: formElement.value?.start ?? null, end: null });
            let ne = e;
            if (minDate && ne.isBefore(minDate, 'day')) ne = minDate;
            if (maxDate && ne.isAfter(maxDate, 'day')) ne = maxDate;
            let ns = formElement.value?.start ?? null;
            if (ns && ne.isBefore(ns, 'day')) {
              ns = ne;
            }
            formElement.onChange?.({ start: ns ?? null, end: ne ?? null });
          }}
          minDate={minDate ?? undefined}
          maxDate={maxDate ?? undefined}
          slotProps={{
            textField: {
              InputLabelProps: { shrink: true },
              error: formElement.shouldShowError,
              helperText: formElement.shouldShowError ? formElement.errorMessage : undefined,
            },
          }}
        />
      </FlexRow>
    </LocalizationProvider>
  );
};

export default DatePicker;
