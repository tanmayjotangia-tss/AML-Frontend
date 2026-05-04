import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomerInvestigationService } from '../../../../core/services/customer-investigation.service';
import { CustomerProfileResponseDto, TransactionSummaryDto, KycStatus, CustomerType } from '../../../../core/models/customer.model';
import { Page } from '../../../../core/models/tenant.model';

@Component({
  selector: 'app-customer-investigation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customer-investigation.html',
  styleUrl: './customer-investigation.css',
})
export class CustomerInvestigation implements OnInit {
  private customerService = inject(CustomerInvestigationService);
  private cdr = inject(ChangeDetectorRef);

  // List View State
  customers: CustomerProfileResponseDto[] = [];
  totalCustomers = 0;
  currentPage = 0;
  pageSize = 10;
  loadingList = false;
  listError: string | null = null;

  // Search
  searchQuery = '';

  // Detail View State
  selectedCustomer: CustomerProfileResponseDto | null = null;
  loadingDetail = false;
  detailError: string | null = null;

  // Transactions
  transactions: TransactionSummaryDto[] = [];
  txnPage = 0;
  txnTotalPages = 0;
  loadingTxns = false;

  // Linked Accounts
  linkedAccounts: string[] = [];
  loadingLinks = false;

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.loadingList = true;
    this.customerService.getAllCustomers(this.currentPage, this.pageSize).subscribe({
      next: (res) => {
        this.customers = res.data?.content || [];
        this.totalCustomers = res.data?.totalElements || 0;
        this.loadingList = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.listError = 'Failed to load customers directory.';
        this.loadingList = false;
        this.cdr.detectChanges();
      }
    });
  }

  selectCustomer(customer: CustomerProfileResponseDto): void {
    this.selectedCustomer = null; // Clear old
    this.loadingDetail = true;
    this.detailError = null;

    this.customerService.getCustomer360(customer.accountNumber).subscribe({
      next: (res) => {
        this.selectedCustomer = res.data || null;
        this.loadingDetail = false;
        this.loadTransactions(customer.accountNumber);
        this.loadLinks(customer.accountNumber);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.detailError = 'Failed to load forensic 360 view.';
        this.loadingDetail = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadTransactions(accountNo: string, page: number = 0): void {
    this.loadingTxns = true;
    this.txnPage = page;
    this.customerService.getTransactionHistory(accountNo, page, 10).subscribe({
      next: (res) => {
        this.transactions = res.data?.content || [];
        this.txnTotalPages = res.data?.totalPages || 0;
        this.loadingTxns = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingTxns = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadLinks(accountNo: string): void {
    this.loadingLinks = true;
    this.customerService.getLinkedAccounts(accountNo).subscribe({
      next: (res) => {
        this.linkedAccounts = res.data || [];
        this.loadingLinks = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingLinks = false;
        this.cdr.detectChanges();
      }
    });
  }

  closeDetail(): void {
    this.selectedCustomer = null;
    this.transactions = [];
    this.linkedAccounts = [];
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.loadCustomers();
  }

  getRiskClass(rating: string): string {
    const r = rating?.toUpperCase();
    if (r === 'HIGH' || r === 'CRITICAL') return 'risk-high';
    if (r === 'MEDIUM') return 'risk-medium';
    return 'risk-low';
  }

  getKycClass(status: KycStatus): string {
    if (status === KycStatus.VERIFIED) return 'kyc-verified';
    if (status === KycStatus.PENDING) return 'kyc-pending';
    if (status === KycStatus.EXPIRED) return 'kyc-expired';
    return 'kyc-failed';
  }

  formatDate(ts?: string): string {
    if (!ts) return '—';
    return new Date(ts).toLocaleDateString('en-IN', { dateStyle: 'medium' });
  }

  formatCurrency(amt: number, cur: string): string {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: cur }).format(amt);
  }
}
