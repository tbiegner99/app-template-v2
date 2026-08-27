import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { MenuSection, MenuDivider } from './MenuSection';

describe('MenuSection', () => {
  it('renders children', () => {
    render(<MenuSection><span>item</span></MenuSection>);
    expect(screen.getByText('item')).toBeInTheDocument();
  });

  it('renders string title', () => {
    render(<MenuSection title="Reports" />);
    expect(screen.getByText('Reports')).toBeInTheDocument();
  });

  it('renders React node title', () => {
    render(<MenuSection title={<strong>Admin</strong>} />);
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('renders without title', () => {
    const { container } = render(<MenuSection />);
    expect(container).toBeInTheDocument();
  });
});

describe('MenuDivider', () => {
  it('renders a divider', () => {
    const { container } = render(<MenuDivider />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
