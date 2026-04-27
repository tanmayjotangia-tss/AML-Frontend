import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth/auth';
import { TokenService } from '../../../core/auth/token';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="topbar">
      <div class="topbar-left">
        <!-- Optional contextual title or breadcrumbs could go here -->
      </div>
      
      <div class="topbar-right">
        <div class="user-info">
          <span class="role-badge">{{ userRole }}</span>
          <div class="avatar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
        </div>
        
        <button class="logout-btn" (click)="logout()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          Logout
        </button>
      </div>
    </header>
  `,
  styles: [`
    .topbar {
      height: var(--topbar-height, 64px);
      background-color: #ffffff;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      font-family: 'Inter', sans-serif;
      position: sticky;
      top: 0;
      z-index: 90;
    }

    .topbar-left {
      display: flex;
      align-items: center;
    }

    .topbar-right {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
      padding-right: 20px;
      border-right: 1px solid #e2e8f0;
    }

    .role-badge {
      font-size: 11px;
      font-weight: 600;
      padding: 4px 8px;
      background: #f1f5f9;
      color: #475569;
      border-radius: 4px;
      letter-spacing: 0.5px;
    }

    .avatar {
      width: 32px;
      height: 32px;
      background: #e2e8f0;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #64748b;
    }

    .avatar svg {
      width: 16px;
      height: 16px;
    }

    .logout-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      background: transparent;
      border: none;
      color: #64748b;
      font-size: 14px;
      font-weight: 500;
      font-family: inherit;
      cursor: pointer;
      padding: 6px 12px;
      border-radius: 6px;
      transition: all 0.15s ease;
    }

    .logout-btn:hover {
      background: #fef2f2;
      color: #ef4444;
    }

    .logout-btn svg {
      width: 16px;
      height: 16px;
    }
  `]
})
export class TopbarComponent {
  private authService = inject(AuthService);
  private tokenService = inject(TokenService);

  userRole: string = this.tokenService.getRole()?.replace('_', ' ') || 'USER';

  logout() {
    this.authService.logout().subscribe({
      next: () => console.log('Logout successful'),
      error: () => this.authService.doLocalLogout() // Fallback to local clear
    });
  }
}
