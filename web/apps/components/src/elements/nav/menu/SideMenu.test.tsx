import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { SideMenu } from './SideMenu';

describe('SideMenu', () => {
  it('renders children', () => {
    render(<SideMenu><span>Menu items</span></SideMenu>);
    expect(screen.getByText('Menu items')).toBeInTheDocument();
  });

  it('renders string title as H6', () => {
    render(<SideMenu title="My App" />);
    expect(screen.getByText('My App')).toBeInTheDocument();
  });

  it('renders React node title', () => {
    render(<SideMenu title={<strong>Logo</strong>} />);
    expect(screen.getByText('Logo')).toBeInTheDocument();
  });

  it('renders with no title', () => {
    const { container } = render(<SideMenu />);
    expect(container).toBeInTheDocument();
  });
});
