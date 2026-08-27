import { describe, it, expect } from 'vitest';
import { ValidationResult } from './ValidationRule';

describe('ValidationResult', () => {
  describe('valid()', () => {
    it('returns isValid=true with no errors', () => {
      const result = ValidationResult.valid();
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.error).toBeUndefined();
    });
  });

  describe('invalid()', () => {
    it('returns isValid=false with the error', () => {
      const error = { ruleName: 'required', message: 'Required', i18nKey: 'validation.required' };
      const result = ValidationResult.invalid(error);
      expect(result.isValid).toBe(false);
      expect(result.error).toEqual(error);
      expect(result.errors).toHaveLength(1);
    });
  });

  describe('combineStates()', () => {
    it('returns valid when all states are valid', () => {
      const combined = ValidationResult.combineStates([
        ValidationResult.valid(),
        ValidationResult.valid(),
      ]);
      expect(combined.isValid).toBe(true);
      expect(combined.errors).toHaveLength(0);
    });

    it('returns invalid when any state is invalid, first error wins', () => {
      const e1 = { ruleName: 'required', message: 'Required', i18nKey: 'v.required' };
      const e2 = { ruleName: 'email', message: 'Bad email', i18nKey: 'v.email' };
      const combined = ValidationResult.combineStates([
        ValidationResult.invalid(e1),
        ValidationResult.invalid(e2),
      ]);
      expect(combined.isValid).toBe(false);
      expect(combined.error).toEqual(e1);
      expect(combined.errors).toHaveLength(2);
    });
  });
});
