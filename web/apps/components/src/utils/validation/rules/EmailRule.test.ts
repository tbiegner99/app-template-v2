import { describe, it, expect } from 'vitest';
import { EmailRule } from './EmailRule';

const ctx = { formData: {} };

describe('EmailRule', () => {
  const rule = new EmailRule();

  it('getName returns "email"', () => expect(rule.getName()).toBe('email'));
  it('getPriority returns 1', () => expect(rule.getPriority()).toBe(1));

  it.each(['test@example.com', 'a.b+c@sub.domain.io'])('accepts valid email %s', async (email) => {
    const result = await rule.validate(email, ctx);
    expect(result.isValid).toBe(true);
  });

  it.each(['notanemail', 'missing@', '@nodomain', ''])('rejects invalid email %s', async (email) => {
    const result = await rule.validate(email, ctx);
    expect(result.isValid).toBe(false);
  });

  it('returns valid for non-string values (other rules handle type)', async () => {
    const result = await rule.validate(123, ctx);
    expect(result.isValid).toBe(true);
  });
});
