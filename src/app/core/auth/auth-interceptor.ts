import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { TokenService } from './token';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const router = inject(Router);
  
  const token = tokenService.getAccessToken();
  const tenantId = tokenService.getTenantId();

  let headers = req.headers;

  if (token) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }

  if (tenantId) {
    headers = headers.set('X-Tenant-ID', tenantId);
  }

  const clonedRequest = req.clone({ headers });

  return next(clonedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // The token has expired or has been blacklisted by JtiBlacklistService
        console.warn('Session expired or revoked. Forcing logout.');
        tokenService.clear();
        
        // Redirect to login.
        router.navigate(['/admin-login']);
      }
      return throwError(() => error);
    })
  );
};
