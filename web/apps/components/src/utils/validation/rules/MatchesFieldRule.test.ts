import { describe, it, expect } from 'vitest';
import { MatchesFieldRule } from './MatchesFieldRule';

describe('MatchesFieldRule', () => {
  const rule = new MatchesFieldRule('password');

  it('getName includes field name', () => {
    expect(rule.getName()).toBe('matches-field-password');
  });

  it('getPriority returns 1', () => {
    expect(rule.getPriority()).toBe(1);
  });

  it('passes when values match', async () => {
    const ctx = { formData: { password: 'secret123' } };
    const result = await rule.validate('secret123', ctx);
    expect(result.isValid).toBe(true);
  });

  it('fails when values do not match', async () => {
    const ctx = { formData: { password: 'secret123' } };
    const result = await rule.validate('different', ctx);
    expect(result.isValid).toBe(false);
    expect(result.error?.ruleName).toBe('matches-field-password');
  });

  it('fails when field is missing from formData', async () => {
    const ctx = { formData: {} };
    const result = await rule.validate('anything', ctx);
    expect(result.isValid).toBe(false);
  });
});
