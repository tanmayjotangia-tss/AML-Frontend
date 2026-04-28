import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../shared/models/api-response.model';
import { Page } from '../models/tenant.model';
import { GlobalRuleResponseDto } from '../models/rule-engine.model';

@Injectable({
  providedIn: 'root'
})
export class GlobalRuleService {
  private http = inject(HttpClient);
  private readonly API_URL = '/api/v1/platform/rules';

  getRuleById(id: string): Observable<ApiResponse<GlobalRuleResponseDto>> {
    return this.http.get<ApiResponse<GlobalRuleResponseDto>>(`${this.API_URL}/${id}`);
  }

  listRules(page: number = 0, size: number = 20): Observable<ApiResponse<Page<GlobalRuleResponseDto>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<ApiResponse<Page<GlobalRuleResponseDto>>>(this.API_URL, { params });
  }
}
