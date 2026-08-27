import { describe, it, expect } from 'vitest';
import { ValidationRules } from './ValidationRule';

const ctx = { formData: {} };

describe('ValidationRules factory', () => {
  it('creates required rule', async () => {
    const rule = ValidationRules.required();
    expect((await rule.validate('', ctx)).isValid).toBe(false);
    expect((await rule.validate('x', ctx)).isValid).toBe(true);
  });

  it('creates email rule', async () => {
    const rule = ValidationRules.email();
    expect((await rule.validate('test@example.com', ctx)).isValid).toBe(true);
    expect((await rule.validate('bad', ctx)).isValid).toBe(false);
  });

  it('creates minLength rule', async () => {
    const rule = ValidationRules.minLength(3);
    expect((await rule.validate('ab', ctx)).isValid).toBe(false);
    expect((await rule.validate('abc', ctx)).isValid).toBe(true);
  });

  it('creates maxLength rule', async () => {
    const rule = ValidationRules.maxLength(5);
    expect((await rule.validate('toolong', ctx)).isValid).toBe(false);
    expect((await rule.validate('ok', ctx)).isValid).toBe(true);
  });

  it('creates lengthRange rule', async () => {
    const rule = ValidationRules.lengthRange(2, 5);
    expect((await rule.validate('hi', ctx)).isValid).toBe(true);
    expect((await rule.validate('a', ctx)).isValid).toBe(false);
  });

  it('creates regex rule', async () => {
    const rule = ValidationRules.regex(/^\d+$/, { message: 'Digits only' });
    expect((await rule.validate('123', ctx)).isValid).toBe(true);
    expect((await rule.validate('abc', ctx)).isValid).toBe(false);
  });

  it('creates min rule', async () => {
    const rule = ValidationRules.min(5);
    expect((await rule.validate(5, ctx)).isValid).toBe(true);
    expect((await rule.validate(4, ctx)).isValid).toBe(false);
  });

  it('creates max rule', async () => {
    const rule = ValidationRules.max(10);
    expect((await rule.validate(10, ctx)).isValid).toBe(true);
    expect((await rule.validate(11, ctx)).isValid).toBe(false);
  });

  it('creates range rule', async () => {
    const rule = ValidationRules.range(1, 10);
    expect((await rule.validate(5, ctx)).isValid).toBe(true);
    expect((await rule.validate(0, ctx)).isValid).toBe(false);
    expect((await rule.validate(11, ctx)).isValid).toBe(false);
  });
});
