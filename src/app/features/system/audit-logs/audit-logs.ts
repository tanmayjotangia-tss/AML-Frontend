import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuditLogService } from '../../../core/services/audit-log.service';
import { PlatformAuditLog } from '../../../core/models/audit-log.model';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './audit-logs.html',
  styleUrl: './audit-logs.css',
})
export class AuditLogs implements OnInit {
  private auditLogService = inject(AuditLogService);
  private cdr = inject(ChangeDetectorRef);

  logs: PlatformAuditLog[] = [];
  loading = false;
  loadError: string | null = null;

  currentPage = 0;
  totalPages = 0;
  totalElements = 0;
  pageSize = 20;

  expandedLogId: string | null = null;

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(): void {
    this.loading = true;
    this.loadError = null;

    this.auditLogService.getAuditLogs(this.currentPage, this.pageSize).subscribe({
      next: (res) => {
        this.logs = res.data?.content || [];
        this.totalPages = res.data?.totalPages || 0;
        this.totalElements = res.data?.totalElements || 0;
        this.loading = false;
        this.expandedLogId = null; // Reset expansion on page load
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loadError = err?.error?.message || 'Failed to load audit logs.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  toggleExpand(logId?: string): void {
    if (!logId) return;
    this.expandedLogId = this.expandedLogId === logId ? null : logId;
  }

  changePage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadLogs();
    }
  }

  get pages(): number[] {
    const total = Math.min(this.totalPages, 10);
    return Array.from({ length: total }, (_, i) => i);
  }

  formatDate(ts?: string): string {
    if (!ts) return '—';
    return new Date(ts).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  }
}
