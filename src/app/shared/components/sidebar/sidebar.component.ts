import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface NavItem {
  label: string;
  route: string;
  icon?: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="logo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
        <div class="brand">AML System</div>
      </div>
      
      <nav class="sidebar-nav">
        <ul class="nav-list">
          <li *ngFor="let item of navItems" class="nav-item">
            <a [routerLink]="item.route" routerLinkActive="active" class="nav-link">
              <span class="nav-icon" *ngIf="item.icon" [innerHTML]="item.icon"></span>
              <span class="nav-label">{{ item.label }}</span>
            </a>
          </li>
        </ul>
      </nav>
      
      <div class="sidebar-footer">
        <p>Version 1.0.0</p>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: var(--sidebar-width, 260px);
      height: 100vh;
      background-color: #ffffff;
      border-right: 1px solid #e2e8f0;
      display: flex;
      flex-direction: column;
      position: fixed;
      left: 0;
      top: 0;
      z-index: 100;
      font-family: 'Inter', sans-serif;
    }

    .sidebar-header {
      height: var(--topbar-height, 64px);
      display: flex;
      align-items: center;
      padding: 0 20px;
      border-bottom: 1px solid #e2e8f0;
    }

    .logo {
      width: 32px;
      height: 32px;
      background: #2563eb;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;
      flex-shrink: 0;
    }

    .logo svg {
      width: 18px;
      height: 18px;
      color: white;
    }

    .brand {
      font-weight: 600;
      font-size: 15px;
      color: #0f172a;
    }

    .sidebar-nav {
      flex: 1;
      padding: 20px 12px;
      overflow-y: auto;
    }

    .nav-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .nav-link {
      display: flex;
      align-items: center;
      padding: 10px 12px;
      border-radius: 6px;
      color: #64748b;
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.15s ease;
    }

    .nav-link:hover {
      background-color: #f1f5f9;
      color: #0f172a;
    }

    .nav-link.active {
      background-color: #eff6ff;
      color: #2563eb;
      font-weight: 600;
    }

    .nav-icon {
      width: 20px;
      height: 20px;
      margin-right: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .nav-icon svg {
      width: 18px;
      height: 18px;
    }

    .sidebar-footer {
      padding: 16px 20px;
      border-top: 1px solid #e2e8f0;
      font-size: 12px;
      color: #94a3b8;
    }
    
    .sidebar-footer p {
      margin: 0;
    }
  `]
})
export class SidebarComponent {
  @Input() navItems: NavItem[] = [];
}
