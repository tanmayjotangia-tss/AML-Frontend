import { Component, EventEmitter, Input, OnInit, Output, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GlobalScenarioService } from '../../../../../core/services/global-scenario.service';
import { GlobalRuleService } from '../../../../../core/services/global-rule.service';
import { GlobalRuleResponseDto, GlobalRuleConditionResponseDto } from '../../../../../core/models/rule-engine.model';

@Component({
  selector: 'app-scenario-rule-mapper',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './scenario-rule-mapper.component.html',
  styleUrls: ['./scenario-rule-mapper.component.css']
})
export class ScenarioRuleMapperComponent implements OnInit {
  @Input() scenarioId!: string;
  @Input() excludeRuleIds: string[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() mapped = new EventEmitter<void>();

  private ruleService = inject(GlobalRuleService);
  private scenarioService = inject(GlobalScenarioService);
  private cdr = inject(ChangeDetectorRef);

  rules: GlobalRuleResponseDto[] = [];
  isLoadingRules = true;
  error = '';

  selectedRule?: GlobalRuleResponseDto;
  isSubmitting = false;

  // State for rule conditions
  selectedRuleConditions: GlobalRuleConditionResponseDto[] = [];
  isLoadingConditions = false;
  errorConditions = '';

  ngOnInit() {
    this.loadRules();
  }

  loadRules() {
    this.isLoadingRules = true;
    this.ruleService.listRules(0, 100).subscribe({
      next: (res) => {
        try {
          let fetchedRules = [];
          if (Array.isArray(res.data)) {
            fetchedRules = res.data;
          } else {
            fetchedRules = res.data?.content || [];
          }
          this.rules = fetchedRules.filter(r => !this.excludeRuleIds.includes(r.id));
        } catch (e) {
          console.error(e);
        } finally {
          this.isLoadingRules = false;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error(err);
        this.error = 'Failed to load available rules.';
        this.isLoadingRules = false;
        this.cdr.detectChanges();
      }
    });
  }

  selectRule(rule: GlobalRuleResponseDto) {
    this.selectedRule = rule;
    this.loadConditions(rule.id);
  }

  cancelSelection() {
    this.selectedRule = undefined;
  }

  // Load conditions for a specific rule
  loadConditions(ruleId: string): void {
    this.isLoadingConditions = true;
    this.errorConditions = '';
    this.ruleService.getConditionsByRuleId(ruleId).subscribe({
      next: (res) => {
        try {
          if (Array.isArray(res.data)) {
            this.selectedRuleConditions = res.data;
          } else {

            this.selectedRuleConditions = (res.data as any)?.content || [];
          }
        } catch (e) {
          console.error(e);
        } finally {
          this.isLoadingConditions = false;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error(err);
        this.errorConditions = 'Failed to load conditions.';
        this.isLoadingConditions = false;
        this.cdr.detectChanges();
      }
    });
  }


  onCancel(): void {
    this.close.emit();
    this.selectedRule = undefined;
    this.selectedRuleConditions = [];
    this.isSubmitting = false;
    this.error = '';
    this.errorConditions = '';
  }

  onSubmit(): void {
    if (!this.selectedRule) return;

    this.isSubmitting = true;
    this.error = '';

    this.scenarioService.addRuleToScenario(this.scenarioId, this.selectedRule.id).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.mapped.emit();
        this.close.emit();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.error = err.error?.message || 'Failed to map rule to scenario.';
        this.cdr.detectChanges();
      }
    });
  }

  // Getter to support typo in template
  get isSubmittin(): boolean {
    return this.isSubmitting;
  }
}
