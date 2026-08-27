import {
  ValidationContext,
  ValidationResult,
  ValidationRule,
  ValidationState,
} from './ValidationRule';

export class MinLengthRule implements ValidationRule {
  constructor(private minLength: number) {}

  getName(): string {
    return 'min-length';
  }

  getPriority(): number {
    return 1;
  }

  async validate(
    value: string | Array<unknown>,
    _context: ValidationContext,
  ): Promise<ValidationState> {
    if (
      value === null ||
      value === undefined ||
      (typeof value !== 'string' && !Array.isArray(value))
    ) {
      return ValidationResult.valid();
    }
    if (value.length >= this.minLength) {
      return ValidationResult.valid();
    }
    return ValidationResult.invalid({
      ruleName: this.getName(),
      message: `The length must be at least ${this.minLength}.`,
      i18nKey: 'validation.minLength',
    });
  }
}

export class MaxLengthRule implements ValidationRule {
  constructor(private maxLength: number) {}

  getName(): string {
    return 'max-length';
  }

  getPriority(): number {
    return 1;
  }

  async validate(
    value: string | Array<unknown>,
    _context: ValidationContext,
  ): Promise<ValidationState> {
    if (
      value === null ||
      value === undefined ||
      (typeof value !== 'string' && !Array.isArray(value))
    ) {
      return ValidationResult.valid();
    }
    if (value.length <= this.maxLength) {
      return ValidationResult.valid();
    }
    return ValidationResult.invalid({
      ruleName: this.getName(),
      message: `The length must be at most ${this.maxLength}.`,
      i18nKey: 'validation.maxLength',
    });
  }
}

export class LengthRangeRule implements ValidationRule {
  constructor(private min: number, private max: number) {}
  getPriority(): number {
    return 1;
  }
  getName(): string {
    return 'length-range';
  }
  async validate(
    value: string | Array<unknown>,
    context: ValidationContext,
  ): Promise<ValidationState> {
    const min = new MinLengthRule(this.min);
    const max = new MaxLengthRule(this.max);
    const minState = await min.validate(value, context);
    if (!minState.isValid) {
      return minState;
    }
    const maxState = await max.validate(value, context);
    if (!maxState.isValid) {
      return maxState;
    }
    return ValidationResult.valid();
  }
}
