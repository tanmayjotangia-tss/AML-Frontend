import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TransactionInvestigationService } from '../../../../core/services/transaction-investigation.service';
import { TransactionResponseDto, TransactionStatus, TransactionType } from '../../../../core/models/transaction.model';

@Component({
  selector: 'app-transaction-investigation',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './transaction-investigation.html',
  styleUrl: './transaction-investigation.css',
})
export class TransactionInvestigation implements OnInit {
  private transactionService = inject(TransactionInvestigationService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  transactions: TransactionResponseDto[] = [];
  loading = false;
  loadError: string | null = null;

  currentPage = 0;
  totalPages = 0;
  totalElements = 0;
  pageSize = 20;

  expandedTxnId: string | null = null;

  ngOnInit(): void {
    this.loadTransactions();
  }

  loadTransactions(): void {
    this.loading = true;
    this.loadError = null;

    this.transactionService.getAllTransactions(this.currentPage, this.pageSize).subscribe({
      next: (res) => {
        this.transactions = res.data?.content || [];
        this.totalPages = res.data?.totalPages || 0;
        this.totalElements = res.data?.totalElements || 0;
        this.loading = false;
        this.expandedTxnId = null;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loadError = err?.error?.message || 'Failed to load transaction data.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  toggleExpand(txnId: string): void {
    this.expandedTxnId = this.expandedTxnId === txnId ? null : txnId;
  }

  changePage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadTransactions();
    }
  }

  get pages(): number[] {
    const maxPages = 5;
    let startPage = Math.max(0, this.currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPages);
    
    if (endPage - startPage < maxPages) {
      startPage = Math.max(0, endPage - maxPages);
    }
    
    const pages = [];
    for (let i = startPage; i < endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  getNonNullNonUuidEntries(obj: any): { key: string, value: any }[] {
    if (!obj || typeof obj !== 'object') return [];
    
    // List of keys to explicitly exclude (UUIDs and redundant fields)
    const excludeKeys = ['id', 'customerId', 'sysCreatedAt'];
    
    return Object.entries(obj)
      .filter(([key, value]) => {
        return value !== null && 
               value !== undefined && 
               !excludeKeys.includes(key) && 
               !this.isUuid(value);
      })
      .map(([key, value]) => ({ 
        key: this.formatKey(key), 
        value: value 
      }));
  }

  isUuid(value: any): boolean {
    if (typeof value !== 'string') return false;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
  }

  formatKey(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase());
  }

  formatDate(ts?: string): string {
    if (!ts) return '—';
    return new Date(ts).toLocaleString('en-IN', { 
      dateStyle: 'medium', 
      timeStyle: 'medium' 
    });
  }

  formatCurrency(amt: number, cur: string): string {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: cur 
    }).format(amt);
  }

  getStatusClass(status: TransactionStatus): string {
    const map: Record<string, string> = {
      CLEAN: 'status-clean',
      FLAGGED: 'status-flagged',
      UNDER_REVIEW: 'status-under-review'
    };
    return map[status] || '';
  }

  getTypeClass(type: TransactionType): string {
    return 'type-default';
  }

  goToUpload(): void {
    this.router.navigate(['/tenant/upload']);
  }
}
