import { describe, it, expect } from 'vitest';
import { tokens, getCssVariables } from './Tokens';

describe('tokens', () => {
  it('has BaseMeasurements', () => {
    expect(tokens.BaseMeasurements.spacing).toBe(4);
    expect(tokens.BaseMeasurements.borderRadius).toBe(2);
  });

  it('has Colors section', () => {
    expect(tokens.Colors.primary).toBeDefined();
    expect(tokens.Colors.secondary).toBeDefined();
  });
});

describe('getCssVariables', () => {
  it('returns a non-empty CSS string', () => {
    const css = getCssVariables();
    expect(typeof css).toBe('string');
    expect(css.length).toBeGreaterThan(0);
  });

  it('includes spacing variables', () => {
    const css = getCssVariables();
    expect(css).toContain('--__SLUG__-spacing-1: 4px');
    expect(css).toContain('--__SLUG__-spacing-20: 80px');
  });

  it('includes border-radius variables', () => {
    const css = getCssVariables();
    expect(css).toContain('--__SLUG__-border-radius-1: 2px');
    expect(css).toContain('--__SLUG__-border-radius-10: 20px');
  });
});
