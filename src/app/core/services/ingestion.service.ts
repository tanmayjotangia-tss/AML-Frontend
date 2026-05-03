import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../shared/models/api-response.model';
import { Page } from '../models/tenant.model';
import {
  TransactionBatchResponseDto,
  BatchFileType
} from '../models/ingestion.model';

@Injectable({ providedIn: 'root' })
export class IngestionService {
  private http = inject(HttpClient);
  private readonly BASE_URL = '/api/v1/ingestion';

  uploadBatchFile(file: File, fileType: BatchFileType): Observable<ApiResponse<TransactionBatchResponseDto>> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<ApiResponse<TransactionBatchResponseDto>>(
      `${this.BASE_URL}/${fileType}/upload`,
      formData
    );
  }

  getBatchStatus(batchId: string): Observable<ApiResponse<TransactionBatchResponseDto>> {
    return this.http.get<ApiResponse<TransactionBatchResponseDto>>(
      `${this.BASE_URL}/batches/${batchId}`
    );
  }

  getAllBatches(
    fileType?: BatchFileType,
    page: number = 0,
    size: number = 10
  ): Observable<ApiResponse<Page<TransactionBatchResponseDto>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', 'sysCreatedAt,desc');
    if (fileType) params = params.set('fileType', fileType);
    return this.http.get<ApiResponse<Page<TransactionBatchResponseDto>>>(
      `${this.BASE_URL}/batches`,
      { params }
    );
  }
}
