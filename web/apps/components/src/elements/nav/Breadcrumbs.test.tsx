import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { Breadcrumbs } from './Breadcrumbs';

describe('Breadcrumbs', () => {
  it('renders nothing for empty items', () => {
    const { container } = render(<Breadcrumbs items={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders single item as last (non-link)', () => {
    render(<Breadcrumbs items={[{ label: 'Dashboard' }]} />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders multiple items with links', () => {
    render(<Breadcrumbs items={[
      { label: 'Home', href: '/' },
      { label: 'Reports', href: '/reports' },
      { label: 'Current' },
    ]} />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Reports')).toBeInTheDocument();
    expect(screen.getByText('Current')).toBeInTheDocument();
  });

  it('renders item with onClick handler', () => {
    const onClick = vi.fn();
    render(<Breadcrumbs items={[
      { label: 'Clickable', onClick },
      { label: 'Current' },
    ]} />);
    screen.getByText('Clickable').click();
    expect(onClick).toHaveBeenCalled();
  });

  it('renders item with no href/onClick as plain text', () => {
    render(<Breadcrumbs items={[
      { label: 'Plain' },
      { label: 'Last' },
    ]} />);
    expect(screen.getByText('Plain')).toBeInTheDocument();
  });
});
