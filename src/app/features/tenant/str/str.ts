import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StrFilingService } from '../../../core/services/str-filing.service';
import { CaseService } from '../../../core/services/case.service';
import { TokenService } from '../../../core/auth/token';
import { StrFilingResponseDto } from '../../../core/models/str-filing.model';
import { TenantUserService } from '../../../core/services/tenant-user.service';
import { TenantUserResponseDto, Role } from '../../../core/models/user.model';

@Component({
  selector: 'app-str',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './str.html',
  styleUrl: './str.css',
})
export class Str implements OnInit {
  private strFilingService = inject(StrFilingService);
  private caseService = inject(CaseService);
  private tenantUserService = inject(TenantUserService);
  private tokenService = inject(TokenService);
  private cdr = inject(ChangeDetectorRef);

  filings: StrFilingResponseDto[] = [];
  users: TenantUserResponseDto[] = [];
  loading = false;
  error: string | null = null;

  // Detail Modal
  selectedFiling: StrFilingResponseDto | null = null;
  loadingDetail = false;
  detailError: string | null = null;

  ngOnInit(): void {
    this.loadFilings();
    this.loadUsers();
  }

  loadUsers(): void {
    this.tenantUserService.listUsers(undefined, 0, 100).subscribe({
      next: (res) => {
        this.users = res.data?.content || [];
        this.cdr.detectChanges();
      }
    });
  }

  getUserName(userId: string | undefined): string {
    if (!userId) return '—';
    const user = this.users.find(u => u.id === userId || u.employeeId === userId);
    return user ? user.fullName : userId;
  }

  loadFilings(page: number = 0): void {
    this.loading = true;
    this.strFilingService.getFilings(page, 100).subscribe({
      next: (res) => {
        // Flexible handling: check if data is an array or has a content property
        const data = res.data as any;
        if (Array.isArray(data)) {
          this.filings = data;
        } else if (data && data.content && Array.isArray(data.content)) {
          this.filings = data.content;
        } else {
          this.filings = [];
        }
        
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load STR filings';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  openFilingDetail(filing: StrFilingResponseDto): void {
    this.selectedFiling = filing;
    this.loadingDetail = false;
    this.cdr.detectChanges();
  }

  closeDetailModal(): void {
    this.selectedFiling = null;
    this.loadingDetail = false;
    this.detailError = null;
    this.cdr.detectChanges();
  }

  downloadPdf(filingId: string): void {
    this.strFilingService.downloadPdf(filingId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `STR-Report-${filingId.substring(0, 8)}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    });
  }

  formatDate(ts?: string): string {
    if (!ts) return '—';
    return new Date(ts).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  }
}
