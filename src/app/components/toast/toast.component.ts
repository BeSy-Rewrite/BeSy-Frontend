import { afterNextRender, Component, ElementRef, input, signal } from '@angular/core';
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

export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';


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
      this.showToasts.set(toasts.length > 0);
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

  setupFixedPosition(position: DOMRect): void {
    const element = this.elementRef.nativeElement;

    const horizontalPositionStyle = this.position().includes('left') ? `left: ${position.left}px;` : `right: ${window.innerWidth - position.right}px;`;
    const verticalPositionStyle = this.position().includes('top') ? `top: ${position.top}px;` : `bottom: ${window.innerHeight - position.bottom}px;`;

    element.setAttribute('style', `width: fit-content; max-height: 50vh; \
      position: fixed; ${verticalPositionStyle} ${horizontalPositionStyle}`);
  }

  toggleToasts(): void {
    this.showToasts.set(!this.showToasts());
    console.log(this.showToasts());
  }
}
