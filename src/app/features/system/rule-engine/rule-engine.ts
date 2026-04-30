import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { GeographicRiskService } from '../../../core/services/geographic-risk.service';
import { GlobalScenarioService } from '../../../core/services/global-scenario.service';
import { GlobalRuleService } from '../../../core/services/global-rule.service';
import { GeographicRiskRatingResponseDto } from '../../../core/models/geographic-risk.model';
import { GlobalScenarioResponseDto, GlobalRuleResponseDto, GlobalRuleConditionResponseDto } from '../../../core/models/rule-engine.model';
import { GeoRiskFormComponent } from './components/geo-risk-form/geo-risk-form.component';
import { ScenarioFormComponent } from './components/scenario-form/scenario-form.component';
import { ScenarioDetailComponent } from './components/scenario-detail/scenario-detail.component';

type Tab = 'GEO_RISK' | 'SCENARIOS' | 'GLOBAL_RULES' | 'ENTITY_SCORING';

@Component({
  selector: 'app-rule-engine',
  standalone: true,
  imports: [CommonModule, GeoRiskFormComponent, ScenarioFormComponent, ScenarioDetailComponent],
  templateUrl: './rule-engine.html',
  styleUrls: ['./rule-engine.css']
})
export class RuleEngine implements OnInit {
  private geoRiskService = inject(GeographicRiskService);
  private scenarioService = inject(GlobalScenarioService);
  private globalRuleService = inject(GlobalRuleService);
  private cdr = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);

  activeTab: Tab = 'GEO_RISK';

  // Geo Risk State
  ratings: GeographicRiskRatingResponseDto[] = [];
  isLoadingRatings = true;
  errorRatings = '';
  showGeoForm = false;
  selectedRating?: GeographicRiskRatingResponseDto;

  // Scenarios State
  scenarios: GlobalScenarioResponseDto[] = [];
  isLoadingScenarios = true;
  errorScenarios = '';
  showScenarioForm = false;
  selectedScenarioForEdit?: GlobalScenarioResponseDto;

  // Detail View State
  viewingScenarioDetail?: GlobalScenarioResponseDto;

  // Global Rules State
  globalRules: GlobalRuleResponseDto[] = [];
  isLoadingGlobalRules = true;
  errorGlobalRules = '';

  // Selected Rule Conditions State
  selectedRuleId: string | null = null;
  selectedRuleConditions: GlobalRuleConditionResponseDto[] = [];
  isLoadingConditions = false;
  errorConditions = '';

  // Load conditions for a rule
  loadConditions(ruleId: string): void {
    this.isLoadingConditions = true;
    this.errorConditions = '';
    this.globalRuleService.getConditionsByRuleId(ruleId).subscribe({
      next: (res) => {
        try {
          if (Array.isArray(res.data)) {
            this.selectedRuleConditions = res.data;
          } else {
            this.selectedRuleConditions = (res.data as any)?.content || [];
          }
          this.selectedRuleId = ruleId;
        } catch (e) {
          console.error(e);
        } finally {
          this.isLoadingConditions = false;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error(err);
        this.errorConditions = 'Failed to load rule conditions.';
        this.isLoadingConditions = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Select a rule to view its conditions
  selectRule(rule: GlobalRuleResponseDto): void {
    this.loadConditions(rule.id);
  }

  ngOnInit(): void {
    // Check for tab query parameter
    const tabParam = this.route.snapshot.queryParamMap.get('tab');
    if (tabParam && ['GEO_RISK', 'SCENARIOS', 'GLOBAL_RULES', 'ENTITY_SCORING'].includes(tabParam)) {
      this.setTab(tabParam as Tab);
    } else {
      this.loadRatings();
    }
  }

  setTab(tab: Tab) {
    this.activeTab = tab;
    this.viewingScenarioDetail = undefined;

    if (tab === 'GEO_RISK' && this.ratings.length === 0) {
      this.loadRatings();
    } else if (tab === 'SCENARIOS' && this.scenarios.length === 0) {
      this.loadScenarios();
    } else if (tab === 'GLOBAL_RULES' && this.globalRules.length === 0) {
      this.loadGlobalRules();
    }
  }

  // --- GLOBAL RULES METHODS ---
  loadGlobalRules(): void {
    this.isLoadingGlobalRules = true;
    this.errorGlobalRules = '';

    this.globalRuleService.listRules(0, 100).subscribe({
      next: (res) => {
        try {
          if (Array.isArray(res.data)) {
            this.globalRules = res.data;
          } else {
            this.globalRules = (res.data as any)?.content || [];
          }
        } catch (e) {
          console.error(e);
        } finally {
          this.isLoadingGlobalRules = false;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error(err);
        this.errorGlobalRules = 'Failed to load global rules.';
        this.isLoadingGlobalRules = false;
        this.cdr.detectChanges();
      }
    });
  }

  // --- GEO RISK METHODS ---

  loadRatings(): void {
    this.isLoadingRatings = true;
    this.errorRatings = '';

    this.geoRiskService.listRatings(0, 50).subscribe({
      next: (res) => {
        try {
          if (Array.isArray(res.data)) {
            this.ratings = res.data;
          } else {
            this.ratings = res.data?.content || [];
          }
        } catch (e) {
          console.error(e);
        } finally {
          this.isLoadingRatings = false;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error(err);
        this.errorRatings = 'Failed to load geographic risk ratings.';
        this.isLoadingRatings = false;
        this.cdr.detectChanges();
      }
    });
  }

  openGeoForm(): void {
    this.selectedRating = undefined;
    this.showGeoForm = true;
  }

  openGeoEditForm(rating: GeographicRiskRatingResponseDto): void {
    this.selectedRating = rating;
    this.showGeoForm = true;
  }

  closeGeoForm(): void {
    this.showGeoForm = false;
    this.selectedRating = undefined;
  }

  onGeoSaved(): void {
    this.loadRatings();
  }

  deleteRating(countryCode: string): void {
    if (confirm(`Are you sure you want to delete the rating for ${countryCode}?`)) {
      this.geoRiskService.deleteRating(countryCode).subscribe({
        next: () => this.loadRatings(),
        error: () => this.errorRatings = 'Failed to delete rating.'
      });
    }
  }

  // --- SCENARIO METHODS ---

  loadScenarios(): void {
    this.isLoadingScenarios = true;
    this.errorScenarios = '';

    this.scenarioService.listScenarios(0, 50).subscribe({
      next: (res) => {
        try {
          if (Array.isArray(res.data)) {
            this.scenarios = res.data;
          } else {
            this.scenarios = res.data?.content || [];
          }
        } catch (e) {
          console.error(e);
        } finally {
          this.isLoadingScenarios = false;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error(err);
        this.errorScenarios = 'Failed to load scenarios.';
        this.isLoadingScenarios = false;
        this.cdr.detectChanges();
      }
    });
  }

  openScenarioForm(): void {
    this.selectedScenarioForEdit = undefined;
    this.showScenarioForm = true;
  }

  openScenarioEditForm(scenario: GlobalScenarioResponseDto, event: Event): void {
    event.stopPropagation();
    this.selectedScenarioForEdit = scenario;
    this.showScenarioForm = true;
  }

  closeScenarioForm(): void {
    this.showScenarioForm = false;
    this.selectedScenarioForEdit = undefined;
  }

  onScenarioSaved(): void {
    this.loadScenarios();
  }

  deleteScenario(scenario: GlobalScenarioResponseDto, event: Event): void {
    event.stopPropagation();
    if (confirm(`Are you sure you want to delete the scenario '${scenario.scenarioName}'?`)) {
      this.scenarioService.deleteScenario(scenario.id).subscribe({
        next: () => {
          if (this.viewingScenarioDetail?.id === scenario.id) {
            this.viewingScenarioDetail = undefined;
          }
          this.loadScenarios();
        },
        error: () => this.errorScenarios = 'Failed to delete scenario.'
      });
    }
  }

  viewScenarioDetail(scenario: GlobalScenarioResponseDto): void {
    this.viewingScenarioDetail = scenario;
  }

  closeScenarioDetail(): void {
    this.viewingScenarioDetail = undefined;
  }
}
