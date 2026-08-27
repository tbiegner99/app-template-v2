import React, { useEffect, useRef } from 'react';
import { Validator } from '../../utils/validation/Validator';
import {
  ValidationResult,
  ValidationRule,
  ValidationState,
} from '../../utils/validation/rules/ValidationRule';

export interface FormElementProps<T> {
  name?: string;
  validationRules?: ValidationRule[];
  value?: T;
  onChange?: (value: T) => void;
}
export interface FormEvents {
  onSubmit?: (formData: Record<string, unknown>, fieldValidationState: ValidationState) => void;
}
interface FormManager {
  formData: Record<string, unknown>;

  registerField?: (
    fieldName: string,
    initialValue: unknown,
    fieldEntry: FieldEntry,
  ) => Promise<ValidationState>;
  updateField: (fieldName: string, value: unknown) => Promise<ValidationState>;
  validationState: ValidationState;
}

export const FormContext = React.createContext<FormManager>(null);

export const useForm = () => {
  return React.useContext(FormContext);
};

interface FieldEntry {
  events: FormEvents;
  validationRules: ValidationRule[];
  mapValue?: (value: unknown) => unknown;
}

interface FormProps extends FormElementProps<unknown>, React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange?: (value: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit?: (formData: Record<string, any>) => void;
}

export const Form = ({ children, name, onSubmit, onChange, ...divProps }: FormProps) => {
  const parentForm = useForm();
  const validationState = React.useRef<ValidationState>(ValidationResult.valid());
  const formData = useRef<Record<string, unknown>>({});
  const fieldStates = useRef<Record<string, ValidationState>>({});
  const fields = useRef<Record<string, FieldEntry>>({});
  const getSubmitValue = () => {
    const result: Record<string, unknown> = {};
    for (const fieldName in formData.current) {
      const entry = fields.current[fieldName];
      if (entry.mapValue) {
        result[fieldName] = entry.mapValue(formData.current[fieldName]);
      } else {
        result[fieldName] = formData.current[fieldName];
      }
    }
    return result;
  };
  useEffect(() => {
    if (parentForm && name) {
      const entry: FieldEntry = {
        mapValue: getSubmitValue,
        events: {
          onSubmit: async (formData) => {
            for (const fieldName in fields.current) {
              if (fields.current[fieldName].events.onSubmit) {
                await fields.current[fieldName].events.onSubmit(
                  formData,
                  fieldStates.current[fieldName],
                );
              }
            }
          },
        },
        validationRules: [
          {
            validate: async () => validationState.current,
            getName() {
              return 'form-validation';
            },
            getPriority() {
              return 0;
            },
          },
        ],
      };
      fields.current[name] = entry;
      parentForm.registerField(
        name,

        formData.current,
        entry,
      );
    }
  }, []);
  const registerField = async (fieldName: string, initialValue: unknown, options: FieldEntry) => {
    formData.current[fieldName] = initialValue;
    onChange?.(formData.current);
    fields.current[fieldName] = options;
    const validator = new Validator();
    const state = await validator.validate(initialValue, [], {
      formData: formData.current,
    });
    validationState.current = state;
    fieldStates.current[fieldName] = state;

    return state;
  };

  const updateField = async (fieldName: string, value: unknown) => {
    formData.current[fieldName] = value;
    onChange?.(formData.current);
    const validator = new Validator();
    const state = await validator.validate(value, fields.current[fieldName].validationRules, {
      formData: formData.current,
    });
    validationState.current = state;
    fieldStates.current[fieldName] = state;
    if (parentForm) {
      await parentForm.updateField(name, formData.current);
    }
    return state;
  };

  let child = null;
  if (!parentForm) {
    child = (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          Object.entries(fields.current).forEach(([fieldName, fieldEntry]) => {
            fieldEntry.events?.onSubmit?.(formData.current, fieldStates.current[fieldName]);
          });
          if (validationState.current.isValid) {
            onSubmit(getSubmitValue());
          }
        }}
        {...(divProps as unknown as React.FormHTMLAttributes<HTMLFormElement>)}
      >
        {children}
      </form>
    );
  } else {
    child = <div {...divProps}>{children}</div>;
  }
  return (
    <FormContext.Provider
      value={{
        formData: formData.current,
        registerField: registerField,
        updateField,
        validationState: validationState.current,
      }}
    >
      {child}
    </FormContext.Provider>
  );
};
