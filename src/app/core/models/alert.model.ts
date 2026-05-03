export type AlertSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type AlertStatus =
  | 'NEW'
  | 'UNDER_REVIEW'
  | 'ESCALATED'
  | 'BUNDLED_TO_CASE'
  | 'CLOSED_CONFIRMED'
  | 'CLOSED_FALSE_POSITIVE';

export type InvolvementRole = 'TRIGGER' | 'CONTRIBUTOR';


export interface AlertCustomerSummary {
  id: string;
  accountNumber?: string;
  customerName?: string;
  riskRating?: string;
  riskScore?: number;
  kycStatus?: string;
  isPep?: boolean;
  isDormant?: boolean;
}

export interface AlertResponseDto {
  id: string;
  alertReference: string;
  severity: AlertSeverity;
  status: AlertStatus;
  ruleType?: string;
  typologyTriggered?: string;
  riskScore?: number;
  tenantScenarioId?: string;
  globalScenarioId?: string;
  globalRuleId?: string;
  tenantRuleId?: string;
  customer?: AlertCustomerSummary;
  customerProfile?: AlertCustomerSummary;
  sysCreatedAt?: string;
  sysUpdatedAt?: string;
}


export interface AlertEvidenceResponseDto {
  id: string;
  alertId: string;
  attributeName: string;
  aggregationFunction: string;
  operator: string;
  thresholdApplied: string;
  actualEvaluatedValue: string;
  sysCreatedAt?: string;
}


export interface AlertTransactionSummaryDto {
  transactionId: string;
  transactionRef?: string;
  amount?: number;
  currency?: string;
  transactionTimestamp?: string;
  transactionType?: string;
  role?: InvolvementRole;
}


export interface AlertDetailResponseDto {
  alert: AlertResponseDto;
  evidences: AlertEvidenceResponseDto[];
  linkedTransactions: AlertTransactionSummaryDto[];
}


export type SeverityCounts = Record<AlertSeverity, number>;

export interface AlertFilterState {
  severity?: AlertSeverity | '';
  status?: AlertStatus | '';
  from?: string;
  to?: string;
}
