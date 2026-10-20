import { inject, Injectable } from '@angular/core';
import { catchError, forkJoin, map, Observable, of } from 'rxjs';
import { OrderRequestDTO, OrderResponseDTO } from '../../../../api-services-v2';
import {
  AutocompleteOption,
  createAutocompleteOption,
} from '../../../../form-config-patching/autocomplete-option';
import { CostCenterWrapperService } from '../../../../services/wrapper-services/cost-centers-wrapper.service';
import { PersonsWrapperService } from '../../../../services/wrapper-services/persons-wrapper.service';
import { SuppliersWrapperService } from '../../../../services/wrapper-services/suppliers-wrapper.service';
import {
  formatBookingYear,
  formatCostCenter,
  formatCurrency,
  formatPerson,
  formatPriceToGerman,
  formatSupplier,
} from '../../../../utils/formatting';
import { parseGermanPriceToNumber } from '../../../../utils/price-conversion.utils';
import { convertToISODateString } from '../../../../utils/time-conversion.utils';
import { EditingFormattedOrder } from '../editing-formatted-order';

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
   * Maps an OrderResponseDTOFormatted to OrderRequestDTO for API submission
   * @param formattedOrder The formatted order to convert
   * @returns OrderRequestDTO The request DTO ready for API submission
   */
  mapFormattedOrderToRequest(formattedOrder: EditingFormattedOrder): OrderRequestDTO {
    return {
      primary_cost_center_id: formattedOrder.primary_cost_center_id?.value?.id,
      booking_year: formattedOrder.booking_year?.slice(-2), // Get last 2 digits
      legacy_alias: formattedOrder.legacy_alias,
      owner_id: formattedOrder.owner_id,
      content_description: formattedOrder.content_description ?? '',
      currency_short: formattedOrder.currency?.value?.code,
      comment: formattedOrder.comment,
      comment_for_supplier: formattedOrder.comment_for_supplier,
      quote_number: formattedOrder.quote_number,
      quote_sign: formattedOrder.quote_sign,
      quote_date: convertToISODateString(formattedOrder.quote_date),
      quote_price: parseGermanPriceToNumber(formattedOrder.quote_price),
      delivery_person_id: formattedOrder.delivery_person_id?.value?.id,
      invoice_person_id: formattedOrder.invoice_person_id?.value?.id,
      queries_person_id: formattedOrder.queries_person_id?.value?.id,
      customer_id: formattedOrder.customer_id,
      supplier_id: formattedOrder.supplier_id?.value?.id,
      secondary_cost_center_id: formattedOrder.secondary_cost_center_id?.value?.id,
      fixed_discount: formattedOrder.fixed_discount,
      percentage_discount: formattedOrder.percentage_discount,
      cashback_percentage: formattedOrder.cashback_days,
      cashback_days: formattedOrder.cashback_days,
      flag_decision_cheapest_offer: formattedOrder.flag_decision_cheapest_offer,
      flag_decision_most_economical_offer: formattedOrder.flag_decision_most_economical_offer,
      flag_decision_sole_supplier: formattedOrder.flag_decision_sole_supplier,
      flag_decision_contract_partner: formattedOrder.flag_decision_contract_partner,
      flag_decision_preferred_supplier_list: formattedOrder.flag_decision_preferred_supplier_list,
      flag_decision_other_reasons: formattedOrder.flag_decision_other_reasons,
      decision_other_reasons_description: formattedOrder.decision_other_reasons_description,
      dfg_key: formattedOrder.dfg_key,
      delivery_address_id: formattedOrder.delivery_address_id,
      invoice_address_id: formattedOrder.invoice_address_id,
    };
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
