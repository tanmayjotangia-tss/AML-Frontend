import { Component, OnInit, inject, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IngestionService } from '../../../core/services/ingestion.service';
import {
  TransactionBatchResponseDto,
  BatchFileType,
  BatchStatus
} from '../../../core/models/ingestion.model';

type ActiveTab = 'UPLOAD' | 'HISTORY';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './upload.html',
  styleUrl: './upload.css',
})
export class Upload implements OnInit {
  private ingestionService = inject(IngestionService);
  private cdr = inject(ChangeDetectorRef);

  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

  activeTab: ActiveTab = 'UPLOAD';

  // Upload state
  selectedFileType: BatchFileType = 'TRANSACTION';
  selectedFile: File | null = null;
  isDragOver = false;
  isUploading = false;
  uploadSuccess: TransactionBatchResponseDto | null = null;
  uploadError: string | null = null;

  // History state
  batches: TransactionBatchResponseDto[] = [];
  historyFileType: BatchFileType | '' = '';
  isLoadingHistory = false;
  historyError: string | null = null;
  currentPage = 0;
  totalPages = 0;
  totalElements = 0;
  pageSize = 10;

  // Detail modal
  selectedBatch: TransactionBatchResponseDto | null = null;
  isLoadingDetail = false;

  // Polling
  private pollingIntervals = new Map<string, ReturnType<typeof setInterval>>();

  ngOnInit(): void {
    this.loadHistory();
  }

  // ─── Tab ─────────────────────────────────────────────────────────────────────

  setTab(tab: ActiveTab): void {
    this.activeTab = tab;
    if (tab === 'HISTORY') this.loadHistory();
  }

  // ─── Upload ───────────────────────────────────────────────────────────────────

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(): void {
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    const file = event.dataTransfer?.files[0];
    if (file) this.setFile(file);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) this.setFile(input.files[0]);
  }

  // Validation constants
  private readonly REQUIRED_HEADERS: Record<BatchFileType, string[]> = {
    TRANSACTION: [
      'transactionRef', 'originatorAccountNo', 'originatorName', 'originatorBankCode', 'originatorCountry',
      'beneficiaryAccountNo', 'beneficiaryName', 'beneficiaryBankCode', 'beneficiaryCountry',
      'amount', 'currencyCode', 'transactionType', 'channel', 'transactionTimestamp', 'referenceNote', 'status'
    ],
    CUSTOMER_PROFILE: [
      'accountNumber', 'customerName', 'customerType', 'idType', 'idNumber', 'nationality',
      'countryOfResidence', 'monthlyIncome', 'netWorth', 'riskRating', 'riskScore',
      'isPep', 'isDormant', 'accountOpenedOn', 'lastActivityDate', 'kycStatus'
    ]
  };

  private setFile(file: File): void {
    if (!file.name.endsWith('.csv')) {
      this.uploadError = 'Only CSV files are accepted.';
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const firstLine = content.split('\n')[0]?.trim();
      
      if (!firstLine) {
        this.uploadError = 'The file appears to be empty.';
        this.selectedFile = null;
        this.cdr.detectChanges();
        return;
      }

      const headers = firstLine.split(',').map(h => h.trim());
      const required = this.REQUIRED_HEADERS[this.selectedFileType];
      
      // Case-insensitive comparison for better UX, but matching the exact strings provided
      const missing = required.filter(req => !headers.some(h => h.toLowerCase() === req.toLowerCase()));

      if (missing.length > 0) {
        this.uploadError = `Invalid CSV headers for ${this.selectedFileType.replace('_', ' ')}. Missing: ${missing.join(', ')}`;
        this.selectedFile = null;
      } else {
        this.selectedFile = file;
        this.uploadError = null;
        this.uploadSuccess = null;
      }
      this.cdr.detectChanges();
    };
    reader.readAsText(file);
  }

  onFileTypeChange(): void {
    if (this.selectedFile) {
      // Re-validate existing file with new type
      this.setFile(this.selectedFile);
    }
  }

  clearFile(): void {
    this.selectedFile = null;
    this.uploadSuccess = null;
    this.uploadError = null;
    if (this.fileInputRef) this.fileInputRef.nativeElement.value = '';
  }

  triggerFileInput(): void {
    this.fileInputRef?.nativeElement.click();
  }

  uploadFile(): void {
    if (!this.selectedFile || this.isUploading) return;
    this.isUploading = true;
    this.uploadError = null;
    this.uploadSuccess = null;

    this.ingestionService.uploadBatchFile(this.selectedFile, this.selectedFileType).subscribe({
      next: (res) => {
        this.uploadSuccess = res.data;
        this.isUploading = false;
        this.selectedFile = null;
        if (this.fileInputRef) this.fileInputRef.nativeElement.value = '';
        this.loadHistory();
        if (res.data?.id) this.pollBatchStatus(res.data.id);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.uploadError = err?.error?.message || 'Upload failed. Please try again.';
        this.isUploading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ─── History ──────────────────────────────────────────────────────────────────

  loadHistory(): void {
    this.isLoadingHistory = true;
    this.historyError = null;
    const fileType = this.historyFileType || undefined;

    this.ingestionService.getAllBatches(fileType as BatchFileType | undefined, this.currentPage, this.pageSize).subscribe({
      next: (res) => {
        this.batches = res.data?.content || [];
        this.totalPages = res.data?.totalPages || 0;
        this.totalElements = res.data?.totalElements || 0;
        this.isLoadingHistory = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.historyError = 'Failed to load batch history.';
        this.isLoadingHistory = false;
        this.cdr.detectChanges();
      }
    });
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.loadHistory();
  }

  applyFilter(): void {
    this.currentPage = 0;
    this.loadHistory();
  }

  // ─── Detail Modal ─────────────────────────────────────────────────────────────

  openDetail(batch: TransactionBatchResponseDto): void {
    this.selectedBatch = batch;
    this.isLoadingDetail = true;
    this.ingestionService.getBatchStatus(batch.id).subscribe({
      next: (res) => { this.selectedBatch = res.data; this.isLoadingDetail = false; this.cdr.detectChanges(); },
      error: () => { this.isLoadingDetail = false; this.cdr.detectChanges(); }
    });
  }

  closeDetail(): void {
    this.selectedBatch = null;
  }

  // ─── Polling ──────────────────────────────────────────────────────────────────

  private pollBatchStatus(batchId: string): void {
    const interval = setInterval(() => {
      this.ingestionService.getBatchStatus(batchId).subscribe({
        next: (res) => {
          if (!res.data) return;
          
          // Update in history list
          const idx = this.batches.findIndex(b => b.id === batchId);
          if (idx >= 0) { 
            this.batches[idx] = res.data; 
          }
          
          // Update the upload result card
          if (this.uploadSuccess?.id === batchId) { 
            this.uploadSuccess = res.data; 
          }
          
          this.cdr.detectChanges();

          const status = res.data.batchStatus;
          if (status === 'PROCESSED' || status === 'FAILED') {
            clearInterval(interval);
            this.pollingIntervals.delete(batchId);
            console.log(`Polling finished for batch ${batchId}: ${status}`);
          }
        },
        error: (err) => {
          console.error('Polling error:', err);
          // Optional: clear interval on persistent errors
        }
      });
    }, 3000);
    this.pollingIntervals.set(batchId, interval);
    // Auto-stop after 5 minutes
    setTimeout(() => { clearInterval(interval); this.pollingIntervals.delete(batchId); }, 300_000);
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────────

  getStatusClass(status: BatchStatus): string {
    const map: Record<BatchStatus, string> = {
      PENDING:   'bg-slate-100 text-slate-600',
      PROCESSED: 'bg-green-100 text-green-700',
      FAILED:    'bg-red-100 text-red-700',
    };
    return map[status] || 'bg-slate-100 text-slate-600';
  }

  getStatusIcon(status: BatchStatus): string {
    const icons: Record<BatchStatus, string> = {
      PENDING:   '⏳',
      PROCESSED: '✅',
      FAILED:    '❌',
    };
    return icons[status] || '•';
  }

  formatFileSize(bytes: number): string {
    if (!bytes) return '—';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }

  formatDate(ts?: string): string {
    if (!ts) return '—';
    return new Date(ts).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  }

  getFileTypeLabel(ref: string): string {
    if (!ref) return '—';
    if (ref.startsWith('CUST-')) return 'Customer Profile';
    if (ref.startsWith('TXN-')) return 'Transaction';
    return ref;
  }

  getFileTypeIcon(ref: string): string {
    if (ref?.startsWith('CUST-')) return '👤';
    if (ref?.startsWith('TXN-')) return '💳';
    return '📄';
  }

  parseFailureDetails(raw?: string): string {
    if (!raw) return '';
    try { return JSON.stringify(JSON.parse(raw), null, 2); }
    catch { return raw; }
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }
}
