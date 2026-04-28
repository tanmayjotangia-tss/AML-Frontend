import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, forkJoin, map, of } from 'rxjs';
import { ApiResponse } from '../../shared/models/api-response.model';
import { PlatformDashboardResponseDto } from '../models/platform-dashboard.model';
import { TenantService } from './tenant.service';
import { GlobalRuleService } from './global-rule.service';
import { GlobalScenarioService } from './global-scenario.service';

@Injectable({
  providedIn: 'root'
})
export class PlatformDashboardService {
  private http = inject(HttpClient);
  private tenantService = inject(TenantService);
  private ruleService = inject(GlobalRuleService);
  private scenarioService = inject(GlobalScenarioService);

  private readonly API_URL = '/api/v1/platform/dashboard';

  getDashboardDetails(): Observable<ApiResponse<PlatformDashboardResponseDto>> {
    // Directly use aggregation until the backend endpoint is implemented to avoid backend logs noise
    return this.getAggregatedDashboardData();
  }

  private getAggregatedDashboardData(): Observable<ApiResponse<PlatformDashboardResponseDto>> {
    return forkJoin({
      tenants: this.tenantService.listTenants(0, 5),
      rules: this.ruleService.listRules(0, 1),
      scenarios: this.scenarioService.listScenarios(0, 1)
    }).pipe(
      map(res => {
        const tenantPage = res.tenants.data;
        const tenants = Array.isArray(tenantPage) ? tenantPage : (tenantPage?.content || []);
        const totalTenants = (tenantPage as any)?.totalElements || tenants.length;
        
        const dashboardData: PlatformDashboardResponseDto = {
          stats: {
            totalTenants: totalTenants,
            activeTenants: tenants.filter(t => t.status === 'ACTIVE').length,
            totalRules: (res.rules.data as any)?.totalElements || (res.rules.data as any)?.length || 0,
            totalScenarios: (res.scenarios.data as any)?.totalElements || (res.scenarios.data as any)?.length || 0,
            systemHealth: 100
          },
          recentTenants: tenants.slice(0, 5)
        };

        return {
          status: 200,
          message: 'Dashboard data aggregated successfully',
          data: dashboardData,
          timestamp: new Date().toISOString(),
          path: '/api/v1/platform/dashboard (mock)'
        };
      })
    );
  }
}
