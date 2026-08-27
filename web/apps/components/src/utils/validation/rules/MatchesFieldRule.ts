import {
  ValidationContext,
  ValidationResult,
  ValidationRule,
  ValidationState,
} from './ValidationRule';

export class MatchesFieldRule implements ValidationRule {
  constructor(private fieldName: string) {}

  getPriority(): number {
    return 1;
  }
  getName(): string {
    return 'matches-field-' + this.fieldName;
  }
  async validate(value: unknown, context: ValidationContext): Promise<ValidationState> {
    const otherValue = context.formData[this.fieldName];
    if (value === otherValue) {
      return ValidationResult.valid();
    } else {
      return ValidationResult.invalid({
        ruleName: this.getName(),
        message: `The value does not match the value of field ${this.fieldName}.`,
        i18nKey: 'validation.matchesField',
      });
    }
  }
}
