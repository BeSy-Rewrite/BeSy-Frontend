import { Component, input } from '@angular/core';
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-toast-processing-indicator',
  imports: [
    MatProgressSpinnerModule,
    RouterLink
  ],
  templateUrl: './toast-processing-indicator.component.html',
  styleUrl: './toast-processing-indicator.component.scss',
})
export class ToastProcessingIndicatorComponent {
  /** The name of the document being processed. */
  documentName = input<string | undefined>(undefined);
  /** The ID of the order associated with the document. */
  orderId = input<string | number | undefined>(undefined);

}
