import {
  ValidationContext,
  ValidationResult,
  ValidationRule,
  ValidationState,
} from './rules/ValidationRule';

export class Validator {
  async validate(
    value: unknown,
    rules: ValidationRule[],
    context: ValidationContext,
  ): Promise<ValidationState> {
    if (rules.length === 0) {
      return ValidationResult.valid();
    }
    const groupByPriority = this.partitionRulesByPriority(rules);
    const state: ValidationState = ValidationResult.valid();
    for (const group of groupByPriority) {
      const states = await Promise.all(group.map((rule) => rule.validate(value, context)));
      const combinedState = ValidationResult.combineStates(states);
      if (!combinedState.isValid) {
        return combinedState;
      }
    }
    return state;
  }
  private partitionRulesByPriority(rules: ValidationRule[]): ValidationRule[][] {
    const sortedRules = rules.sort((a, b) => a.getPriority() - b.getPriority());
    const groupByPriority: ValidationRule[][] = [];
    let currentGroup: ValidationRule[] = [];
    let currentPriority = null;
    for (const rule of sortedRules) {
      const priority = rule.getPriority();
      if (priority !== currentPriority && currentGroup.length > 0) {
        groupByPriority.push(currentGroup);
        currentGroup = [];
        currentPriority = priority;
      }
      currentGroup.push(rule);
    }
    if (currentGroup.length > 0) {
      groupByPriority.push(currentGroup);
    }
    return groupByPriority;
  }
}
