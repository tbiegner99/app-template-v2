import { describe, it, expect } from 'vitest';
import { MinLengthRule, MaxLengthRule, LengthRangeRule } from './LengthRule';

const ctx = { formData: {} };

describe('LengthRule metadata', () => {
  it('MinLengthRule has correct name and priority', () => {
    const r = new MinLengthRule(3);
    expect(r.getName()).toBe('min-length');
    expect(r.getPriority()).toBe(1);
  });
  it('MaxLengthRule has correct name and priority', () => {
    const r = new MaxLengthRule(5);
    expect(r.getName()).toBe('max-length');
    expect(r.getPriority()).toBe(1);
  });
  it('LengthRangeRule has correct name and priority', () => {
    const r = new LengthRangeRule(2, 5);
    expect(r.getName()).toBe('length-range');
    expect(r.getPriority()).toBe(1);
  });
});

describe('MinLengthRule', () => {
  const rule = new MinLengthRule(3);

  it('passes when length meets minimum', async () => {
    expect((await rule.validate('abc', ctx)).isValid).toBe(true);
    expect((await rule.validate('abcd', ctx)).isValid).toBe(true);
  });

  it('fails when length is below minimum', async () => {
    const r = await rule.validate('ab', ctx);
    expect(r.isValid).toBe(false);
    expect(r.error?.ruleName).toBe('min-length');
  });

  it('returns valid for null/undefined', async () => {
    expect((await rule.validate(null as unknown as string, ctx)).isValid).toBe(true);
    expect((await rule.validate(undefined as unknown as string, ctx)).isValid).toBe(true);
  });

  it('works with arrays', async () => {
    expect((await rule.validate(['a', 'b', 'c'], ctx)).isValid).toBe(true);
    expect((await rule.validate(['a'], ctx)).isValid).toBe(false);
  });
});

describe('MaxLengthRule', () => {
  const rule = new MaxLengthRule(5);

  it('passes when length is within maximum', async () => {
    expect((await rule.validate('abcde', ctx)).isValid).toBe(true);
    expect((await rule.validate('hi', ctx)).isValid).toBe(true);
  });

  it('fails when length exceeds maximum', async () => {
    const r = await rule.validate('toolong', ctx);
    expect(r.isValid).toBe(false);
    expect(r.error?.ruleName).toBe('max-length');
  });
});

describe('LengthRangeRule', () => {
  const rule = new LengthRangeRule(2, 5);

  it('passes for values within range', async () => {
    expect((await rule.validate('hi', ctx)).isValid).toBe(true);
    expect((await rule.validate('hello', ctx)).isValid).toBe(true);
  });

  it('fails for too short', async () => {
    expect((await rule.validate('a', ctx)).isValid).toBe(false);
  });

  it('fails for too long', async () => {
    expect((await rule.validate('toolong', ctx)).isValid).toBe(false);
  });
});
