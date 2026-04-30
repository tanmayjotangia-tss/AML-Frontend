import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertService } from '../../../core/services/alert.service';
import { CaseService } from '../../../core/services/case.service';
import { TokenService } from '../../../core/auth/token';
import {
  AlertResponseDto,
  AlertDetailResponseDto,
  AlertSeverity,
  AlertStatus,
  SeverityCounts
} from '../../../core/models/alert.model';

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './alerts.html',
  styleUrl: './alerts.css',
})
export class Alerts implements OnInit {
  private alertService = inject(AlertService);
  private caseService = inject(CaseService);
  private tokenService = inject(TokenService);
  private cdr = inject(ChangeDetectorRef);

  // ─── List State ────────────────────────────────────────────────────────────
  alerts: AlertResponseDto[] = [];
  loading = false;
  loadError: string | null = null;

  // ─── Filter State ──────────────────────────────────────────────────────────
  filterSeverity: AlertSeverity | '' = '';
  filterStatus: AlertStatus | '' = '';
  filterFrom = '';
  filterTo = '';

  // ─── Pagination ────────────────────────────────────────────────────────────
  currentPage = 0;
  totalPages = 0;
  totalElements = 0;
  pageSize = 15;

  // ─── Severity Counts (stats bar) ───────────────────────────────────────────
  severityCounts: Partial<SeverityCounts> = {};

  // ─── Selection ─────────────────────────────────────────────────────────────
  selectedAlertIds = new Set<string>();

  // ─── Create Case Modal ─────────────────────────────────────────────────────
  showCreateCaseModal = false;
  casePriority = 'MEDIUM';
  caseAssignee = ''; // employee ID
  isCreatingCase = false;

  // ─── Detail Modal ──────────────────────────────────────────────────────────
  selectedAlert: AlertDetailResponseDto | null = null;
  loadingDetail = false;

  // ─── Close Modal ───────────────────────────────────────────────────────────
  showCloseModal = false;
  closingAlertId: string | null = null;
  closeResolution: AlertStatus = 'CLOSED_FALSE_POSITIVE';
  closeComment = '';
  isClosing = false;

  ngOnInit(): void {
    this.caseAssignee = this.tokenService.getUsername() || '';
    this.loadAlerts();
    this.loadSeverityCounts();
  }

  // ─── Data Loading ───────────────────────────────────────────────────────────

  loadAlerts(): void {
    this.loading = true;
    this.loadError = null;
    this.alertService.getAlerts(
      this.filterSeverity || undefined,
      this.filterStatus || undefined,
      this.filterFrom || undefined,
      this.filterTo || undefined,
      this.currentPage,
      this.pageSize
    ).subscribe({
      next: (res) => {
        this.alerts = res.data?.content || [];
        this.totalPages = res.data?.totalPages || 0;
        this.totalElements = res.data?.totalElements || 0;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loadError = err?.error?.message || 'Failed to load alerts.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadSeverityCounts(): void {
    this.alertService.getSeverityCounts().subscribe({
      next: (res) => {
        this.severityCounts = res.data || {};
        this.cdr.detectChanges();
      },
      error: () => { }
    });
  }

  // ─── Filter / Pagination ───────────────────────────────────────────────────

  applyFilters(): void {
    this.currentPage = 0;
    this.loadAlerts();
  }

  resetFilters(): void {
    this.filterSeverity = '';
    this.filterStatus = '';
    this.filterFrom = '';
    this.filterTo = '';
    this.currentPage = 0;
    this.loadAlerts();
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.loadAlerts();
  }

  get pages(): number[] {
    const total = Math.min(this.totalPages, 10);
    return Array.from({ length: total }, (_, i) => i);
  }

  // ─── Detail Modal ───────────────────────────────────────────────────────────

  openDetail(alert: AlertResponseDto): void {
    this.loadingDetail = true;
    this.selectedAlert = null;
    this.alertService.getAlertDetail(alert.id).subscribe({
      next: (res) => {
        this.selectedAlert = res.data;
        this.loadingDetail = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingDetail = false;
        this.cdr.detectChanges();
      }
    });
  }

  closeDetailModal(): void {
    this.selectedAlert = null;
    this.loadingDetail = false;
  }

  // ─── Close Alert ────────────────────────────────────────────────────────────

  openCloseModal(alertId: string): void {
    this.closingAlertId = alertId;
    this.closeResolution = 'CLOSED_FALSE_POSITIVE';
    this.closeComment = '';
    this.showCloseModal = true;
  }

  dismissCloseModal(): void {
    this.showCloseModal = false;
    this.closingAlertId = null;
  }

  submitClose(): void {
    if (!this.closingAlertId || this.isClosing) return;
    this.isClosing = true;
    this.alertService.closeAlert(this.closingAlertId, this.closeResolution, this.closeComment).subscribe({
      next: () => {
        this.isClosing = false;
        this.showCloseModal = false;
        this.closingAlertId = null;
        // Update the alert in the list
        const idx = this.alerts.findIndex(a => a.id === this.closingAlertId);
        if (idx >= 0) this.alerts[idx].status = this.closeResolution;
        this.loadAlerts();
        if (this.selectedAlert?.alert?.id === this.closingAlertId) {
          this.selectedAlert = null;
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isClosing = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────

  getSeverityConfig(severity: string): { cls: string; dot: string; label: string } {
    const map: Record<string, { cls: string; dot: string; label: string }> = {
      CRITICAL: { cls: 'badge-critical', dot: 'dot-critical', label: 'Critical' },
      HIGH: { cls: 'badge-high', dot: 'dot-high', label: 'High' },
      MEDIUM: { cls: 'badge-medium', dot: 'dot-medium', label: 'Medium' },
      LOW: { cls: 'badge-low', dot: 'dot-low', label: 'Low' },
    };
    return map[severity] || { cls: 'badge-low', dot: 'dot-low', label: severity };
  }

  getStatusConfig(status: AlertStatus): { cls: string; label: string } {
    const map: Record<AlertStatus, { cls: string; label: string }> = {
      NEW: { cls: 'status-new', label: 'New' },
      UNDER_REVIEW: { cls: 'status-review', label: 'Under Review' },
      ESCALATED: { cls: 'status-escalated', label: 'Escalated' },
      CLOSED_CONFIRMED: { cls: 'status-confirmed', label: 'Confirmed' },
      CLOSED_FALSE_POSITIVE: { cls: 'status-false-pos', label: 'False Positive' },
      BUNDLED_TO_CASE: { cls: 'status-review', label: 'Bundled' },
    };
    return map[status] || { cls: 'status-new', label: status };
  }

  isCloseable(status: AlertStatus): boolean {
    return status === 'NEW' || status === 'UNDER_REVIEW' || status === 'ESCALATED';
  }

  formatDate(ts?: string): string {
    if (!ts) return '—';
    return new Date(ts).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  }

  formatAmount(amount?: number, currency?: string): string {
    if (amount == null) return '—';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  }

  getSeverityCount(severity: AlertSeverity): number {
    return (this.severityCounts as Record<string, number>)[severity] || 0;
  }

  // ─── Bundling ──────────────────────────────────────────────────────────────

  toggleSelection(alertId: string): void {
    if (this.selectedAlertIds.has(alertId)) {
      this.selectedAlertIds.delete(alertId);
    } else {
      const alertItem = this.alerts.find(a => a.id === alertId);
      if (!alertItem) return;

      const currentCustomerId = this.getSelectedCustomerId();
      if (currentCustomerId && alertItem.customer?.id !== currentCustomerId) {
        window.alert('Invalid operation: You cannot bundle alerts from different customers into a single case.');
        return;
      }
      this.selectedAlertIds.add(alertId);
    }
    this.cdr.detectChanges();
  }

  toggleAll(event: any): void {
    if (event.target.checked) {
      if (this.alerts.length === 0) return;

      const currentCustomerId = this.getSelectedCustomerId() || this.alerts[0].customer?.id;

      // Select only alerts matching the first customer found
      const mismatch = this.alerts.some(a => a.customer?.id !== currentCustomerId);
      if (mismatch && this.selectedAlertIds.size === 0) {
        // If nothing was selected and page has mixed customers, just select the first customer's alerts
        this.alerts.filter(a => a.customer?.id === currentCustomerId).forEach(a => this.selectedAlertIds.add(a.id));
        window.alert('Some alerts were skipped as they belong to different customers.');
      } else if (mismatch && this.selectedAlertIds.size > 0) {
        // If something was already selected, only select matching ones from the page
        this.alerts.filter(a => a.customer?.id === currentCustomerId).forEach(a => this.selectedAlertIds.add(a.id));
        window.alert('Only alerts for the currently selected customer were added.');
      } else {
        // All match
        this.alerts.forEach(a => this.selectedAlertIds.add(a.id));
      }
    } else {
      this.selectedAlertIds.clear();
    }
    this.cdr.detectChanges();
  }

  getSelectedCustomerId(): string | null {
    if (this.selectedAlertIds.size === 0) return null;
    const firstId = Array.from(this.selectedAlertIds)[0];
    const alert = this.alerts.find(a => a.id === firstId);
    return alert?.customer?.id || null;
  }

  openCreateCase(): void {
    if (this.selectedAlertIds.size === 0) return;
    this.showCreateCaseModal = true;
  }

  submitCreateCase(): void {
    if (!this.caseAssignee || this.isCreatingCase) return;

    this.isCreatingCase = true;
    const selectedRefs = this.alerts
      .filter(a => this.selectedAlertIds.has(a.id))
      .map(a => a.alertReference);

    const dto = {
      alertReferences: selectedRefs,
      assigneeUserCode: this.caseAssignee,
      priority: this.casePriority
    };

    this.caseService.createCase(dto).subscribe({
      next: () => {
        window.alert('Case created successfully');
        this.isCreatingCase = false;
        this.showCreateCaseModal = false;
        this.selectedAlertIds.clear();
        this.loadAlerts();
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        window.alert(err?.error?.message || 'Failed to create case');
        this.isCreatingCase = false;
        this.cdr.detectChanges();
      }
    });
  }
}
