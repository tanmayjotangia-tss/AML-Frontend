export enum TransactionType {
    CASH = 'CASH',
    TRANSFER = 'TRANSFER',
    NEFT = 'NEFT',
    RTGS = 'RTGS',
    IMPS = 'IMPS',
    CARD = 'CARD',
    CHEQUE = 'CHEQUE',
    DEPOSIT = 'DEPOSIT',
    WITHDRAWAL = 'WITHDRAWAL'
}

export enum Channel {
    ATM = 'ATM',
    MOBILE = 'MOBILE',
    ONLINE = 'ONLINE',
    BRANCH = 'BRANCH',
    CASH = 'CASH',
    POS = 'POS',
    INTERNET_BANKING = 'INTERNET_BANKING',
    UPI = 'UPI'
}

export enum TransactionStatus {
    CLEAN = 'CLEAN',
    FLAGGED = 'FLAGGED',
    UNDER_REVIEW = 'UNDER_REVIEW'
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
