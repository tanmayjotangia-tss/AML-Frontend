import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../shared/models/api-response.model';
import { 
  TenantUserResponseDto, 
  CreateTenantUserRequestDto, 
  UpdateTenantUserRequestDto,
  ChangePasswordRequestDto,
  Role
} from '../models/user.model';
import { Page } from '../models/tenant.model';

@Injectable({
  providedIn: 'root'
})
export class TenantUserService {
  private http = inject(HttpClient);
  private readonly API_URL = '/api/v1/users';

  createComplianceOfficer(dto: CreateTenantUserRequestDto): Observable<ApiResponse<TenantUserResponseDto>> {
    return this.http.post<ApiResponse<TenantUserResponseDto>>(this.API_URL, dto);
  }

  listUsers(role?: Role, page: number = 0, size: number = 20): Observable<ApiResponse<Page<TenantUserResponseDto>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    if (role) {
      params = params.set('role', role);
    }
    
    return this.http.get<ApiResponse<Page<TenantUserResponseDto>>>(this.API_URL, { params });
  }

  getUserById(id: string): Observable<ApiResponse<TenantUserResponseDto>> {
    return this.http.get<ApiResponse<TenantUserResponseDto>>(`${this.API_URL}/${id}`);
  }

  updateUser(id: string, dto: UpdateTenantUserRequestDto): Observable<ApiResponse<TenantUserResponseDto>> {
    return this.http.put<ApiResponse<TenantUserResponseDto>>(`${this.API_URL}/${id}`, dto);
  }

  deactivateUser(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/${id}/deactivate`);
  }

  reactivateUser(id: string, tenantId?: string): Observable<ApiResponse<void>> {
    let headers = {};
    if (tenantId) {
      headers = { 'X-Tenant-ID': tenantId };
    }
    return this.http.patch<ApiResponse<void>>(`${this.API_URL}/${id}/reactivate`, {}, { headers });
  }

  unlockUser(id: string): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.API_URL}/${id}/unlock`, {});
  }

  resetPassword(id: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.API_URL}/${id}/reset-password`, {});
  }

  changePassword(dto: ChangePasswordRequestDto): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.API_URL}/change-password`, dto);
  }
}
