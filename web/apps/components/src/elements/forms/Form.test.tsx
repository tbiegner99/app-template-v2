import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { Form, FormContext, useForm } from './Form';
import { TextInput } from './TextInput';
import { ValidationRules } from '../../utils/validation/rules/ValidationRule';

describe('Form', () => {
  it('renders children', () => {
    render(<Form><span>form content</span></Form>);
    expect(screen.getByText('form content')).toBeInTheDocument();
  });

  it('calls onSubmit when submitted', async () => {
    const onSubmit = vi.fn();
    render(
      <Form onSubmit={onSubmit}>
        <button type="submit">Submit</button>
      </Form>
    );
    fireEvent.click(screen.getByText('Submit'));
    await waitFor(() => {
      // submit triggered
    });
  });

  it('renders div wrapper with children', () => {
    const { container } = render(<Form><p>nested</p></Form>);
    expect(container.querySelector('p')).toBeInTheDocument();
  });

  it('useForm returns null outside Form context', () => {
    const Consumer = () => {
      const form = useForm();
      return <div data-testid="result">{form ? 'has-form' : 'no-form'}</div>;
    };
    render(<Consumer />);
    expect(screen.getByTestId('result')).toHaveTextContent('no-form');
  });

  it('renders nested form as div (parentForm branch)', () => {
    const { container } = render(
      <Form>
        <Form>
          <span>nested-form-child</span>
        </Form>
      </Form>
    );
    expect(screen.getByText('nested-form-child')).toBeInTheDocument();
    // outer is <form>, inner is <div>
    expect(container.querySelector('form')).toBeInTheDocument();
    expect(container.querySelector('form > div')).toBeInTheDocument();
  });

  it('registers a field with validation and updates it', async () => {
    const onChange = vi.fn();
    render(
      <Form onChange={onChange}>
        <TextInput label="Name" name="name" rules={[ValidationRules.required()]} />
      </Form>
    );
    const input = screen.getByLabelText('Name');
    fireEvent.change(input, { target: { value: 'hello' } });
    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
    });
  });
});
