import { EmailRule } from './EmailRule';
import { LengthRangeRule, MaxLengthRule, MinLengthRule } from './LengthRule';
import { MaxRule, MinRule, RangeRule } from './RangeRule';
import { RegexRule } from './RegexRule';
import { RequiredRule } from './RequiredRule';

export interface ValidationError {
  ruleName: string;
  message: string;
  i18nKey: string;
}

export interface ValidationState {
  isValid: boolean;
  error?: ValidationError;
  errors: Array<ValidationError>;
}

export class ValidationResult {
  static valid(): ValidationState {
    return {
      isValid: true,
      errors: [],
    };
  }

  static invalid(error: ValidationError): ValidationState {
    return {
      isValid: false,
      error,
      errors: [error],
    };
  }

  static combineStates(states: ValidationState[]): ValidationState {
    let isValid = true;
    const errors: Array<ValidationError> = [];
    for (const state of states) {
      isValid = state.isValid && isValid;
      errors.push(...state.errors);
    }
    return {
      isValid,
      error: isValid ? undefined : errors[0],
      errors: errors,
    };
  }
}

export interface ValidationContext {
  formData: Record<string, unknown>;
}

export interface ValidationRule {
  getPriority(): number;
  getName(): string;
  validate(value: unknown, context: ValidationContext): Promise<ValidationState>;
}
export class ValidationRules {
  static required(): ValidationRule {
    return new RequiredRule();
  }
  static regex(
    pattern: RegExp,
    options?: {
      messageI18nKey?: string;
      message?: string;
      name?: string;
    },
  ): ValidationRule {
    return new RegexRule(pattern, options);
  }

  static email(): ValidationRule {
    return new EmailRule();
  }

  static minLength(length: number): ValidationRule {
    return new MinLengthRule(length);
  }
  static maxLength(length: number): ValidationRule {
    return new MaxLengthRule(length);
  }
  static lengthRange(min: number, max: number): ValidationRule {
    return new LengthRangeRule(min, max);
  }
  static min(min: number | string): ValidationRule {
    return new MinRule(min);
  }
  static max(max: number | string): ValidationRule {
    return new MaxRule(max);
  }
  static range(min: number | string, max: number | string): ValidationRule {
    return new RangeRule(min, max);
  }
}
