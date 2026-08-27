import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { BrandLogo } from './BrandLogo';

describe('BrandLogo', () => {
  it('renders full logo by default', () => {
    const { container } = render(<BrandLogo />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg?.getAttribute('width')).toBe('180');
  });

  it('renders compact logo', () => {
    const { container } = render(<BrandLogo compact />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('width')).toBe('40');
  });

  it('respects custom width', () => {
    const { container } = render(<BrandLogo width={120} />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('width')).toBe('120');
  });
});
