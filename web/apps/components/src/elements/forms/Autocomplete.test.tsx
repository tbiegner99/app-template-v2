import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { Autocomplete } from './Autocomplete';

const options = [
  { label: 'Option A', value: 'a' },
  { label: 'Option B', value: 'b' },
];

describe('Autocomplete (standalone)', () => {
  it('renders with label', () => {
    render(<Autocomplete options={options} label="Select" value={null} onChange={vi.fn()} />);
    expect(screen.getByLabelText('Select')).toBeInTheDocument();
  });

  it('renders with placeholder', () => {
    render(<Autocomplete options={options} label="Select" placeholder="Pick one" value={null} onChange={vi.fn()} />);
    expect(screen.getByPlaceholderText('Pick one')).toBeInTheDocument();
  });

  it('renders disabled', () => {
    render(<Autocomplete options={options} label="Disabled" disabled value={null} onChange={vi.fn()} />);
    const combo = screen.getByRole('combobox');
    expect(combo).toBeDisabled();
  });

  it('renders with selected value', () => {
    render(<Autocomplete options={options} label="Select" value={options[0]} onChange={vi.fn()} />);
    expect(screen.getByDisplayValue('Option A')).toBeInTheDocument();
  });

  it('renders multiple select', () => {
    render(<Autocomplete options={options} label="Multi" multiple value={[options[0]]} onChange={vi.fn()} />);
    expect(screen.getByText('Option A')).toBeInTheDocument();
  });
});
