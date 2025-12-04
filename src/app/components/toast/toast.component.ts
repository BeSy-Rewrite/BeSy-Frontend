import { NgComponentOutlet } from '@angular/common';
import { afterNextRender, Component, ElementRef, input, signal, Type } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from "@angular/material/tooltip";
import { ToastService } from '../../services/toast.service';

/**
 * Data structure for requesting a toast notification.
 * @property message The message to display in the toast. Can be a string or an Angular Component.
 * @property type The type of the toast notification. Can be 'success', 'error', or 'info'.
 * @property inputs Optional inputs to pass to the component if message is a Component.
 * @property isPersistent Optional flag requiring forced dismissal of the toast.
 * @property duration Optional duration (in milliseconds) for which the toast should be displayed.
 */
export interface ToastRequest {
  message: string | Type<any>;
  type: 'success' | 'error' | 'info';
  inputs?: { [key: string]: any; };
  isPersistent?: boolean;
  duration?: number;
};

/**
 * Data structure for a toast notification response.
 * Extends ToastRequest with additional properties.
 * @property id Unique identifier for the toast.
 * @property cancel Function to cancel/dismiss the toast, with an optional force flag.
 */
export interface ToastResponse extends ToastRequest {
  id: number;
  cancel: (force?: boolean) => void;
}

/** Possible positions for toast notifications on the screen. */
export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';


@Component({
  selector: 'app-toast',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatBadgeModule,
    NgComponentOutlet
  ],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss'
})
export class ToastComponent {
  /**
   * Position of the toast notifications on the screen.
   * Options: 'top-right', 'top-left', 'bottom-right', 'bottom-left'
   * */
  position = input<ToastPosition>('bottom-right');

  toasts: ToastResponse[] = [];

  showToasts = signal(true);
  areToastsEmpty = signal(false);

  constructor(
    private readonly toastService: ToastService,
    private readonly elementRef: ElementRef<any>,
  ) {
    this.toastService.toasts.subscribe(toasts => {
      this.toasts = toasts;
      this.areToastsEmpty.set(toasts.length === 0);
      this.showToasts.set(toasts.length > 0 ? true : this.showToasts());
    });

    let position: DOMRect;
    afterNextRender({
      earlyRead: () => {
        console.log('setting up toast position', typeof this.elementRef);
        position = this.elementRef.nativeElement.parentElement.getBoundingClientRect();
      },
      write: () => {
        this.setupFixedPosition(position);
      }
    });
  }

  /** Returns the Tailwind CSS class for the toast based on its type. */
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

  /** Sets up the fixed position of the toast container based on the provided position. */
  private setupFixedPosition(position: DOMRect): void {
    const element = this.elementRef.nativeElement;

    const horizontalPositionStyle = this.position().includes('left') ? `left: ${position.left}px;` : `right: ${window.innerWidth - position.right}px;`;
    const verticalPositionStyle = this.position().includes('top') ? `top: ${position.top}px;` : `bottom: ${window.innerHeight - position.bottom}px;`;

    element.setAttribute('style', `width: fit-content; max-height: 50vh; \
      position: fixed; ${verticalPositionStyle} ${horizontalPositionStyle} z-index: 10;`);
  }

  /** Toggles the visibility of the toast notifications. */
  toggleToasts(): void {
    this.showToasts.set(!this.showToasts());
    console.log(this.showToasts());
  }

  /** Checks if there are any error toasts present. */
  doErrorsExist(): boolean {
    return this.toasts.some(toast => toast.type === 'error');
  }
}
