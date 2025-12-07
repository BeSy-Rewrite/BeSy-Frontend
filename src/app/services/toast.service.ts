import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ToastRequest, ToastResponse } from '../components/toast/toast.component';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  toasts: BehaviorSubject<ToastResponse[]> = new BehaviorSubject<ToastResponse[]>([]);

  /**
   * Adds a new toast notification.
   * @param toastRequest The toast request data.
   * @returns The created ToastResponse object.
   */
  addToast(toastRequest: ToastRequest): ToastResponse {
    const toastResponse = this.createToastResponse(toastRequest);

    const currentToasts = this.toasts.getValue();
    this.toasts.next([...currentToasts, toastResponse]);

    if (toastRequest.duration) {
      setTimeout(() => this.removeToast(toastResponse.id, true), toastRequest.duration);
    }
    return toastResponse;
  }

  /**
   * Creates a ToastResponse object from a ToastRequest.
   * @param toastRequest The toast request data.
   * @returns A ToastResponse object.
   */
  private createToastResponse(toastRequest: ToastRequest): ToastResponse {
    const id = Date.now();
    return {
      id,
      ...toastRequest,
      cancel: (force?: boolean) => this.removeToast(id, force)
    };
  }

  /**
   * Removes a toast by its ID.
   * @param id The ID of the toast to remove.
   * @param force Optional flag to force removal of persistent toasts.
   */
  removeToast(id: number, force?: boolean): void {
    const currentToasts = this.toasts.getValue();
    if (currentToasts.find(toast => toast.id === id)?.isPersistent && !force) return;

    this.toasts.next(currentToasts.filter(toast => toast.id !== id));
  }
}
