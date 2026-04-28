import { TenantResponseDto } from './tenant.model';

export interface PlatformDashboardStats {
  totalTenants: number;
  activeTenants: number;
  totalRules: number;
  totalScenarios: number;
  systemHealth: number; // percentage
}

export interface PlatformDashboardResponseDto {
  stats: PlatformDashboardStats;
  recentTenants: TenantResponseDto[];
}
