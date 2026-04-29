import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../shared/models/api-response.model';
import { 
  TenantScenarioResponseDto, 
  TenantRuleResponseDto,
  TenantScenarioWithRulesDto,
  GlobalScenarioResponseDto,
  ScenarioExecutionRequestDto,
  ScenarioExecutionSummary
} from '../models/tenant-rule.model';

@Injectable({
  providedIn: 'root'
})
export class TenantScenarioService {
  private http = inject(HttpClient);
  private readonly API_URL = '/api/v1/tenant-scenarios';
  private readonly EXEC_URL = '/api/v1/rule-engine/scenarios';

  activateScenario(globalScenarioId: string): Observable<ApiResponse<TenantScenarioResponseDto>> {
    return this.http.post<ApiResponse<TenantScenarioResponseDto>>(`${this.API_URL}/activate/${globalScenarioId}`, {});
  }

  pauseScenario(id: string): Observable<ApiResponse<TenantScenarioResponseDto>> {
    return this.http.put<ApiResponse<TenantScenarioResponseDto>>(`${this.API_URL}/${id}/pause`, {});
  }

  resumeScenario(id: string): Observable<ApiResponse<TenantScenarioResponseDto>> {
    return this.http.put<ApiResponse<TenantScenarioResponseDto>>(`${this.API_URL}/${id}/resume`, {});
  }

  toggleScenarioRule(ruleId: string, isActive: boolean): Observable<ApiResponse<TenantRuleResponseDto>> {
    const params = new HttpParams().set('active', isActive.toString());
    return this.http.patch<ApiResponse<TenantRuleResponseDto>>(`${this.API_URL}/rules/${ruleId}/toggle`, {}, { params });
  }

  getScenarioByIdWithRules(id: string): Observable<ApiResponse<TenantScenarioWithRulesDto>> {
    return this.http.get<ApiResponse<TenantScenarioWithRulesDto>>(`${this.API_URL}/${id}`);
  }

  listActiveScenariosWithRules(): Observable<ApiResponse<TenantScenarioWithRulesDto[]>> {
    return this.http.get<ApiResponse<TenantScenarioWithRulesDto[]>>(this.API_URL);
  }

  getAvailableGlobalScenarios(): Observable<ApiResponse<GlobalScenarioResponseDto[]>> {
    return this.http.get<ApiResponse<GlobalScenarioResponseDto[]>>(`${this.API_URL}/available-globals`);
  }

  executeScenario(tenantScenarioId: string, requestDto?: ScenarioExecutionRequestDto): Observable<ApiResponse<ScenarioExecutionSummary>> {
    return this.http.post<ApiResponse<ScenarioExecutionSummary>>(
      `${this.EXEC_URL}/${tenantScenarioId}/execute`,
      requestDto ?? {}
    );
  }
}
