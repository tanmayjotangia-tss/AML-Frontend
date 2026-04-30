import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TenantScenarioService } from '../../../core/services/tenant-scenario.service';
import { TenantRuleService } from '../../../core/services/tenant-rule.service';
import { TokenService } from '../../../core/auth/token';
import { 
  TenantScenarioWithRulesDto, 
  RuleStatus, 
  TenantRuleResponseDto,
  TenantRuleThresholdResponseDto,
  UpdateTenantRuleRequestDto,
  GlobalScenarioResponseDto,
  ScenarioExecutionSummary,
  BatchScenarioExecutionSummary // <-- Added this import
} from '../../../core/models/tenant-rule.model';
import { finalize } from 'rxjs';

type Tab = 'MY_SCENARIOS' | 'ACTIVATION_LIBRARY';

@Component({
  selector: 'app-rule-engine',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './rule-engine.html',
  styleUrl: './rule-engine.css',
})
export class RuleEngine implements OnInit {
  private tenantScenarioService = inject(TenantScenarioService);
  private tenantRuleService = inject(TenantRuleService);
  private tokenService = inject(TokenService);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  activeTab: Tab = 'MY_SCENARIOS';
  loading = false;
  /** True for BANK_ADMIN; false for COMPLIANCE_OFFICER (read-only view) */
  isBankAdmin = this.tokenService.getRole() === 'BANK_ADMIN';

  // State
  myScenarios: TenantScenarioWithRulesDto[] = [];
  availableGlobalScenarios: GlobalScenarioResponseDto[] = [];
  
  // Detail State
  selectedScenario?: TenantScenarioWithRulesDto;
  selectedRule?: TenantRuleResponseDto;
  thresholds: TenantRuleThresholdResponseDto[] = [];
  
  // Modals
  showThresholdModal = false;
  thresholdForm: FormGroup;

  // ─── Execution State ─────────────────────────────────────────────────────────
  executionMode: 'LIVE' | 'FORENSIC' = 'LIVE';
  execStartDate = '';
  execEndDate = '';
  isExecuting = false;
  
  // Updated to accept both single and batch summaries
  executionResult: ScenarioExecutionSummary | BatchScenarioExecutionSummary | null = null; 
  executionError: string | null = null;
  showExecutionPanel = false;

  constructor() {
    this.thresholdForm = this.fb.group({
      globalConditionCode: ['', Validators.required],
      overrideValue: [''],
      overrideLookbackPeriod: ['']
    });
  }

  ngOnInit(): void {
    this.loadMyScenarios();
  }

  setTab(tab: Tab): void {
    this.activeTab = tab;
    if (tab === 'MY_SCENARIOS') {
      this.loadMyScenarios();
    } else {
      this.loadAvailableScenarios();
    }
  }

  loadMyScenarios(): void {
    this.loading = true;
    this.myScenarios = [];
    this.tenantScenarioService.listActiveScenariosWithRules()
      .subscribe({
        next: (res) => {
          this.myScenarios = res.data || [];
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error loading scenarios:', err);
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
  }

  loadAvailableScenarios(): void {
    this.loading = true;
    this.tenantScenarioService.getAvailableGlobalScenarios()
      .subscribe({
        next: (res) => {
          const activatedIds = this.myScenarios.map(s => s.scenario.globalScenarioId);
          this.availableGlobalScenarios = (res.data || [])
            .filter(s => !s.sysIsDeleted)              // exclude soft-deleted global scenarios
            .filter(s => !activatedIds.includes(s.id)); // exclude already-activated ones
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error loading global scenarios:', err);
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
  }

  activateScenario(globalId: string): void {
    if (confirm('Activate this scenario for your bank? This will seed default rules.')) {
      this.loading = true;
      this.tenantScenarioService.activateScenario(globalId)
        .subscribe({
          next: () => {
            alert('Scenario activated successfully');
            this.setTab('MY_SCENARIOS');
          },
          error: (err) => {
            console.error('Error activating scenario:', err);
            this.loading = false;
          }
        });
    }
  }

  pauseScenario(id: string): void {
    this.tenantScenarioService.pauseScenario(id).subscribe(() => this.loadMyScenarios());
  }

  resumeScenario(id: string): void {
    this.tenantScenarioService.resumeScenario(id).subscribe(() => this.loadMyScenarios());
  }

  toggleRule(rule: TenantRuleResponseDto): void {
    this.tenantScenarioService.toggleScenarioRule(rule.id, !rule.active).subscribe({
      next: (res) => {
        rule.active = res.data.active ?? res.data.isActive ?? !rule.active;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error toggling rule:', err)
    });
  }

  viewScenarioDetails(scenario: TenantScenarioWithRulesDto): void {
    this.selectedScenario = scenario;
    // Reset execution state when entering detail view
    this.executionResult = null;
    this.executionError = null;
    this.showExecutionPanel = false;
    this.executionMode = 'LIVE';
    this.execStartDate = '';
    this.execEndDate = '';
  }

  closeDetails(): void {
    this.selectedScenario = undefined;
    this.executionResult = null;
    this.executionError = null;
    this.showExecutionPanel = false;
  }

  // ─── Execution ────────────────────────────────────────────────────────────────

  runScenario(): void {
    if (!this.selectedScenario || this.isExecuting) return;
    this.isExecuting = true;
    this.executionResult = null;
    this.executionError = null;

    const requestDto = this.executionMode === 'FORENSIC' && this.execStartDate && this.execEndDate
      ? { globalLookbackStart: new Date(this.execStartDate).toISOString(), globalLookbackEnd: new Date(this.execEndDate).toISOString() }
      : undefined;

    this.tenantScenarioService.executeScenario(this.selectedScenario.scenario.id, requestDto).subscribe({
      next: (res) => {
        this.executionResult = res.data;
        this.isExecuting = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.executionError = err?.error?.message || 'Scenario execution failed. Please try again.';
        this.isExecuting = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ============================================================================
  // NEW BATCH EXECUTION METHOD
  // ============================================================================
  runAllActiveScenarios(): void {
    if (this.isExecuting) return;
    this.isExecuting = true;
    this.executionResult = null;
    this.executionError = null;

    const requestDto = this.executionMode === 'FORENSIC' && this.execStartDate && this.execEndDate
      ? { globalLookbackStart: new Date(this.execStartDate).toISOString(), globalLookbackEnd: new Date(this.execEndDate).toISOString() }
      : undefined;

    this.tenantScenarioService.executeAllActiveScenarios(requestDto).subscribe({
      next: (res) => {
        this.executionResult = res.data;
        this.isExecuting = false;
        this.showExecutionPanel = true; // Show panel if running from main list
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.executionError = err?.error?.message || 'Batch scenario execution failed. Please try again.';
        this.isExecuting = false;
        this.cdr.detectChanges();
      }
    });
  }

  clearExecution(): void {
    this.executionResult = null;
    this.executionError = null;
  }

  getSeverityClass(riskRating?: string): string {
    const map: Record<string, string> = {
      HIGH: 'bg-red-100 text-red-700',
      CRITICAL: 'bg-red-100 text-red-800',
      MEDIUM: 'bg-amber-100 text-amber-700',
      LOW: 'bg-green-100 text-green-700',
    };
    return map[riskRating?.toUpperCase() ?? ''] || 'bg-slate-100 text-slate-600';
  }

  openThresholdModal(rule: TenantRuleResponseDto): void {
    this.selectedRule = rule;
    this.loading = true;
    this.tenantRuleService.getThresholdsForRule(rule.id)
      .pipe(finalize(() => { this.loading = false; this.cdr.detectChanges(); }))
      .subscribe({
        next: (res) => {
          this.thresholds = res.data;
          this.showThresholdModal = true;
        },
        error: (err) => console.error('Error loading thresholds:', err)
      });
  }

  closeThresholdModal(): void {
    this.showThresholdModal = false;
    this.selectedRule = undefined;
    this.thresholds = [];
    this.thresholdForm.reset();
  }

  saveThreshold(): void {
    if (this.thresholdForm.invalid || !this.selectedRule) return;

    this.loading = true;
    const dto = {
      tenantRuleCode: this.selectedRule.ruleCode,
      ...this.thresholdForm.value
    };

    this.tenantRuleService.createThresholdOverride(dto)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: () => {
          this.openThresholdModal(this.selectedRule!); // Refresh list
          this.thresholdForm.reset();
        },
        error: (err) => console.error('Error saving threshold:', err)
      });
  }

  deleteThreshold(id: string): void {
    if (confirm('Delete this threshold override? It will revert to global default.')) {
      this.tenantRuleService.deleteThresholdOverride(id).subscribe(() => {
        this.thresholds = this.thresholds.filter(t => t.id !== id);
      });
    }
  }
}