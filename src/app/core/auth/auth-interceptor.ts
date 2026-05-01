import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { TokenService } from './token';
import { ToastService } from '../services/toast.service';

let isAlertShowing = false;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const router = inject(Router);
  const toast = inject(ToastService);
  
  const token = tokenService.getAccessToken();
  const tenantId = tokenService.getTenantId();

  let headers = req.headers;
  
  // Do not attach tokens or tenant IDs for login requests
  const isAuthRequest = req.url.includes('/auth/login');

  if (token && !isAuthRequest) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }

  if (tenantId && !isAuthRequest) {
    headers = headers.set('X-Tenant-ID', tenantId);
  }

  const clonedRequest = req.clone({ headers });

  return next(clonedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isAlertShowing) {
        isAlertShowing = true;
        // The token has expired or has been blacklisted
        console.warn('Session expired or revoked. Forcing logout.');
        
        // Show alert as requested by the user
        toast.error('Your session has expired. Please log in again.');
        
        const role = tokenService.getRole();
        tokenService.clear();
        
        isAlertShowing = false;
        if (role === 'SUPER_ADMIN') {
          router.navigate(['/admin-login']);
        } else {
          router.navigate(['/login']);
        }
      }
      return throwError(() => error);
    })
  );
};
