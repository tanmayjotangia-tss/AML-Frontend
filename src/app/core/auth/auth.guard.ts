import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // If not authenticated, redirect to default admin login.
  // Real users will know their /tenantAlias/login path.
  router.navigate(['/admin-login']);
  return false;
};
