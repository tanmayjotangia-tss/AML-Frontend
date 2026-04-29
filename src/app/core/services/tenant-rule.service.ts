import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../shared/models/api-response.model';
import { 
  TenantRuleResponseDto, 
  UpdateTenantRuleRequestDto,
  TenantRuleThresholdResponseDto,
  CreateTenantRuleThresholdRequestDto,
  UpdateTenantRuleThresholdRequestDto
} from '../models/tenant-rule.model';

@Injectable({
  providedIn: 'root'
})
export class TenantRuleService {
  private http = inject(HttpClient);
  private readonly API_URL = '/api/v1/tenant-rules';

  getRuleById(ruleId: string): Observable<ApiResponse<TenantRuleResponseDto>> {
    return this.http.get<ApiResponse<TenantRuleResponseDto>>(`${this.API_URL}/${ruleId}`);
  }

  updateRule(ruleId: string, dto: UpdateTenantRuleRequestDto): Observable<ApiResponse<TenantRuleResponseDto>> {
    return this.http.put<ApiResponse<TenantRuleResponseDto>>(`${this.API_URL}/${ruleId}`, dto);
  }

  toggleRule(ruleId: string, isActive: boolean): Observable<ApiResponse<TenantRuleResponseDto>> {
    const params = new HttpParams().set('active', isActive.toString());
    return this.http.patch<ApiResponse<TenantRuleResponseDto>>(`${this.API_URL}/${ruleId}/toggle`, {}, { params });
  }

  getThresholdsForRule(ruleId: string): Observable<ApiResponse<TenantRuleThresholdResponseDto[]>> {
    return this.http.get<ApiResponse<TenantRuleThresholdResponseDto[]>>(`${this.API_URL}/${ruleId}/thresholds`);
  }

  createThresholdOverride(dto: CreateTenantRuleThresholdRequestDto): Observable<ApiResponse<TenantRuleThresholdResponseDto>> {
    return this.http.post<ApiResponse<TenantRuleThresholdResponseDto>>(`${this.API_URL}/thresholds`, dto);
  }

  updateThresholdOverride(thresholdId: string, dto: UpdateTenantRuleThresholdRequestDto): Observable<ApiResponse<TenantRuleThresholdResponseDto>> {
    return this.http.put<ApiResponse<TenantRuleThresholdResponseDto>>(`${this.API_URL}/thresholds/${thresholdId}`, dto);
  }

  deleteThresholdOverride(thresholdId: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/thresholds/${thresholdId}`);
  }

  bulkUpdateThresholds(ruleId: string, overrides: CreateTenantRuleThresholdRequestDto[]): Observable<ApiResponse<TenantRuleThresholdResponseDto[]>> {
    return this.http.put<ApiResponse<TenantRuleThresholdResponseDto[]>>(`${this.API_URL}/${ruleId}/thresholds/bulk`, overrides);
  }
}
