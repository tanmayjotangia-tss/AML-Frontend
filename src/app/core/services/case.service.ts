import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../shared/models/api-response.model';
import { 
  CaseResponseDto, 
  CreateCaseRequest, 
  ReassignCaseRequest,
  FalsePositiveClosureRequest,
  StrClosureRequest,
  EscalationRequestDto,
  CaseNoteRequestDto,
  CaseAuditTrailResponseDto
} from '../models/case.model';
import { AlertResponseDto } from '../models/alert.model';

@Injectable({
  providedIn: 'root'
})
export class CaseService {
  private http = inject(HttpClient);
  private readonly API_URL = '/api/v1/cases';
  private readonly INVESTIGATION_URL = '/api/v1/cases/investigation';


  getCases(page: number = 0, size: number = 20): Observable<ApiResponse<{ content: CaseResponseDto[], totalElements: number, totalPages: number }>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<ApiResponse<{ content: CaseResponseDto[], totalElements: number, totalPages: number }>>(this.API_URL, { params });
  }

  createCase(dto: CreateCaseRequest): Observable<ApiResponse<CaseResponseDto>> {
    return this.http.post<ApiResponse<CaseResponseDto>>(this.API_URL, dto);
  }

  getCaseDetails(caseRef: string): Observable<ApiResponse<CaseResponseDto>> {
    return this.http.get<ApiResponse<CaseResponseDto>>(`${this.API_URL}/${caseRef}`);
  }

  reassignCase(caseRef: string, dto: ReassignCaseRequest): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.API_URL}/${caseRef}/reassign`, dto);
  }


  closeAsFalsePositive(caseId: string, dto: FalsePositiveClosureRequest, closedBy: string): Observable<ApiResponse<void>> {
    const params = new HttpParams().set('closedBy', closedBy);
    return this.http.post<ApiResponse<void>>(`${this.API_URL}/${caseId}/close/false-positive`, dto, { params });
  }

  closeAfterStr(caseId: string, dto: StrClosureRequest, closedBy: string): Observable<ApiResponse<void>> {
    const params = new HttpParams().set('closedBy', closedBy);
    return this.http.post<ApiResponse<void>>(`${this.API_URL}/${caseId}/close/str`, dto, { params });
  }


  escalateCase(caseRef: string, dto: EscalationRequestDto): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.API_URL}/${caseRef}/escalate`, dto);
  }


  openCaseInvestigation(caseId: string, actorId: string): Observable<ApiResponse<void>> {
    const params = new HttpParams().set('actorId', actorId);
    return this.http.patch<ApiResponse<void>>(`${this.INVESTIGATION_URL}/${caseId}/open`, {}, { params });
  }

  addInvestigationNote(caseId: string, dto: CaseNoteRequestDto): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.INVESTIGATION_URL}/${caseId}/notes`, dto);
  }

  getCaseAuditTrail(caseId: string): Observable<ApiResponse<CaseAuditTrailResponseDto[]>> {
    return this.http.get<ApiResponse<CaseAuditTrailResponseDto[]>>(`${this.INVESTIGATION_URL}/${caseId}/audit-trail`);
  }

  exportAuditTrail(caseId: string): Observable<Blob> {
    return this.http.get(`${this.INVESTIGATION_URL}/${caseId}/audit-trail/export`, { responseType: 'blob' });
  }

  getAlertsForCase(caseId: string): Observable<ApiResponse<AlertResponseDto[]>> {
    return this.http.get<ApiResponse<AlertResponseDto[]>>(`${this.INVESTIGATION_URL}/${caseId}/alerts`);
  }
}
