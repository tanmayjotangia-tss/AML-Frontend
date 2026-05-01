import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div *ngFor="let toast of toastService.messages()" 
           [class]="'toast-item ' + toast.type"
           (click)="toastService.remove(toast.id)">
        <div class="toast-icon">
          <span *ngIf="toast.type === 'success'">✅</span>
          <span *ngIf="toast.type === 'error'">❌</span>
          <span *ngIf="toast.type === 'info'">ℹ️</span>
          <span *ngIf="toast.type === 'warning'">⚠️</span>
        </div>
        <div class="toast-message">{{ toast.message }}</div>
        <button class="toast-close">✕</button>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 24px;
      right: 24px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 12px;
      pointer-events: none;
    }

    .toast-item {
      pointer-events: auto;
      min-width: 300px;
      max-width: 450px;
      padding: 16px;
      border-radius: 12px;
      background: white;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      animation: toast-in 0.3s cubic-bezier(0, 0, 0.2, 1);
      border-left: 6px solid #cbd5e1;
      transition: transform 0.2s;
    }

    .toast-item:hover {
      transform: translateY(-2px);
    }

    .toast-item.success { border-left-color: #22c55e; background: #f0fdf4; }
    .toast-item.error { border-left-color: #ef4444; background: #fef2f2; }
    .toast-item.info { border-left-color: #3b82f6; background: #eff6ff; }
    .toast-item.warning { border-left-color: #f59e0b; background: #fffbeb; }

    .toast-icon {
      font-size: 1.25rem;
      flex-shrink: 0;
    }

    .toast-message {
      flex-grow: 1;
      font-size: 0.9375rem;
      font-weight: 500;
      color: #1e293b;
      line-height: 1.4;
    }

    .toast-close {
      background: transparent;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      font-size: 1rem;
      padding: 4px;
      opacity: 0.5;
      transition: opacity 0.2s;
    }

    .toast-close:hover {
      opacity: 1;
    }

    @keyframes toast-in {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `]
})
export class ToastComponent {
  toastService = inject(ToastService);
}
