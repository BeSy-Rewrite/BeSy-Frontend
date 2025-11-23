import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-toast',
  imports: [
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss'
})
export class ToastComponent {
  toasts = ['test1', 'test2', 'test3'];

  removeToast(index: number): void {
    this.toasts.splice(index, 1);
  }
}
