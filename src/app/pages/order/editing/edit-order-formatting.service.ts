import { inject, Injectable } from '@angular/core';
import { catchError, forkJoin, map, Observable, of } from 'rxjs';
import { OrderResponseDTO } from '../../../api-services-v2';
import {
  AutocompleteOption,
  createAutocompleteOption,
} from '../../../form-config-patching/autocomplete-option';
import { CostCenterWrapperService } from '../../../services/wrapper-services/cost-centers-wrapper.service';
import { PersonsWrapperService } from '../../../services/wrapper-services/persons-wrapper.service';
import { SuppliersWrapperService } from '../../../services/wrapper-services/suppliers-wrapper.service';
import {
  formatBookingYear,
  formatCostCenter,
  formatCurrency,
  formatPerson,
  formatPriceToGerman,
  formatSupplier,
} from '../../../utils/formatting';
import { EditingFormattedOrder } from './editing-formatted-order';

@Injectable({
  providedIn: 'root',
})
export class EditOrderFormattingService {
  private readonly costCentersService = inject(CostCenterWrapperService);
  private readonly personsService = inject(PersonsWrapperService);
  private readonly suppliersService = inject(SuppliersWrapperService);

  /**
   * Formats an OrderResponseDTO into an EditingFormattedOrder, resolving related entities into AutocompleteOptions.
   * This method fetches related entities (cost centers, persons, suppliers) and formats them for use in the editing form.
   * It also formats the quote price according to German formatting conventions.
   * @param order The order to be formatted
   * @returns The formatted order data
   */
  formatOrderData(order: OrderResponseDTO): Observable<EditingFormattedOrder> {
    return forkJoin({
      primary_cost_center_id: this.resolveOption(
        order.primary_cost_center_id,
        id => this.costCentersService.getCostCenterById(id),
        formatCostCenter
      ),
      secondary_cost_center_id: this.resolveOption(
        order.secondary_cost_center_id,
        id => this.costCentersService.getCostCenterById(id),
        formatCostCenter
      ),
      delivery_person_id: this.resolveOption(
        order.delivery_person_id,
        id => this.personsService.getPersonById(id),
        formatPerson
      ),
      invoice_person_id: this.resolveOption(
        order.invoice_person_id,
        id => this.personsService.getPersonById(id),
        formatPerson
      ),
      queries_person_id: this.resolveOption(
        order.queries_person_id,
        id => this.personsService.getPersonById(id),
        formatPerson
      ),
      supplier_id: this.resolveOption(
        order.supplier_id,
        id => this.suppliersService.getSupplierById(id),
        formatSupplier
      ),
    }).pipe(
      map(
        (resolvedOptions): EditingFormattedOrder => ({
          ...order,
          ...resolvedOptions,
          id: order.id!,
          booking_year: formatBookingYear(order.booking_year),
          currency: toOption(order.currency, formatCurrency),
          quote_price: formatPriceToGerman(order.quote_price ?? 0, order.currency?.code),
        })
      )
    );
  }

  /**
   * Resolves an ID to an AutocompleteOption by fetching the corresponding entity and formatting it.
   */
  private resolveOption<T>(
    id: number | undefined | null,
    fetchFn: (id: number) => Observable<T>,
    formatFn: (value: T) => string
  ): Observable<AutocompleteOption<T> | undefined> {
    if (!id) {
      return of(undefined);
    }
    return fetchFn(id).pipe(
      map(value => createAutocompleteOption(value, formatFn)),
      catchError(() => of(undefined))
    );
  }
}

/**
 * Converts a value into an AutocompleteOption using the provided formatting function.
 * @Returns undefined if the value is null or undefined.
 */
function toOption<T>(
  value: T | undefined | null,
  formatFn: (value: T) => string
): AutocompleteOption<T> | undefined {
  return value ? createAutocompleteOption(value, formatFn) : undefined;
}
