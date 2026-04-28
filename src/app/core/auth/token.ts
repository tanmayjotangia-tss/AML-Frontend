import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly TENANT_ID_KEY = 'tenant_id';
  private readonly ROLE_KEY = 'user_role';

  saveTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  saveUserInfo(role: string, tenantId?: string): void {
    const formattedRole = role && role.startsWith('ROLE_') ? role.substring(5) : role;
    localStorage.setItem(this.ROLE_KEY, formattedRole);
    if (tenantId) {
      localStorage.setItem(this.TENANT_ID_KEY, tenantId);
    } else {
      localStorage.removeItem(this.TENANT_ID_KEY);
    }
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  getTenantId(): string | null {
    return localStorage.getItem(this.TENANT_ID_KEY);
  }

  getRole(): string | null {
    return localStorage.getItem(this.ROLE_KEY);
  }

  clear(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.TENANT_ID_KEY);
    localStorage.removeItem(this.ROLE_KEY);
  }
}
