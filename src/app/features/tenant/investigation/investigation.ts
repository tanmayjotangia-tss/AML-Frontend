import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CaseService } from '../../../core/services/case.service';
import { TokenService } from '../../../core/auth/token';
import { CaseResponseDto, CaseStatus } from '../../../core/models/case.model';
import { Role } from '../../../core/models/user.model';

@Component({
  selector: 'app-investigation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './investigation.html',
  styleUrl: './investigation.css',
})
export class Investigation implements OnInit {
  private caseService = inject(CaseService);
  private tokenService = inject(TokenService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  activeCases: CaseResponseDto[] = [];
  loading = false;
  error: string | null = null;
  userRole: string | null = null;
  userId: string | null = null;

  ngOnInit(): void {
    this.userRole = this.tokenService.getRole();
    this.userId = this.tokenService.getUserId();
    this.loadActiveInvestigations();
  }

  loadActiveInvestigations(): void {
    this.loading = true;
    this.caseService.getCases(0, 100).subscribe({
      next: (res) => {
        const rawContent = res.data?.content || [];

        // Filter for active investigations (In Progress or Escalated)
        const activeStatuses = [CaseStatus.IN_PROGRESS, CaseStatus.ESCALATED, CaseStatus.OPEN];

        let filtered = rawContent.filter(c => activeStatuses.includes(c.status as CaseStatus));

        // For Compliance Officer, further filter by assignment
        if (this.userRole === Role.COMPLIANCE_OFFICER) {
          const currentUserCode = this.tokenService.getUsername();
          filtered = filtered.filter(c =>
            c.assignedTo === this.userId || c.assignedTo === currentUserCode
          );
        }

        this.activeCases = filtered;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load investigations';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  goToCase(caseRef: string): void {
    this.router.navigate(['/tenant/cases', caseRef]);
  }

  getPriorityClass(priority: string): string {
    const map: Record<string, string> = {
      CRITICAL: 'priority-critical',
      HIGH: 'priority-high',
      MEDIUM: 'priority-medium',
      LOW: 'priority-low',
    };
    return map[priority] || '';
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      OPEN: 'status-open',
      IN_PROGRESS: 'status-progress',
      ESCALATED: 'status-escalated',
    };
    return map[status] || '';
  }

  formatDate(ts?: string): string {
    if (!ts) return '—';
    return new Date(ts).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  }
}
