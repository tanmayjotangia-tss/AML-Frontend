import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Session expired or not authenticated
  const targetUrl = state.url;
  
  if (targetUrl.startsWith('/system')) {
    router.navigate(['/admin-login']);
  } else {
    router.navigate(['/login']);
  }

  return false;
};
