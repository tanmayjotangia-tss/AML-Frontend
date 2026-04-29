import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TenantDashboardService } from '../../../core/services/tenant-dashboard.service';
import { TenantDashboardResponseDto } from '../../../core/models/tenant-dashboard.model';
import { CaseResponseDto } from '../../../core/models/case.model';
import { AlertResponseDto } from '../../../core/models/alert.model';
import { Role } from '../../../core/models/user.model';
import { TokenService } from '../../../core/auth/token';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private dashboardService = inject(TenantDashboardService);
  private tokenService = inject(TokenService);
  private cdr = inject(ChangeDetectorRef);
  public router = inject(Router);

  dashboardData: TenantDashboardResponseDto | null = null;
  loading = true;
  error: string | null = null;
  userRole: string | null = null;
  readonly Role = Role;

  ngOnInit(): void {
    this.userRole = this.tokenService.getRole();
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.cdr.detectChanges();
    this.dashboardService.getDashboardData().subscribe({
      next: (res) => {
        this.dashboardData = res.data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Failed to load dashboard statistics';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  viewCase(caseRef: string): void {
    this.router.navigate(['/tenant/cases', caseRef]);
  }

  viewAlerts(): void {
    this.router.navigate(['/tenant/alerts']);
  }

  formatDate(dateStr: string | undefined): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  getStatusClass(status: string): string {
    return status.toLowerCase().replace('_', '-');
  }

  getPriorityClass(priority: string): string {
    return priority.toLowerCase();
  }
}
