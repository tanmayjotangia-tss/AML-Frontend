import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../shared/models/api-response.model';
import { Page } from '../models/tenant.model';
import { 
  CreateGlobalScenarioRequestDto, 
  UpdateGlobalScenarioRequestDto, 
  GlobalScenarioResponseDto,
  UpdateGlobalScenarioRuleRequestDto,
  GlobalScenarioRuleResponseDto
} from '../models/rule-engine.model';

@Injectable({
  providedIn: 'root'
})
export class GlobalScenarioService {
  private http = inject(HttpClient);
  private readonly API_URL = '/api/v1/platform/scenarios';

  // Scenario Endpoints
  createScenario(requestDto: CreateGlobalScenarioRequestDto): Observable<ApiResponse<GlobalScenarioResponseDto>> {
    return this.http.post<ApiResponse<GlobalScenarioResponseDto>>(this.API_URL, requestDto);
  }

  updateScenario(id: string, requestDto: UpdateGlobalScenarioRequestDto): Observable<ApiResponse<GlobalScenarioResponseDto>> {
    return this.http.put<ApiResponse<GlobalScenarioResponseDto>>(`${this.API_URL}/${id}`, requestDto);
  }

  deleteScenario(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/${id}`);
  }

  getScenarioById(id: string): Observable<ApiResponse<GlobalScenarioResponseDto>> {
    return this.http.get<ApiResponse<GlobalScenarioResponseDto>>(`${this.API_URL}/${id}`);
  }

  listScenarios(page: number = 0, size: number = 20): Observable<ApiResponse<Page<GlobalScenarioResponseDto>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<ApiResponse<Page<GlobalScenarioResponseDto>>>(this.API_URL, { params });
  }

  // Scenario-Rule Mapping Endpoints
  addRuleToScenario(scenarioId: string, ruleId: string): Observable<ApiResponse<GlobalScenarioRuleResponseDto>> {
    return this.http.post<ApiResponse<GlobalScenarioRuleResponseDto>>(`${this.API_URL}/${scenarioId}/rules/${ruleId}`, null);
  }

  removeRuleFromScenario(scenarioId: string, ruleId: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/${scenarioId}/rules/${ruleId}`);
  }

  getRulesByScenarioId(scenarioId: string): Observable<ApiResponse<GlobalScenarioRuleResponseDto[]>> {
    return this.http.get<ApiResponse<GlobalScenarioRuleResponseDto[]>>(`${this.API_URL}/${scenarioId}/rules`);
  }

  updateRuleInScenario(scenarioId: string, ruleId: string, requestDto: UpdateGlobalScenarioRuleRequestDto): Observable<ApiResponse<GlobalScenarioRuleResponseDto>> {
    return this.http.put<ApiResponse<GlobalScenarioRuleResponseDto>>(`${this.API_URL}/${scenarioId}/rules/${ruleId}`, requestDto);
  }
}
