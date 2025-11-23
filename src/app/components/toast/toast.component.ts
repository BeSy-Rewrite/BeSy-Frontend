import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ToastService } from '../../services/toast.service';

export interface ToastRequest {
  message: string;
  type: 'success' | 'error' | 'info';
  isPersistent?: boolean;
  duration?: number;
};

export interface ToastResponse extends ToastRequest {
  id: number;
  cancel: () => void;
}


@Component({
  selector: 'app-toast',
  imports: [
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss'
})
export class ToastComponent {

  toasts: ToastResponse[] = [];

  constructor(private readonly toastService: ToastService) {
    this.toastService.toasts.subscribe(toasts => {
      this.toasts = toasts;
    });
  }

  getClassForToast(toast: ToastRequest): string {
    switch (toast.type) {
      case 'success':
        return 'border-green-400';
      case 'error':
        return 'border-red-400';
      case 'info':
        return 'border-blue-400';
      default:
        return '';
    }
  }

  removeToast(id: number): void {
    this.toastService.removeToast(id);
  }
}
