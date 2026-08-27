import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { Card } from './Card';

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('renders with custom elevation', () => {
    render(<Card elevation={0}>Flat card</Card>);
    expect(screen.getByText('Flat card')).toBeInTheDocument();
  });
});
