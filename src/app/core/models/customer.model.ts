import { AlertResponseDto } from './alert.model';
import { CaseResponseDto } from './case.model';

export enum CustomerType {
    INDIVIDUAL = 'INDIVIDUAL',
    CORPORATE = 'CORPORATE'
}

export enum KycStatus {
    VERIFIED = 'VERIFIED',
    PENDING = 'PENDING',
    REJECTED = 'REJECTED',
    EXPIRED = 'EXPIRED'
}

export interface CustomerProfileResponseDto {
    id: string;
    accountNumber: string;
    customerName: string;
    customerType: CustomerType;
    nationality: string;
    countryOfResidence: string;
    riskRating: string;
    riskScore: number;
    isPep: boolean;
    isDormant: boolean;
    accountOpenedOn: string;
    lastActivityDate: string;
    kycStatus: KycStatus;
    kycDocumentUrl?: string;
    recentAlerts?: AlertResponseDto[];
    recentCases?: CaseResponseDto[];
}

export interface TransactionSummaryDto {
    transactionId: string;
    transactionRef: string;
    amount: number;
    currency: string;
    txnDate: string;
    txnType: string;
}
