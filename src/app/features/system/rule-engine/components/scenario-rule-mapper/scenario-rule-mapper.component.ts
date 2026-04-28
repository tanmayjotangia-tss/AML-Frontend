import { Component, EventEmitter, Input, OnInit, Output, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GlobalScenarioService } from '../../../../../core/services/global-scenario.service';
import { GlobalRuleService } from '../../../../../core/services/global-rule.service';
import { GlobalRuleResponseDto } from '../../../../../core/models/rule-engine.model';

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
        } catch(e) {
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
  }

  cancelSelection() {
    this.selectedRule = undefined;
  }

  onCancel() {
    if (this.isSubmitting) return;
    this.close.emit();
  }

  onSubmit() {
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
}
