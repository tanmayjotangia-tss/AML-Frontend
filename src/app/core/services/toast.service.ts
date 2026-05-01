import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: number;
  type: ToastType;
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toasts = signal<ToastMessage[]>([]);
  readonly messages = this.toasts.asReadonly();
  private counter = 0;

  show(message: string, type: ToastType = 'info', duration: number = 5000) {
    const id = this.counter++;
    const toast: ToastMessage = { id, type, message, duration };
    
    // Wrap in setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => {
      this.toasts.update(current => [...current, toast]);
    });

    if (duration > 0) {
      setTimeout(() => this.remove(id), duration);
    }
  }


  success(message: string, duration?: number) {
    this.show(message, 'success', duration);
  }

  error(message: string, duration?: number) {
    this.show(message, 'error', duration);
  }

  info(message: string, duration?: number) {
    this.show(message, 'info', duration);
  }

  warning(message: string, duration?: number) {
    this.show(message, 'warning', duration);
  }

  remove(id: number) {
    setTimeout(() => {
      this.toasts.update(current => current.filter(t => t.id !== id));
    });
  }
}
