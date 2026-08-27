import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { MenuItem } from './MenuItem';

describe('MenuItem', () => {
  it('renders label', () => {
    render(<MenuItem label="Dashboard" />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders as anchor when href provided', () => {
    render(<MenuItem label="External" href="/path" />);
    const btn = screen.getByRole('link', { name: /External/i });
    expect(btn).toBeInTheDocument();
  });

  it('renders icon', () => {
    render(<MenuItem label="Settings" icon={<span data-testid="icon">I</span>} />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('renders icon with badge', () => {
    render(<MenuItem label="Alerts" icon={<span>bell</span>} badge={5} />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<MenuItem label="Click me" onClick={onClick} />);
    screen.getByText('Click me').click();
    expect(onClick).toHaveBeenCalled();
  });

  it('renders in selected state when active', () => {
    render(<MenuItem label="Active" active />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });
});
