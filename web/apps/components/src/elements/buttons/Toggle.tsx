import React from 'react';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import FormHelperText from '@mui/material/FormHelperText';
import FormControl from '@mui/material/FormControl';
import { FormElementProps } from '../forms/Form';
import { useFormElement } from '../forms/useFormElement';

export interface ToggleProps extends FormElementProps<boolean> {
  label?: string;
  helperText?: string;
  disabled?: boolean;
  size?: 'small' | 'medium';
  labelPlacement?: 'start' | 'end' | 'top' | 'bottom';
}

export const Toggle: React.FC<ToggleProps> = ({
  label,
  helperText,
  disabled = false,
  size = 'medium',
  labelPlacement = 'end',
  ...props
}) => {
  const { value, onChange, shouldShowError, errorMessage } = useFormElement<boolean>({
    ...props,
    value: props.value ?? false,
  });

  return (
    <FormControl error={shouldShowError} disabled={disabled}>
      <FormControlLabel
        label={label ?? ''}
        labelPlacement={labelPlacement}
        control={
          <Switch
            checked={!!value}
            onChange={(e) => onChange(e.target.checked)}
            size={size}
            disabled={disabled}
          />
        }
      />
      {(shouldShowError || helperText) && (
        <FormHelperText>{shouldShowError ? errorMessage : helperText}</FormHelperText>
      )}
    </FormControl>
  );
};

export default Toggle;
