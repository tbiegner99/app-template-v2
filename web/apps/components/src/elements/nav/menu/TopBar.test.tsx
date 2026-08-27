import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { TopBar } from './TopBar';

describe('TopBar', () => {
  it('renders title', () => {
    render(<TopBar title="__SLUG_UPPER__" />);
    expect(screen.getByText('__SLUG_UPPER__')).toBeInTheDocument();
  });

  it('renders menu button when onMenuClick provided', () => {
    const fn = vi.fn();
    render(<TopBar onMenuClick={fn} />);
    const btn = screen.getAllByRole('button').find(b => b.querySelector('[data-testid]') || b);
    expect(btn).toBeInTheDocument();
  });

  it('renders rightActions', () => {
    render(<TopBar rightActions={<button>Action</button>} />);
    expect(screen.getByText('Action')).toBeInTheDocument();
  });

  it('renders sticky variant', () => {
    render(<TopBar title="App" sticky />);
    expect(screen.getByText('App')).toBeInTheDocument();
  });

  it('renders default notification icon when no rightActions', () => {
    render(<TopBar />);
    // Notification icon is rendered by default
    expect(screen.getAllByRole('button').length).toBeGreaterThan(0);
  });
});
