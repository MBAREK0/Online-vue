import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastSignal = signal<ToastMessage | null>(null);

  toast = this.toastSignal.asReadonly();

  showSuccess(message: string): void {
    this.toastSignal.set({ message, type: 'success' });
  }

  showError(message: string): void {
    this.toastSignal.set({ message, type: 'error' });
  }

  showWarning(message: string): void {
    this.toastSignal.set({ message, type: 'warning' });
  }

  showInfo(message: string): void {
    this.toastSignal.set({ message, type: 'info' });
  }

  clear(): void {
    this.toastSignal.set(null);
  }
}
