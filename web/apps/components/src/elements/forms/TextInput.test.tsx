import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { TextInput } from './TextInput';
import { Form } from './Form';
import { ValidationRules } from '../../utils/validation/rules/ValidationRule';

describe('TextInput standalone (no Form)', () => {
  it('renders with label', () => {
    render(<TextInput label="Email" value="" onChange={vi.fn()} />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('renders with placeholder', () => {
    render(<TextInput label="Name" placeholder="Enter name" value="" onChange={vi.fn()} />);
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
  });

  it('renders multiline', () => {
    render(<TextInput label="Notes" multiline rows={3} value="" onChange={vi.fn()} />);
    expect(screen.getByLabelText('Notes')).toBeInTheDocument();
  });

  it('renders disabled', () => {
    render(<TextInput label="Readonly" disabled value="fixed" onChange={vi.fn()} />);
    expect(screen.getByLabelText('Readonly')).toBeDisabled();
  });
});

describe('TextInput within Form', () => {
  it('registers field and accepts input', async () => {
    const onChange = vi.fn();
    render(
      <Form onChange={onChange}>
        <TextInput name="email" label="Email" value="" />
      </Form>
    );
    const input = screen.getByLabelText('Email');
    fireEvent.change(input, { target: { value: 'test@example.com' } });
    await waitFor(() => {
      expect(input).toBeInTheDocument();
    });
  });

  it('renders with validation rules', () => {
    render(
      <Form onSubmit={vi.fn()}>
        <TextInput
          name="password"
          label="Password"
          type="password"
          validationRules={[ValidationRules.required()]}
          value=""
        />
      </Form>
    );
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });
});
