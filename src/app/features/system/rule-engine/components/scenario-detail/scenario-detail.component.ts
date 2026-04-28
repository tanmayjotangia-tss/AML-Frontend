import { Component, EventEmitter, Input, OnInit, Output, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { GlobalScenarioService } from '../../../../../core/services/global-scenario.service';
import { GlobalRuleService } from '../../../../../core/services/global-rule.service';
import { GlobalScenarioResponseDto, MappedRuleDisplay, GlobalRuleResponseDto } from '../../../../../core/models/rule-engine.model';
import { ScenarioRuleMapperComponent } from '../scenario-rule-mapper/scenario-rule-mapper.component';

@Component({
  selector: 'app-scenario-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, ScenarioRuleMapperComponent],
  templateUrl: './scenario-detail.component.html',
  styleUrls: ['./scenario-detail.component.css']
})
export class ScenarioDetailComponent implements OnInit {
  @Input() scenario!: GlobalScenarioResponseDto;
  @Output() back = new EventEmitter<void>();

  private scenarioService = inject(GlobalScenarioService);
  private ruleService = inject(GlobalRuleService);
  private cdr = inject(ChangeDetectorRef);

  mappedRules: MappedRuleDisplay[] = [];
  isLoading = true;
  error = '';
  
  showRuleMapper = false;

  ngOnInit() {
    this.loadMappedRules();
  }

  loadMappedRules() {
    this.isLoading = true;
    this.error = '';

    // First fetch all rules to build a dictionary (since mapping only has ruleId)
    // Then fetch the mappings for this scenario
    forkJoin({
      allRulesRes: this.ruleService.listRules(0, 200).pipe(catchError(() => of(null))),
      mappingsRes: this.scenarioService.getRulesByScenarioId(this.scenario.id).pipe(catchError(() => of(null)))
    }).subscribe({
      next: ({ allRulesRes, mappingsRes }) => {
        try {
          if (!mappingsRes) throw new Error('Failed to load scenario rule mappings');
          
          let mappings = [];
          if (Array.isArray(mappingsRes.data)) {
            mappings = mappingsRes.data;
          } else {
            mappings = (mappingsRes.data as any)?.content || [];
          }

          let allRules: GlobalRuleResponseDto[] = [];
          if (allRulesRes) {
            if (Array.isArray(allRulesRes.data)) {
              allRules = allRulesRes.data;
            } else {
              allRules = allRulesRes.data?.content || [];
            }
          }

          // Build dictionary
          const ruleDict = new Map<string, GlobalRuleResponseDto>();
          allRules.forEach(r => ruleDict.set(r.id, r));

          // Transform to display models
          this.mappedRules = mappings.map((m: any) => {
            const rule = ruleDict.get(m.ruleId);
            return {
              mappingId: m.id,
              ruleId: m.ruleId,
              ruleName: rule ? rule.ruleName : 'Unknown Rule',
              ruleType: rule ? rule.ruleType : 'UNKNOWN',
              severity: rule ? rule.severity : 'LOW',
              baseRiskScore: rule ? rule.baseRiskScore : 0
            };
          });

        } catch (e: any) {
          console.error(e);
          this.error = e.message || 'Error processing rule mappings';
        } finally {
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      }
    });
  }

  removeRule(rule: MappedRuleDisplay) {
    if (confirm(`Are you sure you want to remove '${rule.ruleName}' from this scenario?`)) {
      this.scenarioService.removeRuleFromScenario(this.scenario.id, rule.ruleId).subscribe({
        next: () => this.loadMappedRules(),
        error: () => {
          this.error = 'Failed to remove rule';
          this.cdr.detectChanges();
        }
      });
    }
  }

  getMappedRuleIds(): string[] {
    return this.mappedRules.map(r => r.ruleId);
  }

  openRuleMapper() {
    this.showRuleMapper = true;
  }

  closeRuleMapper() {
    this.showRuleMapper = false;
  }

  onRuleMapped() {
    this.loadMappedRules();
  }
}
