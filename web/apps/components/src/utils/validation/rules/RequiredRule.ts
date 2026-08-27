import {
  ValidationContext,
  ValidationResult,
  ValidationRule,
  ValidationState,
} from './ValidationRule';

export class RequiredRule implements ValidationRule {
  getPriority(): number {
    return 0;
  }
  getName(): string {
    return 'required';
  }
  async validate(value: unknown, _context: ValidationContext): Promise<ValidationState> {
    if (value === null || value === undefined || value === '') {
      return ValidationResult.invalid({
        ruleName: this.getName(),
        message: 'This field is required.',
        i18nKey: 'validation.required',
      });
    }
    return ValidationResult.valid();
  }
}
