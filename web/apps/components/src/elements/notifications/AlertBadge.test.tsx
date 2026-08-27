import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { AlertBadge } from './AlertBadge';

describe('AlertBadge', () => {
  it('renders children with no badge when count is 0', () => {
    render(<AlertBadge count={0}><span>bell</span></AlertBadge>);
    expect(screen.getByText('bell')).toBeInTheDocument();
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('shows count when count > 0', () => {
    render(<AlertBadge count={5}><span>bell</span></AlertBadge>);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('caps badge at 99+', () => {
    render(<AlertBadge count={150}><span>bell</span></AlertBadge>);
    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  it('shows exact count when exactly 99', () => {
    render(<AlertBadge count={99}><span>bell</span></AlertBadge>);
    expect(screen.getByText('99')).toBeInTheDocument();
  });
});
