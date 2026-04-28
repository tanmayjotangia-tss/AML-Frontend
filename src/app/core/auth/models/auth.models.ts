export interface LoginRequestDto {
  email: string;
  password: string;
  tenantCode?: string; 
}

export interface LoginResponseDto {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  username: string;
  role: string;
  tenantId?: string;
  isFirstLogin: boolean;
}

export interface TokenRefreshRequestDto {
  refreshToken: string;
}

export interface ChangePasswordRequestDto {
  oldPassword: string;
  newPassword: string;
}
