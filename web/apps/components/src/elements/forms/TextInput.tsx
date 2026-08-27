import React from 'react';
import TextField from '@mui/material/TextField';
import { FormElementProps } from './Form';

import { useFormElement } from './useFormElement';

export interface TextInputProps extends FormElementProps<string> {
  placeholder?: string;
  type?: string;
  multiline?: boolean;
  rows?: number;
  helperText?: string;
  label?: string;
  size?: 'small' | 'medium';
  disabled?: boolean;
}

export const TextInput: React.FC<TextInputProps> = (props: TextInputProps) => {
  const { value, onChange, shouldShowError, errorMessage } = useFormElement<string>(props);
  return (
    <TextField
      variant="outlined"
      {...props}
      fullWidth
      error={shouldShowError}
      helperText={shouldShowError ? errorMessage : props.helperText}
      value={typeof props.value === 'undefined' ? value : props.value}
      onChange={(event) => onChange(event.target.value)}
    />
  );
};

export default TextInput;
