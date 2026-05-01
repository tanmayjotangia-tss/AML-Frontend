import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../shared/models/api-response.model';
import { Page } from '../models/tenant.model';
import { PlatformAuditLog } from '../models/audit-log.model';

@Injectable({
  providedIn: 'root'
})
export class AuditLogService {
  private http = inject(HttpClient);
  private readonly API_URL = '/api/v1/audit-logs';

  getAuditLogs<T = any>(page: number = 0, size: number = 20): Observable<ApiResponse<Page<T>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', 'sysCreatedAt,desc');
    
    return this.http.get<ApiResponse<Page<T>>>(this.API_URL, { params });
  }
}
