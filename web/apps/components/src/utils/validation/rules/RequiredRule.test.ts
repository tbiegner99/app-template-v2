import { describe, it, expect } from 'vitest';
import { RequiredRule } from './RequiredRule';

const ctx = { formData: {} };

describe('RequiredRule', () => {
  const rule = new RequiredRule();

  it('getName returns "required"', () => expect(rule.getName()).toBe('required'));
  it('getPriority returns 0', () => expect(rule.getPriority()).toBe(0));

  it.each([null, undefined, ''])('marks %s as invalid', async (value) => {
    const result = await rule.validate(value, ctx);
    expect(result.isValid).toBe(false);
    expect(result.error?.ruleName).toBe('required');
  });

  it.each(['hello', 0, false, []])('marks non-empty as valid', async (value) => {
    const result = await rule.validate(value, ctx);
    expect(result.isValid).toBe(true);
  });
});
