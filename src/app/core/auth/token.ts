import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly TENANT_ID_KEY = 'tenant_id';
  private readonly ROLE_KEY = 'user_role';
  private readonly USER_ID_KEY = 'user_id';
  private readonly USERNAME_KEY = 'user_name';

  saveTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  saveUserInfo(role: string, userId: string, username: string, tenantId?: string): void {
    const formattedRole = role && role.startsWith('ROLE_') ? role.substring(5) : role;
    localStorage.setItem(this.ROLE_KEY, formattedRole);
    localStorage.setItem(this.USERNAME_KEY, username);
    if (tenantId) {
      localStorage.setItem(this.TENANT_ID_KEY, tenantId);
    } else {
      localStorage.removeItem(this.TENANT_ID_KEY);
    }

    let finalUserId = userId;
    if (!finalUserId || finalUserId === 'undefined') {
      const token = this.getAccessToken();
      if (token) {
        const decoded = this.decodeToken(token);
        if (decoded && decoded.sub) finalUserId = decoded.sub;
      }
    }
    if (finalUserId) localStorage.setItem(this.USER_ID_KEY, finalUserId);
  }

  private decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(window.atob(base64));
    } catch (e) {
      return null;
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

  getUserId(): string | null {
    const id = localStorage.getItem(this.USER_ID_KEY);
    return id === 'undefined' ? null : id;
  }

  getUsername(): string | null {
    return localStorage.getItem(this.USERNAME_KEY);
  }

  clear(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.TENANT_ID_KEY);
    localStorage.removeItem(this.ROLE_KEY);
    localStorage.removeItem(this.USER_ID_KEY);
    localStorage.removeItem(this.USERNAME_KEY);
  }
}
