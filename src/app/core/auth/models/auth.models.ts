export interface LoginRequestDto {
  email: string;
  password: string;
  tenantAlias?: string; // Short code like 'SBI', 'HDFC'
}

export interface LoginResponseDto {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  username: string;
  role: string;
  tenantId?: string; // Null for Platform Users
  isFirstLogin: boolean;
}

export interface TokenRefreshRequestDto {
  refreshToken: string;
}

export interface ChangePasswordRequestDto {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}
