export enum TransactionType {
    CREDIT = 'CREDIT',
    DEBIT = 'DEBIT',
    TRANSFER = 'TRANSFER'
}

export enum Channel {
    ATM = 'ATM',
    ONLINE = 'ONLINE',
    BRANCH = 'BRANCH',
    MOBILE = 'MOBILE',
    SWIFT = 'SWIFT'
}

export enum TransactionStatus {
    COMPLETED = 'COMPLETED',
    PENDING = 'PENDING',
    FAILED = 'FAILED',
    FLAGGED = 'FLAGGED'
}

export interface TransactionResponseDto {
    id: string;
    customerId: string;
    transactionRef: string;
    originatorAccountNo: string;
    originatorName: string;
    originatorBankCode: string;
    originatorCountry: string;
    beneficiaryAccountNo: string;
    beneficiaryName: string;
    beneficiaryBankCode: string;
    beneficiaryCountry: string;
    amount: number;
    currencyCode: string;
    transactionType: TransactionType;
    channel: Channel;
    transactionTimestamp: string;
    referenceNote?: string;
    status: TransactionStatus;
    sysCreatedAt: string;
}
