import { AlertResponseDto } from './alert.model';

// ─── Enums ───────────────────────────────────────────────────────────────────

export enum CaseStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  ESCALATED = 'ESCALATED',
  CLOSED_STR = 'CLOSED_STR',
  CLOSED_NO_ACTION = 'CLOSED_NO_ACTION'
}

export enum CasePriority {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
}

export enum ClosureDisposition {
  STR_FILED = 'STR_FILED',
  FALSE_POSITIVE = 'FALSE_POSITIVE',
  INCONCLUSIVE = 'INCONCLUSIVE'
}

export enum NoteType {
  OBSERVATION = 'OBSERVATION',
  EVIDENCE = 'EVIDENCE',
  RATIONALE = 'RATIONALE'
}

export enum EscalationStatus {
  PENDING = 'PENDING',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  RESOLVED = 'RESOLVED'
}

// ─── Request DTOs ─────────────────────────────────────────────────────────────

export interface CreateCaseRequest {
  alertReferences: string[];
  assigneeUserCode: string; // Employee ID
  priority: string;
}

export interface ReassignCaseRequest {
  newAssigneeUserCode: string; // Employee ID
  reason: string;
}

export interface FalsePositiveClosureRequest {
  rationale: string;
}

export interface StrClosureRequest {
  filingId: string;
}

export interface EscalationRequestDto {
  escalatedTo: string; // UUID
  escalationReason: string;
}

export interface CaseNoteRequestDto {
  noteType: NoteType;
  noteContent: string;
}

// ─── Response DTOs ────────────────────────────────────────────────────────────

export interface CaseCustomerDto {
  id: string;
  accountNumber: string;
  customerName: string;
  riskRating: string;
}

export interface LinkedTransactionDto {
  id: string;
  transactionReference: string;
  amount: number;
  currency: string;
  transactionTimestamp: string;
  transactionType: string;
  originatorAccount: string;
  beneficiaryAccount: string;
}

export interface CaseResponseDto {
  id: string;
  caseReference: string;
  status: string;
  priority: string;
  aggregatedRiskScore: number;
  assignedTo: string;
  openedAt: string;
  ruleType?: string;
  typologyTriggered?: string;
  hasInvestigationNote?: boolean;
  filingId?: string;
  filingReference?: string;
  customer?: CaseCustomerDto;
  customerProfile?: CaseCustomerDto;
  transactions?: LinkedTransactionDto[];
}

export interface CaseNoteResponseDto {
  id: string;
  caseId: string;
  authoredBy: string;
  noteType: NoteType;
  noteContent: string;
  sysCreatedAt: string;
}

export interface CaseEscalationResponseDto {
  id: string;
  caseId: string;
  escalatedBy: string;
  escalatedTo: string;
  escalationReason: string;
  escalationStatus: EscalationStatus;
  acknowledgedAt?: string;
  resolvedAt?: string;
  sysCreatedAt: string;
  sysUpdatedAt: string;
}

export interface CaseAuditTrailResponseDto {
  id: string;
  caseId: string;
  actorId: string;
  eventType: string;
  eventMetadata: string; // JSON string from backend
  ipAddress?: string;
  sysCreatedAt: string;
}

export interface CaseAssignmentResponseDto {
  id: string;
  caseId: string;
  assignedFrom?: string;
  assignedTo: string;
  assignedBy: string;
  assignmentReason?: string;
  sysCreatedAt: string;
}

export interface CaseAlertLinkResponseDto {
  id: string;
  caseId: string;
  alertId: string;
  linkedBy: string;
  isPrimaryAlert: boolean;
  sysCreatedAt: string;
}
