import { Component, input } from '@angular/core';
import { MatButtonModule } from "@angular/material/button";
import { MatDividerModule } from "@angular/material/divider";
import { MatIconModule } from "@angular/material/icon";
import { MatTooltipModule } from '@angular/material/tooltip';
import { ZodError } from 'zod';
import { environment } from '../../../environments/environment';
import { OrderStatus } from '../../api-services-v2';
import { ORDER_FIELD_NAMES } from '../../display-name-mappings/order-names';
import { STATE_DISPLAY_NAMES } from '../../display-name-mappings/status-names';
import { DriverJsTourService } from '../../services/driver.js-tour.service';

type ToastError = { message: string; fieldName: string };

@Component({
  selector: 'app-toast-invalid-order',
  imports: [
    MatDividerModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule
  ],
  templateUrl: './toast-invalid-order.component.html',
  styleUrl: './toast-invalid-order.component.scss',
})
export class ToastInvalidOrderComponent {
  targetState = input(undefined, { transform: (value: OrderStatus) => STATE_DISPLAY_NAMES.get(value) ?? 'Unbekannter Status' });
  errors = input([], {
    transform: (value: ZodError) => {
      return value.issues.map(e => {
        const fieldName = e.path?.at(-1)?.toString() ?? 'unbekanntes_feld';
        return {
          message: (ORDER_FIELD_NAMES[fieldName] ?? fieldName) + ': ' + e.message,
          fieldName
        } as ToastError;
      });
    }
  });

  constructor(private readonly driverJsService: DriverJsTourService) { }

  highlightField(error: ToastError) {
    if (error.fieldName && document.querySelector(`.${environment.orderFieldClassPrefix}${error.fieldName}`)) {
      this.driverJsService.highlightElement(`.${environment.orderFieldClassPrefix}${error.fieldName}`, 'Fehler beim Statuswechsel', error.message);
    }
  }
}
