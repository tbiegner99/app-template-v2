import { describe, it, expect } from 'vitest';
import { RegexRule } from './RegexRule';

const ctx = { formData: {} };

describe('RegexRule', () => {
  const rule = new RegexRule(/^\d{4}$/, { message: 'Must be 4 digits', name: 'four-digit' });

  it('getName returns custom name', () => expect(rule.getName()).toBe('four-digit'));

  it('passes for matching value', async () => {
    expect((await rule.validate('1234', ctx)).isValid).toBe(true);
  });

  it('fails for non-matching value', async () => {
    const r = await rule.validate('abc', ctx);
    expect(r.isValid).toBe(false);
    expect(r.error?.message).toBe('Must be 4 digits');
  });

  it('returns valid for non-string types', async () => {
    expect((await rule.validate(1234, ctx)).isValid).toBe(true);
  });

  it('uses default name "regex" when none provided', () => {
    const defaultRule = new RegexRule(/test/);
    expect(defaultRule.getName()).toBe('regex');
  });
});
