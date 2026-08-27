import {
  ValidationContext,
  ValidationResult,
  ValidationRule,
  ValidationState,
} from './ValidationRule';

export class EmailRule implements ValidationRule {
  constructor() {}

  getPriority(): number {
    return 1;
  }

  getName(): string {
    return 'email';
  }

  async validate(value: unknown, _context: ValidationContext): Promise<ValidationState> {
    if (typeof value !== 'string') {
      return ValidationResult.valid();
    }
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (emailPattern.test(value)) {
      return ValidationResult.valid();
    } else {
      return ValidationResult.invalid({
        ruleName: this.getName(),
        message: 'The value is not a valid email address.',
        i18nKey: 'validation.email',
      });
    }
  }
}
