import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../shared/models/api-response.model';
import { Page } from '../models/tenant.model'; // Reusing Page interface
import { 
  CreateGeographicRiskRequestDto, 
  GeographicRiskRatingResponseDto 
} from '../models/geographic-risk.model';

@Injectable({
  providedIn: 'root'
})
export class GeographicRiskService {
  private http = inject(HttpClient);
  private readonly API_URL = '/api/v1/platform/geo-risk';

  upsertRating(requestDto: CreateGeographicRiskRequestDto): Observable<ApiResponse<GeographicRiskRatingResponseDto>> {
    return this.http.post<ApiResponse<GeographicRiskRatingResponseDto>>(this.API_URL, requestDto);
  }

  bulkUpsert(requestDtos: CreateGeographicRiskRequestDto[]): Observable<ApiResponse<GeographicRiskRatingResponseDto[]>> {
    return this.http.post<ApiResponse<GeographicRiskRatingResponseDto[]>>(`${this.API_URL}/bulk`, requestDtos);
  }

  listRatings(page: number = 0, size: number = 20): Observable<ApiResponse<Page<GeographicRiskRatingResponseDto>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<ApiResponse<Page<GeographicRiskRatingResponseDto>>>(this.API_URL, { params });
  }

  getRating(countryCode: string): Observable<ApiResponse<GeographicRiskRatingResponseDto>> {
    return this.http.get<ApiResponse<GeographicRiskRatingResponseDto>>(`${this.API_URL}/${countryCode}`);
  }

  deleteRating(countryCode: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/${countryCode}`);
  }
}
