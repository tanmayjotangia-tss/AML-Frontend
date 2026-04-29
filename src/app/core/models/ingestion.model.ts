// ─── Enums ───────────────────────────────────────────────────────────────────

export type BatchFileType = 'CUSTOMER_PROFILE' | 'TRANSACTION';

export type BatchStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'PARTIAL';

export type CustomerType = 'INDIVIDUAL' | 'CORPORATE' | 'JOINT' | 'TRUST';

export type KycStatus = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'EXPIRED';

export type TransactionType = 'CREDIT' | 'DEBIT' | 'TRANSFER' | 'PAYMENT' | 'WITHDRAWAL' | 'DEPOSIT';

export type Channel = 'BRANCH' | 'ATM' | 'ONLINE' | 'MOBILE' | 'POS' | 'SWIFT';

export type TransactionStatus = 'CLEAN' | 'FLAGGED' | 'SUSPICIOUS' | 'BLOCKED';

// ─── Batch DTOs ───────────────────────────────────────────────────────────────

export interface TransactionBatchResponseDto {
  id: string;
  batchReference: string;
  uploadedBy: string;
  fileName: string;
  fileHashSha256: string;
  fileSizeBytes: number;
  cloudinaryPublicId?: string;
  cloudinarySecureUrl?: string;
  totalRecords?: number;
  batchStatus: BatchStatus;
  failureDetails?: string;
  springBatchJobId?: string;
  processedAt?: string;
  sysCreatedAt?: string;
  sysUpdatedAt?: string;
}

// ─── Customer Profile DTOs ────────────────────────────────────────────────────

export interface CustomerProfileResponseDto {
  id: string;
  accountNumber: string;
  customerName: string;
  customerType: CustomerType;
  nationality?: string;
  countryOfResidence?: string;
  riskRating: string;
  riskScore?: number;
  isPep: boolean;
  isDormant: boolean;
  accountOpenedOn: string;
  lastActivityDate?: string;
  kycStatus: KycStatus;
  kycDocumentUrl?: string;
}

// ─── Transaction DTOs ─────────────────────────────────────────────────────────

export interface TransactionResponseDto {
  id: string;
  batchId: string;
  customerId?: string;
  transactionRef: string;
  originatorAccountNo?: string;
  originatorName?: string;
  originatorBankCode?: string;
  originatorCountry?: string;
  beneficiaryAccountNo?: string;
  beneficiaryName?: string;
  beneficiaryBankCode?: string;
  beneficiaryCountry?: string;
  amount: number;
  currencyCode: string;
  transactionType: TransactionType;
  channel: Channel;
  transactionTimestamp: string;
  referenceNote?: string;
  status: TransactionStatus;
  sysCreatedAt?: string;
}

export interface TransactionSummaryDto {
  transactionId: string;
  transactionRef: string;
  amount: number;
  currency: string;
  txnDate: string;
  txnType: string;
}

// ─── Upload Result ────────────────────────────────────────────────────────────

export interface BatchUploadResult {
  batch: TransactionBatchResponseDto;
  fileType: BatchFileType;
}
