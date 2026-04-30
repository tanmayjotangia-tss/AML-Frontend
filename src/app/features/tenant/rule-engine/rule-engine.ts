import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TenantScenarioService } from '../../../core/services/tenant-scenario.service';
import { TenantRuleService } from '../../../core/services/tenant-rule.service';
import { GlobalRuleService } from '../../../core/services/global-rule.service';
import { TokenService } from '../../../core/auth/token';
import { 
  TenantScenarioWithRulesDto, 
  RuleStatus, 
  TenantRuleResponseDto,
  TenantRuleThresholdResponseDto,
  UpdateTenantRuleRequestDto,
  GlobalScenarioResponseDto,
  ScenarioExecutionSummary,
  BatchScenarioExecutionSummary
} from '../../../core/models/tenant-rule.model';
import { GlobalRuleConditionResponseDto } from '../../../core/models/rule-engine.model';
import { finalize, forkJoin } from 'rxjs';

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
  private globalRuleService = inject(GlobalRuleService);
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
  globalConditions: GlobalRuleConditionResponseDto[] = [];
  
  // Track local changes before saving
  pendingOverrides: Record<string, { value: string, lookback: string }> = {};
  
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
    this.thresholds = [];
    this.globalConditions = [];

    if (!rule.id || !rule.globalRuleId) {
      console.error('Incomplete rule data:', rule);
      alert('Error: Rule IDs are missing. Cannot fetch conditions.');
      this.loading = false;
      return;
    }

    forkJoin({
      thresholds: this.tenantRuleService.getThresholdsForRule(rule.id),
      globalConditions: this.globalRuleService.getConditionsByRuleId(rule.globalRuleId)
    }).pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (res) => {
        this.thresholds = res.thresholds.data || [];
        
        // Handle both direct array and paginated response
        const conditionsData = res.globalConditions.data;
        if (Array.isArray(conditionsData)) {
          this.globalConditions = conditionsData;
        } else if (conditionsData && (conditionsData as any).content) {
          this.globalConditions = (conditionsData as any).content;
        } else {
          this.globalConditions = [];
        }
        
        // Initialize pending overrides from existing ones
        this.pendingOverrides = {};
        this.globalConditions.forEach(cond => {
          const existing = this.getThresholdForCondition(cond.id);
          this.pendingOverrides[cond.id] = {
            value: existing?.overrideValue ?? '',
            lookback: existing?.overrideLookbackPeriod ?? ''
          };
        });

        this.showThresholdModal = true;
      },
      error: (err) => {
        console.error('Error loading threshold metadata:', err);
        let msg = 'Failed to load rule condition metadata.';
        if (err.status === 403) msg += ' (Access Denied: Check permissions)';
        if (err.status === 404) msg += ' (Global rule or thresholds not found)';
        alert(msg + ' Please try again or contact support.');
      }
    });
  }

  closeThresholdModal(): void {
    this.showThresholdModal = false;
    this.selectedRule = undefined;
    this.thresholds = [];
    this.globalConditions = [];
    this.thresholdForm.reset();
  }

  getThresholdForCondition(conditionId: string): TenantRuleThresholdResponseDto | undefined {
    return this.thresholds.find(t => t.globalConditionId === conditionId);
  }

  saveAllOverrides(): void {
    if (!this.selectedRule) return;

    const overridesToSave = this.globalConditions
      .map(cond => {
        const pending = this.pendingOverrides[cond.id];
        if (pending && (pending.value || pending.lookback)) {
          return {
            tenantRuleCode: this.selectedRule!.ruleCode,
            globalConditionCode: cond.conditionCode,
            globalConditionId: cond.id, // Pass UUID to avoid backend lookup errors
            overrideValue: pending.value || null,
            overrideLookbackPeriod: pending.lookback || null
          };
        }
        return null;
      })
      .filter(o => o !== null);

    this.loading = true;
    this.tenantRuleService.bulkUpdateThresholds(this.selectedRule.id, overridesToSave as any)
      .pipe(finalize(() => { 
        this.loading = false; 
        this.cdr.detectChanges(); 
      }))
      .subscribe({
        next: (res) => {
          alert('Threshold overrides saved successfully!');
          this.closeThresholdModal();
          // Optional: Refresh scenarios to reflect changes if needed
          // this.loadMyScenarios();
        },
        error: (err) => {
          console.error('Error saving thresholds:', err);
          const errorMsg = err?.error?.message || 'Failed to save overrides. Please check backend logs.';
          alert(errorMsg);
        }
      });
  }

}