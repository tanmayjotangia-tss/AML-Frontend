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
      // 401 means session expired or revoked
      if (error.status === 401 && !isAuthRequest && !isAlertShowing) {
        isAlertShowing = true;
        
        // Try to get role from token before clearing, fallback to URL detection
        let role = tokenService.getRole();
        const currentUrl = router.url;
        
        tokenService.clear();
        
        toast.error('Your session has expired. Please log in again.');

        // Determine correct login page
        if (role === 'SUPER_ADMIN' || currentUrl.startsWith('/system')) {
          router.navigate(['/admin-login']);
        } else {
          router.navigate(['/login']);
        }

        // Reset flag after a delay to allow navigation to complete
        setTimeout(() => {
          isAlertShowing = false;
        }, 1000);
      }
      return throwError(() => error);
    })
  );
};
