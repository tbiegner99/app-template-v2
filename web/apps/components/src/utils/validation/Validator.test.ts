import { describe, it, expect } from 'vitest';
import { Validator } from './Validator';
import { RequiredRule } from './rules/RequiredRule';
import { EmailRule } from './rules/EmailRule';
import { MinLengthRule } from './rules/LengthRule';

const ctx = { formData: {} };

describe('Validator', () => {
  const validator = new Validator();

  it('returns valid when no rules provided', async () => {
    const result = await validator.validate('anything', [], ctx);
    expect(result.isValid).toBe(true);
  });

  it('returns valid when all rules pass', async () => {
    const result = await validator.validate('test@example.com', [new RequiredRule(), new EmailRule()], ctx);
    expect(result.isValid).toBe(true);
  });

  it('returns invalid when required rule fails', async () => {
    const result = await validator.validate('', [new RequiredRule()], ctx);
    expect(result.isValid).toBe(false);
    expect(result.error?.ruleName).toBe('required');
  });

  it('validates rules in priority order (required before email)', async () => {
    const result = await validator.validate('', [new EmailRule(), new RequiredRule()], ctx);
    expect(result.isValid).toBe(false);
    expect(result.error?.ruleName).toBe('required');
  });

  it('stops at first failing priority group', async () => {
    const result = await validator.validate('ab', [new RequiredRule(), new MinLengthRule(5)], ctx);
    expect(result.isValid).toBe(false);
    expect(result.error?.ruleName).toBe('min-length');
  });

  it('handles multiple rules at same priority', async () => {
    const result = await validator.validate('notanemail', [new EmailRule()], ctx);
    expect(result.isValid).toBe(false);
  });
});
