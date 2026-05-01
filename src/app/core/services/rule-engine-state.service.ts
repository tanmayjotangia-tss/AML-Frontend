import { Injectable, signal } from '@angular/core';
import { BatchScenarioExecutionSummary, ScenarioExecutionSummary } from '../models/tenant-rule.model';

@Injectable({
  providedIn: 'root'
})
export class RuleEngineStateService {
  readonly isExecuting = signal<boolean>(false);
  readonly executionResult = signal<ScenarioExecutionSummary | BatchScenarioExecutionSummary | null>(null);
  readonly executionError = signal<string | null>(null);
  readonly showExecutionPanel = signal<boolean>(false);
  readonly executionMode = signal<'LIVE' | 'FORENSIC'>('LIVE');
  readonly execStartDate = signal<string>('');
  readonly execEndDate = signal<string>('');

  setExecuting(value: boolean) {
    this.isExecuting.set(value);
  }

  setResult(result: ScenarioExecutionSummary | BatchScenarioExecutionSummary | null) {
    this.executionResult.set(result);
  }

  setError(error: string | null) {
    this.executionError.set(error);
  }

  setShowPanel(value: boolean) {
    this.showExecutionPanel.set(value);
  }

  clearExecution() {
    this.executionResult.set(null);
    this.executionError.set(null);
  }
}
