import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginRequestDto, LoginResponseDto, ChangePasswordRequestDto } from './models/auth.models';
import { ApiResponse } from '../../shared/models/api-response.model';
import { TokenService } from './token';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private tokenService = inject(TokenService);
  private router = inject(Router);

  private readonly API_URL = '/api/v1/auth';

  login(credentials: LoginRequestDto): Observable<ApiResponse<LoginResponseDto>> {
    return this.http.post<ApiResponse<LoginResponseDto>>(`${this.API_URL}/login`, credentials).pipe(
      tap(response => {
        if (response.data) {
          this.tokenService.saveTokens(response.data.accessToken, response.data.refreshToken);
          this.tokenService.saveUserInfo(
            response.data.role, 
            response.data.userId, 
            response.data.username,
            response.data.tenantId
          );
        }
      })
    );
  }

  logout(): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.API_URL}/logout`, {}).pipe(
      tap(() => this.doLocalLogout())
    );
  }

  changePassword(data: ChangePasswordRequestDto): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.API_URL}/change-password`, data);
  }

  doLocalLogout(): void {
    const role = this.tokenService.getRole();
    this.tokenService.clear();
    if (role === 'SUPER_ADMIN') {
      this.router.navigate(['/admin-login']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  isAuthenticated(): boolean {
    return !!this.tokenService.getAccessToken();
  }
}
