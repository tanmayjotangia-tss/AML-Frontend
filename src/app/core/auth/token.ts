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

  private getDecodedToken(): any {
    const token = this.getAccessToken();
    if (!token) return null;
    return this.decodeToken(token);
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
    const decoded = this.getDecodedToken();
    return decoded?.tenantId || null;
  }

  getRole(): string | null {
    const decoded = this.getDecodedToken();
    let role = decoded?.role || decoded?.roles?.[0] || null;
    if (role && role.startsWith('ROLE_')) {
      role = role.substring(5);
    }
    return role;
  }

  getUserId(): string | null {
    const decoded = this.getDecodedToken();
    return decoded?.sub || decoded?.userId || null;
  }

  getUsername(): string | null {
    const decoded = this.getDecodedToken();
    return decoded?.username || decoded?.sub || null;
  }

  clear(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    // These were removed from saveUserInfo but clearing just in case old ones exist
    localStorage.removeItem(this.TENANT_ID_KEY);
    localStorage.removeItem(this.ROLE_KEY);
    localStorage.removeItem(this.USER_ID_KEY);
    localStorage.removeItem(this.USERNAME_KEY);
  }
}
