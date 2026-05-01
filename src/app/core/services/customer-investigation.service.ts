import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../shared/models/api-response.model';
import { Page } from '../models/tenant.model';
import { CustomerProfileResponseDto, TransactionSummaryDto } from '../models/customer.model';

@Injectable({
  providedIn: 'root'
})
export class CustomerInvestigationService {
  private http = inject(HttpClient);
  private readonly API_BASE = '/api/v1/customers';

  getAllCustomers(page: number = 0, size: number = 20): Observable<ApiResponse<Page<CustomerProfileResponseDto>>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<ApiResponse<Page<CustomerProfileResponseDto>>>(this.API_BASE, { params });
  }

  getCustomer360(accountNo: string): Observable<ApiResponse<CustomerProfileResponseDto>> {
    return this.http.get<ApiResponse<CustomerProfileResponseDto>>(`${this.API_BASE}/${accountNo}/360`);
  }

  getTransactionHistory(accountNo: string, page: number = 0, size: number = 20): Observable<ApiResponse<Page<TransactionSummaryDto>>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
      
    return this.http.get<ApiResponse<Page<TransactionSummaryDto>>>(`${this.API_BASE}/${accountNo}/transactions`, { params });
  }

  getLinkedAccounts(accountNo: string): Observable<ApiResponse<string[]>> {
    return this.http.get<ApiResponse<string[]>>(`${this.API_BASE}/${accountNo}/links`);
  }
}
