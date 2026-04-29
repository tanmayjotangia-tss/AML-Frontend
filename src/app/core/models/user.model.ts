export enum Role {
  BANK_ADMIN = 'BANK_ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
  COMPLIANCE_OFFICER = 'COMPLIANCE_OFFICER'
}

export interface TenantUserResponseDto {
  id: string;
  employeeId: string;
  fullName: string;
  email: string;
  role: Role;
  isFirstLogin: boolean;
  isLocked: boolean;
  lastLoginAt?: string;
  lastLoginIp?: string;
  sysCreatedAt?: string;
  sysUpdatedAt?: string;
}

export interface CreateTenantUserRequestDto {
  employeeId: string;
  fullName: string;
  email: string;
  password?: string;
  role: Role;
}

export interface UpdateTenantUserRequestDto {
  fullName: string;
  role: Role;
  isLocked: boolean;
}

export interface ChangePasswordRequestDto {
  oldPassword: string;
  newPassword: string;
}
