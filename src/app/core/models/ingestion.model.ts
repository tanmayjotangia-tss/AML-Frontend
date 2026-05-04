
export type BatchFileType = 'CUSTOMER_PROFILE' | 'TRANSACTION';

export type BatchStatus = 'PENDING' | 'PROCESSED' | 'FAILED';

export type CustomerType = 'INDIVIDUAL' | 'CORPORATE';

export type KycStatus = 'VERIFIED' | 'PENDING' | 'EXPIRED';

export type TransactionType = 'CASH' | 'TRANSFER' | 'NEFT' | 'RTGS' | 'IMPS' | 'CARD' | 'CHEQUE' | 'DEPOSIT' | 'WITHDRAWAL';

export type Channel = 'ATM' | 'MOBILE' | 'ONLINE' | 'BRANCH' | 'CASH' | 'POS' | 'INTERNET_BANKING' | 'UPI';

export type TransactionStatus = 'CLEAN' | 'FLAGGED' | 'UNDER_REVIEW';

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

export interface BatchUploadResult {
  batch: TransactionBatchResponseDto;
  fileType: BatchFileType;
}
