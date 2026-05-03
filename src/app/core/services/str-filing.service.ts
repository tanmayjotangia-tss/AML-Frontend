import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../shared/models/api-response.model';
import { StrFilingRequestDto, StrFilingResponseDto } from '../models/str-filing.model';

@Injectable({
  providedIn: 'root'
})
export class StrFilingService {
  private http = inject(HttpClient);
  private readonly API_URL = '/api/v1/str-filings';

  fileStr(caseId: string, dto: StrFilingRequestDto): Observable<ApiResponse<StrFilingResponseDto>> {
    return this.http.post<ApiResponse<StrFilingResponseDto>>(`${this.API_URL}/cases/${caseId}`, dto);
  }

  getFilingDetail(filingId: string): Observable<ApiResponse<StrFilingResponseDto>> {
    return this.http.get<ApiResponse<StrFilingResponseDto>>(`${this.API_URL}/${filingId}`);
  }

  getFilings(page = 0, size = 20, caseId?: string): Observable<ApiResponse<{ content: StrFilingResponseDto[], totalElements: number, totalPages: number }>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (caseId) params = params.set('caseId', caseId);
    return this.http.get<ApiResponse<{ content: StrFilingResponseDto[], totalElements: number, totalPages: number }>>(this.API_URL, { params });
  }

  downloadPdf(filingId: string): Observable<Blob> {
    return this.http.get(`${this.API_URL}/${filingId}/pdf`, { responseType: 'blob' });
  }
}
