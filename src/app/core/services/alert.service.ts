import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../shared/models/api-response.model';
import { Page } from '../models/tenant.model';
import {
  AlertResponseDto,
  AlertDetailResponseDto,
  AlertSeverity,
  AlertStatus,
  SeverityCounts
} from '../models/alert.model';

@Injectable({ providedIn: 'root' })
export class AlertService {
  private http = inject(HttpClient);
  private readonly BASE = '/api/v1/alerts/dashboard';

  getAlerts(
    severity?: AlertSeverity | '',
    status?: AlertStatus | '',
    from?: string,
    to?: string,
    page = 0,
    size = 15,
    customer?: string
  ): Observable<ApiResponse<Page<AlertResponseDto>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', 'sysCreatedAt,desc');
    if (severity)  params = params.set('severity', severity);
    if (status)    params = params.set('status', status);
    if (from)      params = params.set('from', from);
    if (to)        params = params.set('to', to);
    if (customer)  params = params.set('customer', customer);
    return this.http.get<ApiResponse<Page<AlertResponseDto>>>(this.BASE, { params });
  }

  getAlertDetail(alertId: string): Observable<ApiResponse<AlertDetailResponseDto>> {
    return this.http.get<ApiResponse<AlertDetailResponseDto>>(`${this.BASE}/${alertId}`);
  }

  getSeverityCounts(): Observable<ApiResponse<SeverityCounts>> {
    return this.http.get<ApiResponse<SeverityCounts>>(`${this.BASE}/severity-counts`);
  }

  closeAlert(alertId: string, resolution: AlertStatus, comment?: string): Observable<ApiResponse<void>> {
    let params = new HttpParams().set('resolution', resolution);
    if (comment) params = params.set('comment', comment);
    return this.http.patch<ApiResponse<void>>(`${this.BASE}/${alertId}/close`, {}, { params });
  }
}
