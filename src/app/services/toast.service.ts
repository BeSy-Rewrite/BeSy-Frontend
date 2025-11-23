import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ToastRequest, ToastResponse } from '../components/toast/toast.component';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  toasts: BehaviorSubject<ToastResponse[]> = new BehaviorSubject<ToastResponse[]>([]);

  addToast(toastRequest: ToastRequest): ToastResponse {
    const id = Date.now();
    const toastResponse: ToastResponse = {
      id,
      ...toastRequest,
      cancel: () => this.removeToast(id)
    };
    const currentToasts = this.toasts.getValue();
    this.toasts.next([...currentToasts, toastResponse]);
    return toastResponse;
  }

  removeToast(_id: number): void {
    const currentToasts = this.toasts.getValue();
    const updatedToasts = currentToasts.filter(toast => toast.id !== _id);
    this.toasts.next(updatedToasts);
  }
}
