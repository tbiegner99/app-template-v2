import React from 'react';
import { Meta } from '@storybook/react';
import { action } from 'storybook/actions';
import { Form, useForm } from './Form';
import TextInput from './TextInput';
import { FlexColumn, PrimaryButton, SecondaryButton } from '../..';
import { ValidationRules } from '../../utils/validation/rules/ValidationRule';
import Autocomplete from './Autocomplete';

type Args = object;

const meta: Meta<Args> = {
  title: 'elements/forms/Form',
  tags: ['autodocs'],
};

export default meta;

const Field: React.FC<{ name: string; label?: string; initial?: string }> = ({
  name,
  label,
  initial = '',
}) => {
  const form = useForm();
  const [value, setValue] = React.useState(initial);

  React.useEffect(() => {
    if (form && form.registerField) {
      form.registerField(name, initial, {
        validationRules: [],
        events: {
          onSubmit: async (_formData, _state) => {
            // noop for story
          },
        },
      });
    }
  }, [form, name]);

  React.useEffect(() => {
    if (form && form.updateField) {
      // update parent form state when local value changes
      form.updateField(name, value).catch(() => {});
    }
  }, [value]);

  return (
    <div style={{ marginBottom: 12 }}>
      <TextInput label={label || name} value={value} onChange={(v) => setValue(v)} />
    </div>
  );
};

export const Basic = () => {
  const submit = action('submit');
  return (
    <div style={{ padding: 12 }}>
      <Form onSubmit={(data) => submit(data)}>
        <FlexColumn gap={12}>
          <TextInput
            name="firstName"
            helperText="Helper Text"
            label="First name"
            validationRules={[ValidationRules.required()]}
          />
          <Autocomplete
            name="autocompleteField"
            multiple
            placeholder="Choose Options"
            validationRules={[ValidationRules.required()]}
            options={[
              { label: 'Option 1', value: 'option1' },
              { label: 'Option 2', value: 'option2' },
              { label: 'Option 3', value: 'option3' },
            ]}
          />
          <Field name="lastName" label="Last name" initial="Smith" />
          <div style={{ marginTop: 12 }}>
            <PrimaryButton type="submit">Submit</PrimaryButton>
          </div>
        </FlexColumn>
      </Form>
    </div>
  );
};

export const Nested = () => {
  const submit = action('submit');
  return (
    <div style={{ padding: 12 }}>
      <Form onSubmit={(data) => submit(data)}>
        <Field name="outerField" label="Outer Field" initial="outer" />
        <Form name="innerForm" onSubmit={() => {}}>
          <Field name="innerField" label="Inner Field" initial="inner" />
        </Form>
        <div style={{ marginTop: 12 }}>
          <SecondaryButton type="submit">Submit Outer</SecondaryButton>
        </div>
      </Form>
    </div>
  );
};
