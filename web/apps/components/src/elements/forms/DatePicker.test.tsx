import React from 'react';
import dayjs from 'dayjs';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { DatePicker, DateRangePicker } from './DatePicker';
import { ThemeProvider } from '../../context/ThemeProvider';

describe('DatePicker', () => {
  it('renders with label', () => {
    render(<DatePicker label="Start Date" value={null} onChange={vi.fn()} />);
    expect(screen.getByLabelText('Start Date')).toBeInTheDocument();
  });

  it('renders without label', () => {
    render(<DatePicker value={null} onChange={vi.fn()} />);
    expect(document.querySelector('input')).toBeInTheDocument();
  });

  it('renders disabled', () => {
    render(<DatePicker label="Date" disabled value={null} onChange={vi.fn()} />);
    expect(screen.getByLabelText('Date')).toBeDisabled();
  });
});

describe('DateRangePicker', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider>{children}</ThemeProvider>
  );

  it('renders start and end pickers', () => {
    render(<DateRangePicker value={null} onChange={vi.fn()} />, { wrapper });
    expect(screen.getByLabelText('Start')).toBeInTheDocument();
    expect(screen.getByLabelText('End')).toBeInTheDocument();
  });

  it('renders with existing date range value', () => {
    render(
      <DateRangePicker value={{ start: dayjs('2024-01-01'), end: dayjs('2024-01-31') }} onChange={vi.fn()} />,
      { wrapper }
    );
    expect(screen.getByLabelText('Start')).toBeInTheDocument();
  });
});
