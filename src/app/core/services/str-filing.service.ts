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

  /**
   * File an STR/SAR for a given case.
   * Backend auto-generates filing reference, links transactions, generates PDF/XML,
   * and closes the case.
   */
  fileStr(caseId: string, dto: StrFilingRequestDto): Observable<ApiResponse<StrFilingResponseDto>> {
    return this.http.post<ApiResponse<StrFilingResponseDto>>(`${this.API_URL}/cases/${caseId}`, dto);
  }

  /**
   * Get STR filing details by filing ID.
   */
  getFilingDetail(filingId: string): Observable<ApiResponse<StrFilingResponseDto>> {
    return this.http.get<ApiResponse<StrFilingResponseDto>>(`${this.API_URL}/${filingId}`);
  }

  /**
   * Get paginated list of STR filings.
   * Can be filtered by caseId.
   */
  getFilings(page = 0, size = 20, caseId?: string): Observable<ApiResponse<{ content: StrFilingResponseDto[], totalElements: number, totalPages: number }>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (caseId) params = params.set('caseId', caseId);
    return this.http.get<ApiResponse<{ content: StrFilingResponseDto[], totalElements: number, totalPages: number }>>(this.API_URL, { params });
  }

  /**
   * Download the STR report as a PDF blob.
   */
  downloadPdf(filingId: string): Observable<Blob> {
    return this.http.get(`${this.API_URL}/${filingId}/pdf`, { responseType: 'blob' });
  }
}
