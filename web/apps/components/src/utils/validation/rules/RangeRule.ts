import {
  ValidationContext,
  ValidationResult,
  ValidationRule,
  ValidationState,
} from './ValidationRule';

export class MinRule implements ValidationRule {
  constructor(private min: number | string) {}
  getPriority(): number {
    return 1;
  }
  getName(): string {
    return 'min';
  }
  async validate(value: number | string, _context: ValidationContext): Promise<ValidationState> {
    if (
      value === null ||
      value === undefined ||
      (typeof value !== 'number' && typeof value !== 'string')
    ) {
      return ValidationResult.valid();
    }
    if (value >= this.min) {
      return ValidationResult.valid();
    }
    return ValidationResult.invalid({
      ruleName: this.getName(),
      message: `The value must be greater than or equal to ${this.min}.`,
      i18nKey: 'validation.min',
    });
  }
}

export class MaxRule implements ValidationRule {
  constructor(private max: number | string) {}
  getPriority(): number {
    return 1;
  }
  getName(): string {
    return 'max';
  }
  async validate(value: number | string, _context: ValidationContext): Promise<ValidationState> {
    if (
      value === null ||
      value === undefined ||
      (typeof value !== 'number' && typeof value !== 'string')
    ) {
      return ValidationResult.valid();
    }
    if (value <= this.max) {
      return ValidationResult.valid();
    }
    return ValidationResult.invalid({
      ruleName: this.getName(),
      message: `The value must be less than or equal to ${this.max}.`,
      i18nKey: 'validation.max',
    });
  }
}

export class RangeRule implements ValidationRule {
  constructor(private min: number | string, private max: number | string) {}
  getPriority(): number {
    return 1;
  }
  getName(): string {
    return 'range';
  }
  async validate(value: string | number, _context: ValidationContext): Promise<ValidationState> {
    const min = new MinRule(this.min);
    const max = new MaxRule(this.max);
    const minState = await min.validate(value, _context);
    if (!minState.isValid) {
      return minState;
    }
    const maxState = await max.validate(value, _context);
    if (!maxState.isValid) {
      return maxState;
    }
    return ValidationResult.valid();
  }
}
