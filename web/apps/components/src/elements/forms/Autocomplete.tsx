import React from 'react';
import MuiAutocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { FormElementProps } from './Form';
import { useFormElement } from './useFormElement';

export interface AutocompleteProps extends FormElementProps<Option | Option[] | null> {
  options: Option[];
  value?: Option | Option[] | null;
  multiple?: boolean;
  label?: string;
  disabled?: boolean;
  placeholder?: string;
  isLoading?: boolean;
  /** size controls the input height — 'small' or 'medium' */
  size?: 'small' | 'medium';
  onChange?: (value: Option | Option[] | null) => void;
}
export interface Option {
  label: string;
  value: string;
}

export const Autocomplete: React.FC<AutocompleteProps> = (props: AutocompleteProps) => {
  const { options = [], multiple = false, label, disabled = false, placeholder, isLoading, size = 'medium' } = props;
  const { value, onChange, errorMessage, shouldShowError } = useFormElement<
    Option | Option[] | null
  >({
    ...props,
    mapValue: (val) => {
      if (!val) {
        return null;
      }
      if (Array.isArray(val)) {
        return val.map((v) => v.value);
      }
      return (val as Option).value;
    },
  });
  const isOptionEqualToValue = (option: Option, valueProp: Option) => {
    return option === valueProp || option?.value === valueProp?.value;
  };

  return (
    <MuiAutocomplete
      size={size}
      options={options}
      getOptionLabel={(opt: Option) => opt.label}
      isOptionEqualToValue={isOptionEqualToValue}
      multiple={multiple}
      disableCloseOnSelect={multiple}
      freeSolo={false}
      loading={isLoading}
      value={value}
      onChange={(_e, v) => onChange(v as Option | Option[] | null)}
      disabled={disabled}
      renderInput={(params) => (
        <TextField
          {...params}
          size={size}
          label={label}
          placeholder={placeholder}
          helperText={shouldShowError ? errorMessage : undefined}
          error={shouldShowError}
        />
      )}
    />
  );
};

export default Autocomplete;
