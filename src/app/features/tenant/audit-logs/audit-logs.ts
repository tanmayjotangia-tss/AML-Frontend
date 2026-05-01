import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuditLogService } from '../../../core/services/audit-log.service';
import { TenantAuditLog } from '../../../core/models/audit-log.model';

@Component({
  selector: 'app-tenant-audit-logs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './audit-logs.html',
  styleUrl: './audit-logs.css',
})
export class AuditLogs implements OnInit {
  private auditLogService = inject(AuditLogService);
  private cdr = inject(ChangeDetectorRef);

  logs: TenantAuditLog[] = [];
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

    this.auditLogService.getAuditLogs<TenantAuditLog>(this.currentPage, this.pageSize).subscribe({
      next: (res) => {
        this.logs = res.data?.content || [];
        this.totalPages = res.data?.totalPages || 0;
        this.totalElements = res.data?.totalElements || 0;
        this.loading = false;
        this.expandedLogId = null;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loadError = err?.error?.message || 'Failed to load audit logs.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  toggleExpand(logId: string): void {
    this.expandedLogId = this.expandedLogId === logId ? null : logId;
  }

  changePage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadLogs();
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

  formatDate(ts?: string): string {
    if (!ts) return '—';
    return new Date(ts).toLocaleString('en-IN', { 
      dateStyle: 'medium', 
      timeStyle: 'medium' 
    });
  }

  isUuid(value: any): boolean {
    if (typeof value !== 'string') return false;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
  }

  getNonNullNonUuidEntries(obj: any): { key: string, value: any }[] {
    if (!obj || typeof obj !== 'object') return [];
    
    // List of keys to explicitly exclude if they are UUIDs or redundant
    const excludeKeys = ['id', 'actorId', 'targetEntityId', 'sysCreatedAt', 'prevState', 'nextState', 'ipAddress'];
    
    return Object.entries(obj)
      .filter(([key, value]) => {
        return value !== null && 
               value !== undefined && 
               !excludeKeys.includes(key) && 
               !this.isUuid(value);
      })
      .map(([key, value]) => ({ 
        key: this.formatKey(key), 
        value: typeof value === 'object' ? JSON.stringify(value, null, 2) : value 
      }));
  }

  formatKey(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .replace(/State$/, ' State');
  }

  formatJson(json: any): string {
    if (!json) return '';
    if (typeof json === 'string') {
        try {
            return JSON.stringify(JSON.parse(json), null, 2);
        } catch (e) {
            return json;
        }
    }
    return JSON.stringify(json, null, 2);
  }
}
