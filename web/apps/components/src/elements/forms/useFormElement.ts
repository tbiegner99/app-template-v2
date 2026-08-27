import React, { useEffect } from 'react';
import { useI18n } from '../../context';
import { FormElementProps, useForm } from './Form';
import { ValidationResult, ValidationState } from '../../utils/validation/rules/ValidationRule';

interface FormElementConfig<T> extends FormElementProps<T> {
  mapValue?: (value: T) => unknown;
}

export const useFormElement = <T>(props: FormElementConfig<T>) => {
  const form = useForm();
  const i18n = useI18n();
  const [value, setValue] = React.useState(props.value);
  const [validationState, setValidationState] = React.useState<ValidationState>(
    ValidationResult.valid(),
  );
  const [showError, setShowError] = React.useState(false);

  useEffect(() => {
    if (form && props.name) {
      form.registerField(props.name, value, {
        mapValue: props.mapValue,
        validationRules: props.validationRules || [],
        events: {
          onSubmit: (_, validationState) => {
            setValidationState(validationState);
            setShowError(true);
          },
        },
      });
    }
  }, []);
  useEffect(() => {
    if (typeof props.value !== 'undefined') {
      setValue(props.value);
    }
  }, [props.value]);
  useEffect(() => {
    if (form && props.name) {
      form.updateField(props.name, value).then((state) => {
        setValidationState(state);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  const shouldShowError = showError && validationState.isValid === false;
  const errorMessage = i18n
    ? i18n.dictionary.interpolate(
        validationState.error?.i18nKey,
        {},
        {
          fallback: validationState.error?.message || '',
        },
      )
    : validationState.error?.message;
  return {
    value,
    onChange: (newValue: T) => {
      setValue(newValue);
      setShowError(true);
      props.onChange?.(newValue);
    },
    validationState,
    shouldShowError,
    errorMessage,
  };
};
