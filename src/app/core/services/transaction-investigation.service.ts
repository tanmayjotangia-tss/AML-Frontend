import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../shared/models/api-response.model';
import { Page } from '../models/tenant.model';
import { TransactionResponseDto } from '../models/transaction.model';

@Injectable({
  providedIn: 'root'
})
export class TransactionInvestigationService {
  private http = inject(HttpClient);
  private readonly API_BASE = '/api/v1/investigation/transactions';

  getAllTransactions(page: number = 0, size: number = 20): Observable<ApiResponse<Page<TransactionResponseDto>>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', 'transactionTimestamp,desc');
    
    return this.http.get<ApiResponse<Page<TransactionResponseDto>>>(this.API_BASE, { params });
  }

  getTransactionDetails(transactionRef: string): Observable<ApiResponse<TransactionResponseDto>> {
    return this.http.get<ApiResponse<TransactionResponseDto>>(`${this.API_BASE}/${transactionRef}`);
  }
}
