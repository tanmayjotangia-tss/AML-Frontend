import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { SystemLayout } from './layout/system-layout/system-layout';
import { TenantLayout } from './layout/tenant-layout/tenant-layout';
import { authGuard } from './core/auth/auth.guard';
import { roleGuard } from './core/auth/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login, data: { isPlatform: false } },
  { path: 'admin-login', component: Login, data: { isPlatform: true } },
  {
    path: 'system',
    component: SystemLayout,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['SUPER_ADMIN'] },
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/system/dashboard/dashboard').then(m => m.Dashboard) },
      { path: 'rule-engine', loadComponent: () => import('./features/system/rule-engine/rule-engine').then(m => m.RuleEngine) },
      { path: 'tenants', loadComponent: () => import('./features/system/tenants/tenants').then(m => m.Tenants) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  {
    path: 'tenant',
    component: TenantLayout,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['BANK_ADMIN', 'COMPLIANCE_OFFICER'] },
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/tenant/dashboard/dashboard').then(m => m.Dashboard) },
      { path: 'alerts', loadComponent: () => import('./features/tenant/alerts/alerts').then(m => m.Alerts) },
      { path: 'cases', loadComponent: () => import('./features/tenant/cases/cases').then(m => m.Cases) },
      { path: 'investigation', loadComponent: () => import('./features/tenant/investigation/investigation').then(m => m.Investigation) },
      { path: 'str', loadComponent: () => import('./features/tenant/str/str').then(m => m.Str) },
      { path: 'rule-engine', loadComponent: () => import('./features/tenant/rule-engine/rule-engine').then(m => m.RuleEngine) },
      { path: 'users', loadComponent: () => import('./features/tenant/users/users').then(m => m.Users) },
      { path: 'upload', loadComponent: () => import('./features/tenant/upload/upload').then(m => m.Upload) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
