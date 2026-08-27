import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { Page } from './Page';
import { ThemeProvider } from '@__SLUG__/components';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

describe('Page', () => {
  it('renders children', () => {
    render(<Page><span>page content</span></Page>, { wrapper });
    expect(screen.getByText('page content')).toBeInTheDocument();
  });

  it('renders title', () => {
    render(<Page title="My Title"><div /></Page>, { wrapper });
    expect(screen.getByText('My Title')).toBeInTheDocument();
  });

  it('renders actions', () => {
    render(<Page actions={<button>Save</button>}><div /></Page>, { wrapper });
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('renders navigation', () => {
    render(<Page navigation={<nav>Nav</nav>}><div /></Page>, { wrapper });
    expect(screen.getByText('Nav')).toBeInTheDocument();
  });
});
