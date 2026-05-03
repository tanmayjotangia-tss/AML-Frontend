import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map, of } from 'rxjs';
import { ApiResponse } from '../../shared/models/api-response.model';
import { TenantDashboardResponseDto } from '../models/tenant-dashboard.model';
import { CaseService } from './case.service';
import { AlertService } from './alert.service';
import { TenantUserService } from './tenant-user.service';
import { TokenService } from '../auth/token';

@Injectable({
  providedIn: 'root'
})
export class TenantDashboardService {
  private caseService = inject(CaseService);
  private alertService = inject(AlertService);
  private userService = inject(TenantUserService);
  private tokenService = inject(TokenService);

  getDashboardData(): Observable<ApiResponse<TenantDashboardResponseDto>> {
    const currentUsername = this.tokenService.getUsername();

    return forkJoin({
      cases: this.caseService.getCases(0, 100),
      alerts: this.alertService.getAlerts(undefined, undefined, undefined, undefined, 0, 10),
      severityCounts: this.alertService.getSeverityCounts(),
      users: this.userService.listUsers(undefined, 0, 100)
    }).pipe(
      map(res => {
        const cases = res.cases.data?.content || [];
        const alerts = res.alerts.data?.content || [];
        const sevCounts = res.severityCounts.data || { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
        const userList = res.users.data?.content || [];
        const totalUsers = res.users.data?.totalElements || 0;

        const stats = {
          totalOpenCases: cases.filter(c => c.status === 'OPEN').length,
          criticalAlerts: sevCounts.CRITICAL || 0,
          strsFiled: cases.filter(c => c.status === 'CLOSED_STR').length,
          pendingReview: cases.filter(c => c.status === 'ESCALATED').length,
          totalUsers,
          systemHealth: 'Healthy'
        };

        const userMap = new Map<string, { name: string, empId: string }>();
        userList.forEach(u => {
          userMap.set(u.employeeId, { name: u.fullName, empId: u.employeeId });
          userMap.set(u.id, { name: u.fullName, empId: u.employeeId });
        });

        const workloadMap = new Map<string, number>();
        cases.forEach(c => {
          if (c.assignedTo) {
            workloadMap.set(c.assignedTo, (workloadMap.get(c.assignedTo) || 0) + 1);
          }
        });

        const userWorkload = Array.from(workloadMap.entries())
          .map(([username, caseCount]) => {
            const details = userMap.get(username) || { name: username, empId: username };
            return { 
              username, 
              fullName: details.name, 
              employeeId: details.empId,
              caseCount 
            };
          })
          .sort((a, b) => b.caseCount - a.caseCount)
          .slice(0, 5);

        const dashboardData: TenantDashboardResponseDto = {
          stats,
          recentAlerts: alerts,
          myAssignedCases: cases.filter(c => c.assignedTo === currentUsername).slice(0, 5),
          userWorkload
        };

        return {
          status: 200,
          message: 'Dashboard data aggregated successfully',
          data: dashboardData,
          timestamp: new Date().toISOString(),
          path: '/api/v1/tenant/dashboard (aggregated)'
        };
      })
    );
  }
}
