export enum RuleStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED'
}

export interface TenantScenarioResponseDto {
  id: string;
  globalScenarioId: string;
  status: RuleStatus;
  sysActivatedBy?: string;
  sysCreatedAt?: string;
  sysUpdatedAt?: string;
}

export interface TenantRuleResponseDto {
  id: string;
  tenantScenarioId: string;
  globalRuleId: string;
  ruleCode: string;
  ruleName: string;
  active: boolean;         // Backend serializes Java's `isActive` boolean field as `active`
  isActive?: boolean;      // Alias kept for compatibility during transition
  sysCreatedBy?: string;
  sysCreatedAt?: string;
  sysUpdatedAt?: string;
  sysIsDeleted?: boolean;
  sysDeletedAt?: string;
}

export interface TenantRuleThresholdResponseDto {
  id: string;
  tenantRuleId: string;
  globalConditionId: string;
  overrideValue?: string;
  overrideLookbackPeriod?: string;
  overrideAggregationFunction?: string;
}

export interface TenantScenarioWithRulesDto {
  scenario: TenantScenarioResponseDto;
  rules: TenantRuleResponseDto[];
}

export interface UpdateTenantRuleRequestDto {
  ruleName: string;
  isActive: boolean;
}

export interface CreateTenantRuleThresholdRequestDto {
  tenantRuleCode: string;
  globalConditionCode: string;
  overrideValue?: string;
  overrideLookbackPeriod?: string;
}

export interface UpdateTenantRuleThresholdRequestDto {
  overrideValue?: string;
  overrideLookbackPeriod?: string;
  overrideAggregationFunction?: string;
}

export interface GlobalScenarioResponseDto {
  id: string;
  scenarioName: string;
  category: string;
  description?: string;
  isActive?: boolean;
  sysIsDeleted?: boolean;
  sysCreatedAt?: string;
  sysUpdatedAt?: string;
}

// ─── Scenario Execution ───────────────────────────────────────────────────────

export interface ScenarioExecutionRequestDto {
  globalLookbackStart?: string; // ISO-8601 timestamp (FORENSIC mode)
  globalLookbackEnd?: string;   // ISO-8601 timestamp (FORENSIC mode)
}

export interface RuleBreachCustomer {
  id: string;
  accountNumber?: string;
  customerName?: string;
  riskRating?: string;
  riskScore?: number;
  kycStatus?: string;
}

export interface RuleBreachTransaction {
  id: string;
  transactionRef?: string;
  amount?: number;
  currencyCode?: string;
  transactionTimestamp?: string;
}

export interface RuleBreachResult {
  ruleType?: string;
  ruleLabel?: string;
  customer?: RuleBreachCustomer;
  transactions?: RuleBreachTransaction[];
}

export interface ScenarioExecutionSummary {
  tenantScenarioId: string;
  executionTimestamp: string;
  executionMode: 'LIVE' | 'FORENSIC';
  timeWindowStart?: string;
  timeWindowEnd?: string;
  totalBreachesFound: number;
  breaches: RuleBreachResult[];
  processingTimeMs: number;
  status: string;
}
