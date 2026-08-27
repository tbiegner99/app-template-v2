import {
  ValidationContext,
  ValidationResult,
  ValidationRule,
  ValidationState,
} from './ValidationRule';

export class RegexRule implements ValidationRule {
  private messageI18nKey: string;
  private message: string;
  private name: string;
  constructor(
    private pattern: RegExp,
    options: {
      messageI18nKey?: string;
      message?: string;
      name?: string;
    } = {},
  ) {
    this.messageI18nKey = options.messageI18nKey || 'validation.regex';
    this.message = options.message || 'The value does not match the required pattern.';
    this.name = options.name || 'regex';
  }

  getPriority(): number {
    return 1;
  }
  getName(): string {
    return this.name;
  }
  async validate(value: unknown, _context: ValidationContext): Promise<ValidationState> {
    if (typeof value !== 'string') {
      return ValidationResult.valid();
    }
    if (this.pattern.test(value)) {
      return ValidationResult.valid();
    } else {
      return ValidationResult.invalid({
        ruleName: this.getName(),
        message: this.message,
        i18nKey: this.messageI18nKey,
      });
    }
  }
}
