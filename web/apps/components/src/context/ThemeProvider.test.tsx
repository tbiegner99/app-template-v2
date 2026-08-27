import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { ThemeProvider } from './ThemeProvider';

describe('ThemeProvider', () => {
  it('renders children', () => {
    render(
      <ThemeProvider>
        <span>App content</span>
      </ThemeProvider>
    );
    expect(screen.getByText('App content')).toBeInTheDocument();
  });

  it('renders without crashing', () => {
    const { container } = render(
      <ThemeProvider>
        <div data-testid="inner" />
      </ThemeProvider>
    );
    expect(container.querySelector('[data-testid="inner"]')).toBeInTheDocument();
  });
});
