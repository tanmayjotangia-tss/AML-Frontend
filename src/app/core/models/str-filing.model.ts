// ─── STR Filing Models ────────────────────────────────────────────────────────

// ─── Request DTOs ─────────────────────────────────────────────────────────────

export interface StrFilingRequestDto {
  regulatoryBody: string;
  suspicionNarrative: string;
}

// ─── Response DTOs ────────────────────────────────────────────────────────────

export interface StrCustomerDto {
  id: string;
  accountNumber: string;
  customerName: string;
  riskRating: string;
}

export interface StrLinkedTransactionDto {
  id: string;
  transactionReference: string;
  amount: number;
  currency: string;
  transactionTimestamp: string;
  transactionType: string;
  originatorAccount: string;
  beneficiaryAccount: string;
}

export interface StrFilingResponseDto {
  id: string;
  caseId: string;
  filingReference: string;
  regulatoryBody: string;
  ruleType: string;
  typologyTriggered: string;
  suspicionNarrative: string;
  filedBy: string;
  sysCreatedAt: string;
  customer?: StrCustomerDto;
  transactions?: StrLinkedTransactionDto[];
}
