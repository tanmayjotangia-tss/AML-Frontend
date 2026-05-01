import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CaseService } from '../../../../core/services/case.service';
import { StrFilingService } from '../../../../core/services/str-filing.service';
import { AlertService } from '../../../../core/services/alert.service';
import { TenantUserService } from '../../../../core/services/tenant-user.service';
import { 
  CaseResponseDto, 
  CaseNoteResponseDto, 
  CaseAuditTrailResponseDto,
  NoteType,
  CaseStatus,
  CasePriority
} from '../../../../core/models/case.model';
import { AlertResponseDto, AlertDetailResponseDto } from '../../../../core/models/alert.model';
import { StrFilingResponseDto } from '../../../../core/models/str-filing.model';
import { Role, TenantUserResponseDto } from '../../../../core/models/user.model';

import { TokenService } from '../../../../core/auth/token';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-case-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './case-detail.html',
  styleUrl: './case-detail.css',
})
export class CaseDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private caseService = inject(CaseService);
  private strFilingService = inject(StrFilingService);
  private alertService = inject(AlertService);
  private tenantUserService = inject(TenantUserService);
  private tokenService = inject(TokenService);
  private toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  caseRef: string | null = null;
  caseData: CaseResponseDto | null = null;
  linkedAlerts: AlertResponseDto[] = [];
  auditTrail: CaseAuditTrailResponseDto[] = [];
  userId: string | null = null;
  userCode: string | null = null;
  
  loading = false;
  error: string | null = null;

  get canPerformAction(): boolean {
    if (!this.caseData) return false;
    const status = this.caseData.status;

    if (status.startsWith('CLOSED')) return false;
    
    const isAssignee = this.caseData.assignedTo === this.userId || this.caseData.assignedTo === this.userCode;
    return isAssignee;
  }

  get canEscalate(): boolean {
    if (!this.caseData || this.isClosed) return false;
    
    // Cannot escalate an already escalated case
    if (this.caseData.status === 'ESCALATED') return false;
    
    // Authority to escalate is tied to being the assignee
    return this.canPerformAction;
  }

  get canReassign(): boolean {
    if (!this.caseData) return false;
    const userRole = this.tokenService.getRole();
    const status = this.caseData.status;

    // No reassignment if closed or escalated
    if (status.startsWith('CLOSED') || status === 'ESCALATED') return false;

    // Admin can reassign if case is OPEN (unassigned)
    if (userRole === Role.BANK_ADMIN || userRole === Role.SUPER_ADMIN) {
      if (status === 'OPEN') return true;
    }

    // Current assignee can always reassign/delegate
    const isAssignee = this.caseData.assignedTo === this.userId || this.caseData.assignedTo === this.userCode;
    return isAssignee;
  }

  getActionTooltip(): string {
    if (this.canPerformAction) return '';
    const status = this.caseData?.status;
    if (status?.startsWith('CLOSED')) return 'Actions are disabled for closed cases';
    
    const userRole = this.tokenService.getRole();
    if (userRole === Role.BANK_ADMIN) return 'Bank Administrators have read-only access to cases';
    
    if (this.caseData && !this.hasNotes && !status?.startsWith('CLOSED')) {
       const isAssignee = this.caseData.assignedTo === this.userId || this.caseData.assignedTo === this.userCode;
       if (isAssignee) return 'Add at least one investigation note before closing';
    }
    
    return 'Only the assigned Compliance Officer can perform investigative actions';
  }

  get isBankAdmin(): boolean {
    return this.tokenService.getRole() === Role.BANK_ADMIN;
  }

  get isClosed(): boolean {
    return !!this.caseData?.status.startsWith('CLOSED');
  }

  get hasNotes(): boolean {
    if (this.caseData?.hasInvestigationNote) return true;
    // Fallback: check if any NOTE_ADDED event exists in audit trail
    return this.auditTrail.some(t => t.eventType === 'NOTE_ADDED');
  }

  // ─── Investigation State ───────────────────────────────────────────────────
  activeTab: 'ALERTS' | 'AUDIT' | 'TIMELINE' = 'ALERTS';
  newNoteContent = '';
  newNoteType: NoteType = NoteType.OBSERVATION;
  isAddingNote = false;
  isExporting = false;

  // ─── Action Modals ─────────────────────────────────────────────────────────
  showReassignModal = false;
  reassignAssignee = '';
  reassignReason = '';
  isReassigning = false;
  availableComplianceOfficers: TenantUserResponseDto[] = [];

  showEscalateModal = false;
  escalateTo = '';
  escalateReason = '';
  isEscalating = false;
  availableEscalationUsers: TenantUserResponseDto[] = [];

  showCloseModal = false;
  closeType: 'FALSE_POSITIVE' | 'STR' = 'FALSE_POSITIVE';
  closeRationale = '';
  closeFilingId = '';
  isClosing = false;

  // ─── STR Filing Form ──────────────────────────────────────────────────────
  strRegulatoryBody = 'FIU_IND';
  strSuspicionNarrative = '';
  strFilingResult: StrFilingResponseDto | null = null;
  strFilingSuccess = false;
  strFilingError: string | null = null;

  getAssignedToName(): string {
    if (!this.caseData?.assignedTo) return 'Unassigned';
    
    // Check reassign list
    const officer = this.availableComplianceOfficers.find(u => 
      u.id === this.caseData!.assignedTo || u.employeeId === this.caseData!.assignedTo
    );
    if (officer) return officer.fullName;

    // Check escalation list
    const escUser = this.availableEscalationUsers.find(u => 
      u.id === this.caseData!.assignedTo || u.employeeId === this.caseData!.assignedTo
    );
    if (escUser) return escUser.fullName;

    return this.caseData.assignedTo; // Fallback to UUID
  }

  // ─── Alert Detail Modal ──────────────────────────────────────────────────
  selectedAlertDetail: AlertDetailResponseDto | null = null;
  loadingAlertDetail = false;

  ngOnInit(): void {
    this.userId = this.tokenService.getUserId();
    this.userCode = this.tokenService.getUsername();
    this.caseRef = this.route.snapshot.paramMap.get('caseRef');
    if (this.caseRef) {
      this.loadCaseDetails();
    }
    this.loadUsersForActions();
  }

  loadUsersForActions(): void {
    // Load Compliance Officers for Reassign
    this.tenantUserService.listUsers(Role.COMPLIANCE_OFFICER, 0, 100).subscribe({
      next: (res) => {
        this.availableComplianceOfficers = res.data?.content || [];
        this.cdr.detectChanges();
      }
    });

    // Load All (Compliance + Admin) for Escalate
    this.tenantUserService.listUsers(undefined, 0, 100).subscribe({
      next: (res) => {
        this.availableEscalationUsers = res.data?.content.filter(u => 
          u.role === Role.COMPLIANCE_OFFICER || u.role === Role.BANK_ADMIN
        ) || [];
        this.cdr.detectChanges();
      }
    });
  }

  loadCaseDetails(): void {
    if (!this.caseRef) return;
    this.loading = true;
    this.caseService.getCaseDetails(this.caseRef).subscribe({
      next: (res) => {
        this.caseData = res.data;
        if (this.caseData) {
          this.loadLinkedAlerts(this.caseData.id);
          this.loadAuditTrail(this.caseData.id);
          // Mark investigation as opened if it's the first time
          if (this.userId && this.isValidUuid(this.userId)) {
            this.caseService.openCaseInvestigation(this.caseData.id, this.userId).subscribe({
              error: () => console.warn('Failed to auto-open investigation status')
            });
          }
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load case details';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private isValidUuid(id: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  }

  loadLinkedAlerts(caseId: string): void {
    this.caseService.getAlertsForCase(caseId).subscribe({
      next: (res) => {
        this.linkedAlerts = res.data || [];
        this.cdr.detectChanges();
      },
      error: () => {
        this.cdr.detectChanges();
      }
    });
  }

  loadAuditTrail(caseId: string): void {
    this.caseService.getCaseAuditTrail(caseId).subscribe({
      next: (res) => {
        this.auditTrail = res.data || [];
        this.cdr.detectChanges();
      }
    });
  }

  exportAuditTrail(): void {
    if (!this.caseData || this.isExporting) return;
    this.isExporting = true;
    this.caseService.exportAuditTrail(this.caseData.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit_trail_${this.caseData!.caseReference}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.isExporting = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isExporting = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ─── Notes ─────────────────────────────────────────────────────────────────

  addNote(): void {
    if (!this.caseData || !this.newNoteContent || this.isAddingNote) return;
    this.isAddingNote = true;
    const dto = {
      noteType: this.newNoteType,
      noteContent: this.newNoteContent
    };
    this.caseService.addInvestigationNote(this.caseData.id, dto).subscribe({
      next: () => {
        this.newNoteContent = '';
        this.isAddingNote = false;
        if (this.caseData) this.caseData.hasInvestigationNote = true;
        this.toast.success('Note added successfully');
        this.loadAuditTrail(this.caseData!.id); 
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isAddingNote = false;
        this.toast.error(err?.error?.message || 'Failed to add note');
        this.cdr.detectChanges();
      }
    });
  }

  // ─── Actions ───────────────────────────────────────────────────────────────

  submitReassign(): void {
    if (!this.caseRef || !this.reassignAssignee || this.isReassigning) return;
    this.isReassigning = true;
    this.caseService.reassignCase(this.caseRef, {
      newAssigneeUserCode: this.reassignAssignee,
      reason: this.reassignReason
    }).subscribe({
      next: () => {
        this.isReassigning = false;
        this.showReassignModal = false;
        this.toast.success('Case reassigned successfully');
        this.loadCaseDetails();
      },
      error: (err) => { 
        this.isReassigning = false; 
        this.toast.error(err?.error?.message || 'Failed to reassign case');
        this.cdr.detectChanges(); 
      }
    });
  }

  submitEscalate(): void {
    if (!this.caseRef || !this.escalateTo || this.isEscalating) return;
    this.isEscalating = true;
    this.caseService.escalateCase(this.caseRef, {
      escalatedTo: this.escalateTo,
      escalationReason: this.escalateReason
    }).subscribe({
      next: () => {
        this.isEscalating = false;
        this.showEscalateModal = false;
        this.toast.success('Case escalated successfully');
        this.loadCaseDetails();
      },
      error: (err) => { 
        this.isEscalating = false; 
        this.toast.error(err?.error?.message || 'Failed to escalate case');
        this.cdr.detectChanges(); 
      }
    });
  }

  submitClose(): void {
    if (!this.caseData || this.isClosing) return;
    this.isClosing = true;
    
    if (this.closeType === 'FALSE_POSITIVE') {
      const closedBy = this.userId || 'system';
      this.caseService.closeAsFalsePositive(this.caseData.id, { rationale: this.closeRationale }, closedBy).subscribe({
        next: () => {
          this.isClosing = false;
          this.showCloseModal = false;
          this.toast.success('Case closed as False Positive');
          this.loadCaseDetails();
        },
        error: (err) => { 
          this.isClosing = false; 
          this.toast.error(err?.error?.message || 'Failed to close case');
          this.cdr.detectChanges(); 
        }
      });
    } else {
      this.submitStrFiling();
    }
  }

  submitStrFiling(): void {
    if (!this.caseData || !this.strSuspicionNarrative || !this.strRegulatoryBody) return;
    this.strFilingError = null;
    this.strFilingService.fileStr(this.caseData.id, {
      regulatoryBody: this.strRegulatoryBody,
      suspicionNarrative: this.strSuspicionNarrative
    }).subscribe({
      next: (res) => {
        this.strFilingResult = res.data;
        this.strFilingSuccess = true;
        this.isClosing = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.strFilingError = err?.error?.message || 'Failed to file STR. Ensure the case has investigation notes and linked transactions.';
        this.isClosing = false;
        this.cdr.detectChanges();
      }
    });
  }

  closeStrModal(): void {
    this.showCloseModal = false;
    this.strFilingSuccess = false;
    this.strFilingResult = null;
    this.strFilingError = null;
    this.strSuspicionNarrative = '';
    this.loadCaseDetails();
  }

  downloadStrPdf(): void {
    if (!this.strFilingResult) return;
    this.strFilingService.downloadPdf(this.strFilingResult.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `STR-Report-${this.strFilingResult!.filingReference}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    });
  }

  // ─── Alert Detail ──────────────────────────────────────────────────────────

  openAlertDetail(alertId: string, event?: MouseEvent): void {
    console.log('Opening alert detail for ID:', alertId);
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    if (!alertId) {
      console.error('No alert ID provided to openAlertDetail');
      return;
    }
    this.loadingAlertDetail = true;
    this.selectedAlertDetail = null;
    this.cdr.detectChanges();
    this.alertService.getAlertDetail(alertId).subscribe({
      next: (res) => {
        console.log('Alert details received:', res.data);
        setTimeout(() => {
          this.selectedAlertDetail = res.data;
          this.loadingAlertDetail = false;
          this.cdr.detectChanges();
        }, 0);
      },
      error: (err) => {
        console.error('Alert detail fetch error:', err);
        setTimeout(() => {
          this.loadingAlertDetail = false;
          this.cdr.detectChanges();
        }, 0);
      }
    });
  }

  closeAlertDetail(): void {
    console.log('Closing alert detail modal');
    this.selectedAlertDetail = null;
    this.loadingAlertDetail = false;
    this.cdr.detectChanges();
  }

  formatAmount(amount?: number, currency?: string): string {
    if (amount == null) return '—';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency || 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────

  parseMetadata(metadata: string): any {
    try {
      return JSON.parse(metadata);
    } catch (e) {
      return metadata;
    }
  }

  getPriorityClass(priority: string): string {

    const map: Record<string, string> = {
      CRITICAL: 'bg-red-100 text-red-700 border-red-200',
      HIGH: 'bg-orange-100 text-orange-700 border-orange-200',
      MEDIUM: 'bg-amber-100 text-amber-700 border-amber-200',
      LOW: 'bg-emerald-100 text-emerald-700 border-emerald-200',
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

  goBack(): void {
    this.router.navigate(['/tenant/cases']);
  }
}
