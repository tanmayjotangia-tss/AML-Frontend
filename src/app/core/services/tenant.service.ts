import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../shared/models/api-response.model';
import { 
  TenantResponseDto, 
  CreateTenantRequestDto, 
  UpdateTenantRequestDto,
  Page
} from '../models/tenant.model';

@Injectable({
  providedIn: 'root'
})
export class TenantService {
  private http = inject(HttpClient);
  private readonly API_URL = '/api/v1/platform/tenants';

  createTenant(requestDto: CreateTenantRequestDto): Observable<ApiResponse<TenantResponseDto>> {
    return this.http.post<ApiResponse<TenantResponseDto>>(this.API_URL, requestDto);
  }

  listTenants(page: number = 0, size: number = 20): Observable<ApiResponse<Page<TenantResponseDto>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<ApiResponse<Page<TenantResponseDto>>>(this.API_URL, { params });
  }

  getTenant(id: string): Observable<ApiResponse<TenantResponseDto>> {
    return this.http.get<ApiResponse<TenantResponseDto>>(`${this.API_URL}/${id}`);
  }

  getTenantByCode(code: string): Observable<ApiResponse<TenantResponseDto>> {
    return this.http.get<ApiResponse<TenantResponseDto>>(`${this.API_URL}/by-code/${code}`);
  }

  updateTenant(id: string, requestDto: UpdateTenantRequestDto): Observable<ApiResponse<TenantResponseDto>> {
    return this.http.patch<ApiResponse<TenantResponseDto>>(`${this.API_URL}/${id}`, requestDto);
  }

  reactivateTenant(id: string): Observable<ApiResponse<TenantResponseDto>> {
    return this.http.post<ApiResponse<TenantResponseDto>>(`${this.API_URL}/${id}/reactivate`, {});
  }

  deactivateTenant(id: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.API_URL}/${id}/deactivate`, {});
  }

  resetAdminCredentials(id: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.API_URL}/${id}/reset-admin`, {});
  }

  checkTenantCodeAvailability(code: string): Observable<ApiResponse<boolean>> {
    let params = new HttpParams().set('code', code);
    return this.http.get<ApiResponse<boolean>>(`${this.API_URL}/validate/tenant-code`, { params });
  }

  checkSchemaNameAvailability(name: string): Observable<ApiResponse<boolean>> {
    let params = new HttpParams().set('name', name);
    return this.http.get<ApiResponse<boolean>>(`${this.API_URL}/validate/schema-name`, { params });
  }
}
