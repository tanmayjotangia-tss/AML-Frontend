import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenService } from './token';

export const roleGuard: CanActivateFn = (route, state) => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  const expectedRoles = route.data['roles'] as Array<string>;
  const userRole = tokenService.getRole();

  if (!expectedRoles || expectedRoles.length === 0) {
    return true;
  }

  if (userRole && expectedRoles.includes(userRole)) {
    return true;
  }

  // User doesn't have the required role. Redirect based on what role they do have.
  if (userRole === 'PLATFORM_ADMIN') {
    router.navigate(['/system/dashboard']);
  } else if (userRole === 'BANK_ADMIN' || userRole === 'COMPLIANCE_OFFICER') {
    router.navigate(['/tenant/dashboard']);
  } else {
    router.navigate(['/admin-login']);
  }
  
  return false;
};
