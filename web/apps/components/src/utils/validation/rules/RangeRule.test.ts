import { describe, it, expect } from 'vitest';
import { MinRule, MaxRule, RangeRule } from './RangeRule';

const ctx = { formData: {} };

describe('MinRule metadata', () => {
  const rule = new MinRule(5);
  it('has correct name and priority', () => {
    expect(rule.getName()).toBe('min');
    expect(rule.getPriority()).toBe(1);
  });
});

describe('MaxRule metadata', () => {
  const rule = new MaxRule(10);
  it('has correct name and priority', () => {
    expect(rule.getName()).toBe('max');
    expect(rule.getPriority()).toBe(1);
  });
});

describe('RangeRule metadata', () => {
  const rule = new RangeRule(1, 10);
  it('has correct name and priority', () => {
    expect(rule.getName()).toBe('range');
    expect(rule.getPriority()).toBe(1);
  });
});

describe('MinRule', () => {
  const rule = new MinRule(5);

  it('passes for value >= min', async () => {
    expect((await rule.validate(5, ctx)).isValid).toBe(true);
    expect((await rule.validate(10, ctx)).isValid).toBe(true);
  });

  it('fails for value < min', async () => {
    const r = await rule.validate(4, ctx);
    expect(r.isValid).toBe(false);
    expect(r.error?.ruleName).toBe('min');
  });

  it('returns valid for null/undefined', async () => {
    expect((await rule.validate(null as unknown as number, ctx)).isValid).toBe(true);
  });
});

describe('MaxRule', () => {
  const rule = new MaxRule(10);

  it('passes for value <= max', async () => {
    expect((await rule.validate(10, ctx)).isValid).toBe(true);
    expect((await rule.validate(0, ctx)).isValid).toBe(true);
  });

  it('fails for value > max', async () => {
    const r = await rule.validate(11, ctx);
    expect(r.isValid).toBe(false);
    expect(r.error?.ruleName).toBe('max');
  });
});

describe('RangeRule', () => {
  const rule = new RangeRule(1, 10);

  it('passes for value within range', async () => {
    expect((await rule.validate(5, ctx)).isValid).toBe(true);
  });

  it('fails for value below min', async () => {
    expect((await rule.validate(0, ctx)).isValid).toBe(false);
  });

  it('fails for value above max', async () => {
    expect((await rule.validate(11, ctx)).isValid).toBe(false);
  });

  it('returns valid for null (other rules handle required)', async () => {
    expect((await new MinRule(5).validate(null as unknown as number, ctx)).isValid).toBe(true);
    expect((await new MaxRule(10).validate(null as unknown as number, ctx)).isValid).toBe(true);
  });
});
