export interface GlobalRuleResponseDto {
  id: string;
  ruleName: string;
  ruleType: string;
  severity: string; // AlertSeverity enum
  baseRiskScore: number;
  sysCreatedAt?: string;
  sysUpdatedAt?: string;
}

export interface CreateGlobalScenarioRequestDto {
  scenarioName: string;
  category: string;
  description?: string;
}

export interface UpdateGlobalScenarioRequestDto {
  scenarioName: string;
  category: string;
  description?: string;
}

export interface GlobalScenarioResponseDto {
  id: string;
  scenarioName: string;
  category: string;
  description?: string;
  createdBy?: string;
  sysCreatedAt?: string;
  sysUpdatedAt?: string;
}

export interface CreateGlobalScenarioRuleRequestDto {
  scenarioId: string;
  ruleId: string;
  isActive: boolean;
  priorityOrder: number;
}

export interface UpdateGlobalScenarioRuleRequestDto {
  isActive: boolean;
  priorityOrder: number;
}

export interface GlobalScenarioRuleResponseDto {
  id: string;
  scenarioId: string;
  ruleId: string;
  isActive: boolean;
  priorityOrder: number;
  sysCreatedAt?: string;
}

// We will also need a composite model for the UI to display the rule details inside the scenario
export interface MappedRuleDisplay {
  mappingId: string;
  ruleId: string;
  ruleName: string;
  ruleType: string;
  severity: string;
  baseRiskScore: number;
}
export interface GlobalRuleConditionResponseDto {
  id: string;
  conditionCode: string;
  ruleId: string;
  attributeName: string;
  thresholdValue: string;
  lookbackPeriod: string;
  valueDataType: string;
  sysCreatedAt?: string;
  sysUpdatedAt?: string;
}
