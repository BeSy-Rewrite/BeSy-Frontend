import { Component, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { ZodError } from 'zod';
import { environment } from '../../../environments/environment';
import { OrderStatus } from '../../api-services-v2';
import { ORDER_FIELD_NAMES } from '../../display-name-mappings/order-names';
import { STATE_DISPLAY_NAMES } from '../../display-name-mappings/status-names';
import { DriverJsTourService } from '../../services/driver.js-tour.service';

type ToastError = {
  message: string;
  fieldName: string;
  fieldDisplayName: string;
};

@Component({
  selector: 'app-toast-invalid-order',
  imports: [MatDividerModule, MatIconModule, MatButtonModule, MatTooltipModule, RouterModule],
  templateUrl: './toast-invalid-order.component.html',
  styleUrl: './toast-invalid-order.component.scss',
})
export class ToastInvalidOrderComponent {
  /**
   * The ID of the order that failed validation.
   */
  orderId = input.required<number>();

  /**
   * The target state that was attempted to be set.
   */
  targetState = input(undefined, {
    transform: (value: OrderStatus | undefined) =>
      STATE_DISPLAY_NAMES.get(value ?? '') ?? 'Unbekannter Status',
  });

  /**
   * The list of validation errors to display in the toast.
   */
  zodError = input([], {
    transform: (value: ZodError) => {
      return (
        value?.issues?.map(e => {
          const fieldName = e.path?.at(-1)?.toString() ?? 'unbekanntes_feld';
          return {
            message: e.message,
            fieldDisplayName: ORDER_FIELD_NAMES[fieldName] ?? fieldName,
            fieldName,
          } as ToastError;
        }) ?? []
      );
    },
  });

  constructor(private readonly driverJsService: DriverJsTourService) {}

  /**
   *  Highlights a specific field in the order form based on the provided ToastError.
   * @param error The ToastError containing field information.
   */
  highlightField(error: ToastError) {
    if (!error.fieldName) return;

    try {
      const selector = `.${environment.orderFieldClassPrefix}${error.fieldName}`;
      if (document.querySelector(selector)) {
        this.driverJsService.highlightElement(selector, 'Fehler beim Statuswechsel', error.message);
      }
    } catch (e) {
      console.error('Fehler beim Hervorheben des Feldes:', e);
    }
  }
}
