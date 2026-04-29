import { CaseResponseDto } from './case.model';
import { AlertResponseDto } from './alert.model';

export interface UserWorkload {
  username: string; // The code/ID used in cases
  fullName: string;
  employeeId: string;
  caseCount: number;
}

export interface TenantDashboardStats {
  totalOpenCases: number;
  criticalAlerts: number;
  strsFiled: number;
  pendingReview: number;
  totalUsers: number;
  systemHealth: string; // e.g. 'Healthy', 'Issues'
}

export interface TenantDashboardResponseDto {
  stats: TenantDashboardStats;
  recentAlerts: AlertResponseDto[];
  myAssignedCases: CaseResponseDto[];
  userWorkload: UserWorkload[];
}
