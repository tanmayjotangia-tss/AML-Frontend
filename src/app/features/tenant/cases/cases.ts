import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CaseService } from '../../../core/services/case.service';
import { CaseResponseDto } from '../../../core/models/case.model';

import { TokenService } from '../../../core/auth/token';
import { Role } from '../../../core/models/user.model';

@Component({
  selector: 'app-cases',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cases.html',
  styleUrl: './cases.css',
})
export class Cases implements OnInit {
  private caseService = inject(CaseService);
  private tokenService = inject(TokenService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  allCases: CaseResponseDto[] = [];
  cases: CaseResponseDto[] = [];
  loading = false;
  error: string | null = null;
  userRole: string | null = null;
  userId: string | null = null;
  userCode: string | null = null;

  // Pagination
  currentPage = 0;
  totalPages = 0;
  totalElements = 0;
  pageSize = 15;

  ngOnInit(): void {
    this.userRole = this.tokenService.getRole();
    this.userId = this.tokenService.getUserId();
    this.userCode = this.tokenService.getUsername();
    this.loadCases();
  }

  loadCases(): void {
    this.loading = true;
    const currentRole = this.tokenService.getRole();
    const currentUserId = this.tokenService.getUserId();
    const currentUserCode = this.tokenService.getUsername();
    
    this.caseService.getCases(this.currentPage, this.pageSize).subscribe({
      next: (res) => {
        const rawContent = res.data?.content || [];
        
        if (currentRole === Role.COMPLIANCE_OFFICER) {
          this.cases = rawContent.filter(c => {
            const matchesId = c.assignedTo === currentUserId;
            const matchesCode = c.assignedTo === currentUserCode;
            return matchesId || matchesCode;
          });
          this.totalElements = this.cases.length;
        } else {
          this.cases = rawContent;
          this.totalElements = res.data?.totalElements || 0;
        }

        this.totalPages = res.data?.totalPages || 0;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load cases';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  openCase(caseRef: string): void {
    this.router.navigate(['/tenant/cases', caseRef]);
  }

  getPriorityClass(priority: string): string {
    const map: Record<string, string> = {
      CRITICAL: 'bg-red-100 text-red-700',
      HIGH: 'bg-orange-100 text-orange-700',
      MEDIUM: 'bg-amber-100 text-amber-700',
      LOW: 'bg-emerald-100 text-emerald-700',
    };
    return map[priority] || 'bg-slate-100 text-slate-700';
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      OPEN: 'bg-blue-100 text-blue-700',
      IN_PROGRESS: 'bg-purple-100 text-purple-700',
      ESCALATED: 'bg-orange-100 text-orange-700',
      CLOSED_STR: 'bg-slate-800 text-white',
      CLOSED_NO_ACTION: 'bg-slate-100 text-slate-500',
    };
    return map[status] || 'bg-slate-100 text-slate-700';
  }

  formatDate(ts?: string): string {
    if (!ts) return '—';
    return new Date(ts).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.loadCases();
  }

  get pages(): number[] {
    const total = Math.min(this.totalPages, 10);
    return Array.from({ length: total }, (_, i) => i);
  }
}
