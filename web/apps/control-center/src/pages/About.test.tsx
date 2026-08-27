import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { ThemeProvider } from '@__SLUG__/components';
import About from './About';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

describe('About', () => {
  it('renders technology list', () => {
    render(<About />, { wrapper });
    expect(screen.getByText('React 18')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
  });

  it('renders headings', () => {
    render(<About />, { wrapper });
    expect(screen.getByText('Technologies Used')).toBeInTheDocument();
    expect(screen.getByText('Features')).toBeInTheDocument();
  });
});
