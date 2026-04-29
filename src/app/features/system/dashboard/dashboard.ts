import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlatformDashboardService } from '../../../core/services/platform-dashboard.service';
import { PlatformDashboardStats } from '../../../core/models/platform-dashboard.model';
import { TenantResponseDto } from '../../../core/models/tenant.model';
import { Router } from '@angular/router';
import { TenantDetailComponent } from '../tenants/components/tenant-detail/tenant-detail.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, TenantDetailComponent],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class Dashboard implements OnInit {
  private dashboardService = inject(PlatformDashboardService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  stats: PlatformDashboardStats = {
    totalTenants: 0,
    activeTenants: 0,
    totalRules: 0,
    totalScenarios: 0,
    systemHealth: 0
  };

  recentTenants: TenantResponseDto[] = [];
  isLoading = true;
  error = '';
  today = new Date();
  viewingTenant?: TenantResponseDto;

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.error = '';

    this.dashboardService.getDashboardDetails().subscribe({
      next: (res) => {
        if (res.data) {
          this.stats = res.data.stats;
          this.recentTenants = res.data.recentTenants;
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading dashboard data:', err);
        this.error = 'Failed to load dashboard statistics.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Redirection methods for buttons
  navigateToTenants(): void {
    this.router.navigate(['/system/tenants']);
  }

  navigateToRuleEngine(tab?: string): void {
    const extras = tab ? { queryParams: { tab } } : {};
    this.router.navigate(['/system/rule-engine'], extras);
  }

  navigateToReports(): void {
    this.router.navigate(['/system/reports']);
  }


  viewTenantDetail(tenant: TenantResponseDto): void {
    this.viewingTenant = tenant;
    this.cdr.detectChanges();
  }

  closeTenantDetail(): void {
    this.viewingTenant = undefined;
    this.cdr.detectChanges();
  }
}
