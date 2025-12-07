import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { from, lastValueFrom, map, mergeMap, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApprovalResponseDTO,
  ItemRequestDTO,
  ItemResponseDTO,
  OrderRequestDTO,
  OrderResponseDTO,
  OrdersService,
  OrderStatus,
  OrderStatusHistoryResponseDTO,
  PagedOrderResponseDTO,
  QuotationRequestDTO,
  QuotationResponseDTO,
} from '../../api-services-v2';
import { FilterRequestParams } from '../../models/filter/filter-request-params';
import {
  ItemTableModel,
  QuotationTableModel,
} from '../../pages/order/edit-order-page/edit-order-page.component';
import { CostCenterFormatted, CostCenterWrapperService } from './cost-centers-wrapper.service';
import { CurrenciesWrapperService, FormattedCurrency } from './currencies-wrapper.service';
import { FormattedPerson, PersonsWrapperService } from './persons-wrapper.service';
import { SupplierFormatted, SuppliersWrapperService } from './suppliers-wrapper.service';
import { UsersWrapperService } from './users-wrapper.service';

export interface OrderResponseDTOFormatted {
  id?: number;
  primary_cost_center_id?: CostCenterFormatted;
  booking_year?: string; //
  auto_index?: number;
  created_date?: string;
  legacy_alias?: string;
  owner_id?: number;
  content_description?: string; // Beschreibung der Bestellung
  status?: OrderStatus;
  currency?: FormattedCurrency;
  currency_short?: FormattedCurrency;
  comment?: string;
  comment_for_supplier?: string;
  quote_number?: string; // Angebotsnummer
  quote_sign?: string;
  quote_date?: string;
  quote_price?: string;
  delivery_person_id?: FormattedPerson;
  invoice_person_id?: FormattedPerson;
  queries_person_id?: FormattedPerson;
  customer_id?: string;
  supplier_id?: SupplierFormatted;
  secondary_cost_center_id?: CostCenterFormatted;
  fixed_discount?: number;
  percentage_discount?: number;
  cash_discount?: number;
  cashback_days?: number;
  last_updated_time?: string;
  flag_decision_cheapest_offer?: boolean;
  flag_decision_most_economical_offer?: boolean;
  flag_decision_sole_supplier?: boolean;
  flag_decision_contract_partner?: boolean;
  flag_decision_preferred_supplier_list?: boolean;
  flag_decision_other_reasons?: boolean;
  decision_other_reasons_description?: string;
  dfg_key?: string;
  delivery_address_id?: number;
  invoice_address_id?: number;
}
@Injectable({
  providedIn: 'root',
})
export class OrdersWrapperService {
  constructor(
    private readonly http: HttpClient,
    private readonly ordersService: OrdersService,
    private readonly costCenterWrapperService: CostCenterWrapperService,
    private readonly personsWrapperService: PersonsWrapperService,
    private readonly currenciesWrapperService: CurrenciesWrapperService,
    private readonly suppliersWrapperService: SuppliersWrapperService,
    private readonly usersWrapperService: UsersWrapperService
  ) { }

  /**
   * @param page Seitenzahl für die Paginierung (beginnend bei 0).
   * @param size Anzahl der Elemente pro Seite.
   * @param sort Sortierung der Ergebnisse. Mehrfache Sortierfelder möglich, z. B.  `sort=bookingYear,desc&sort=id,asc` sortiert zuerst nach `bookingYear` (absteigend), dann nach `id` (aufsteigend).
   *
   * @param primaryCostCenters Filtert nach IDs der primären Kostenstellen.
   * @param bookingYears Filtert nach den letzten zwei Ziffern der Jahreszahl der Buchung. Achtung, diese muss ein String sein, z.B. "25".
   * @param createdAfter Filtert nach Bestellungen, welche nach oder zu diesem Zeitpunkt erstellt wurden.
   * @param createdBefore Filtert nach Bestellungen, welche vor oder zu diesem Zeitpunkt erstellt wurden.
   * @param ownerIds Filtert nach IDs der Ersteller der Bestellung. Beinhalt
   * @param statuses Filtert nach dem Bestellstatus. Beinhaltet default-mäßig alle Bestellstatus.
   * @param quotePriceMin Filtert nach quotePriceMin.
   * @param quotePriceMax Filtert nach quotePriceMax.
   * @param deliveryPersonIds Filtert nach IDs der Besteller.
   * @param invoicePersonIds Filtert nach IDs invoicePersonIds.
   * @param queriesPersonIds Filtert nach IDs queriesPersonIds.
   * @param customerIds Filter nach Kundennummern.
   * @param supplierIds Filtert nach IDs der Lieferanten.
   * @param secondaryCostCenters Filtert nach IDs der sekundären Kostenstellen.
   * @param lastUpdatedTimeAfter Filtert nach Bestellungen, welche nach oder zu diesem Zeitpunkt bearbeitet wurden.
   * @param lastUpdatedTimeBefore Filtert nach Bestellungen, welche vor oder zu diesem Zeitpunkt bearbeitet wurden.
   * @returns PagedOrderResponseDTO OK
   * @throws ApiError
   */

  /**
   * @param page Seitenzahl für die Paginierung (beginnend bei 0).
   * @param size Anzahl der Elemente pro Seite.
   * @param sort Sortierung der Ergebnisse. Mehrfache Sortierfelder möglich, z. B.  `sort=bookingYear,desc&sort=id,asc` sortiert zuerst nach `bookingYear` (absteigend), dann nach `id` (aufsteigend).
   * @param filters Filterparameter zur Einschränkung der Ergebnisse.
   * @param searchTerm Suchbegriff zur weiteren Filterung der Ergebnisse.
   * @returns PagedOrderResponseDTO OK
   */
  async getAllOrders(
    page: number = 0,
    size: number = 20,
    sort: Array<string> = [],
    filters?: FilterRequestParams,
    _searchTerm?: string
  ): Promise<PagedOrderResponseDTO> {
    return await lastValueFrom(
      this.ordersService.getAllOrders(
        page,
        size,
        sort,
        filters?.primaryCostCenters,
        filters?.bookingYears,
        filters?.createdAfter,
        filters?.createdBefore,
        filters?.ownerIds,
        filters?.statuses,
        filters?.quotePriceMin,
        filters?.quotePriceMax,
        filters?.deliveryPersonIds,
        filters?.invoicePersonIds,
        filters?.queriesPersonIds,
        filters?.customerIds,
        filters?.supplierIds,
        filters?.secondaryCostCenters,
        filters?.lastUpdatedTimeAfter,
        filters?.lastUpdatedTimeBefore,
        filters?.autoIndexMin,
        filters?.autoIndexMax
      )
    );
  }

  async createOrder(request: OrderRequestDTO): Promise<OrderResponseDTO> {
    request.booking_year = request.booking_year?.slice(-2); // Ensure only last 2 digits are sent
    return await lastValueFrom(this.usersWrapperService.getCurrentUser().pipe(
      mergeMap(user => {
        if (user.id == undefined) throw new Error('Current user ID is undefined');
        request.owner_id = Number.parseInt(user.id);
        console.log('Creating order with owner_id:', request);
        return this.ordersService.createOrder(request);
      })
    ));
  }

  async getOrderById(orderId: number): Promise<OrderResponseDTO> {
    return await lastValueFrom(this.ordersService.getOrderById(orderId));
  }

  /**
   * Get order by its order number.
   * @param orderNumber The order number in the format "primaryCostCenter-bookingYear-autoIndex".
   * @returns OrderResponseDTO
   */
  async getOrderByOrderNumber(orderNumber: string): Promise<OrderResponseDTO> {
    const orderNumberParsed = orderNumber.split('-').map(part => part.trim());
    const filter = {
      primaryCostCenters: [orderNumberParsed[0]],
      bookingYears: [orderNumberParsed[1]],
      autoIndexMin: Number.parseInt(orderNumberParsed[2]),
      autoIndexMax: Number.parseInt(orderNumberParsed[2]),
    } as FilterRequestParams;

    return await lastValueFrom(
      from(this.getAllOrders(0, 1, [], filter)).pipe(
        map(ordersPage => {
          const order = ordersPage.content?.[0];
          if (order) {
            return order;
          }
          throw new Error(`Order with order number ${orderNumber} not found`);
        })
      )
    );
  }

  async deleteOrder(orderId: number): Promise<void> {
    return await lastValueFrom(this.ordersService.deleteOrder(orderId));
  }

  async getOrderItems(orderId: number): Promise<ItemResponseDTO[]>;
  async getOrderItems(orderId: string): Promise<ItemResponseDTO[]>;
  // Implementation
  async getOrderItems(orderId: number | string): Promise<ItemResponseDTO[]> {
    const id = typeof orderId === 'string' ? Number.parseInt(orderId) : orderId;
    return await lastValueFrom(this.ordersService.getOrderItems(id));
  }

  async createOrderItems(orderId: number, requestBody: any): Promise<any> {
    return await lastValueFrom(this.ordersService.createOrderItems(orderId, requestBody));
  }

  async deleteItemOfOrder(orderId: number, itemId: number): Promise<void> {
    return await lastValueFrom(this.ordersService.deleteItemOfOrder(orderId, itemId));
  }

  async getOrderQuotations(orderId: number): Promise<QuotationResponseDTO[]>;
  async getOrderQuotations(orderId: string): Promise<QuotationResponseDTO[]>;
  // Implementation
  async getOrderQuotations(orderId: number | string): Promise<QuotationResponseDTO[]> {
    const id = typeof orderId === 'string' ? Number.parseInt(orderId) : orderId;
    return await lastValueFrom(this.ordersService.getOrderQuotations(id));
  }

  async createOrderQuotations(orderId: number, requestBody: any): Promise<any> {
    return await lastValueFrom(this.ordersService.createOrderQuotations(orderId, requestBody));
  }

  async deleteQuotationOfOrder(orderId: number, quotationId: number): Promise<void> {
    return await lastValueFrom(this.ordersService.deleteQuotationOfOrder(orderId, quotationId));
  }

  exportOrderToDocument(orderId: string): Observable<Blob> {
    return this.ordersService.exportOrderToFormula(Number.parseInt(orderId));
  }

  async getOrderApprovals(orderId: number): Promise<ApprovalResponseDTO> {
    return await lastValueFrom(this.ordersService.getOrderApprovals(orderId));
  }

  async getOrderStatusHistory(orderId: number): Promise<OrderStatusHistoryResponseDTO[]> {
    return await lastValueFrom(this.ordersService.getOrderStatusHistory(orderId));
  }

  // JSON.stringify needed as angular http client otherwise sends plain text instead of application/json
  async updateOrderState(orderId: number, newState: OrderStatus): Promise<OrderStatus> {
    const requestBody = environment.production ? newState : JSON.stringify(newState);
    return await lastValueFrom(this.ordersService.updateOrderStatus(orderId, requestBody));
  }

  async getOrderByIDInFormFormat(orderId: number): Promise<OrderResponseDTOFormatted> {
    // geändert von OrdersService zu this.getOrderById
    const orderData = await this.getOrderById(orderId);
    return this.formatOrderData(orderData);
  }

  async patchOrderApprovals(orderId: number, requestBody: any): Promise<ApprovalResponseDTO> {
    return await lastValueFrom(this.ordersService.updateOrderApprovals(orderId, requestBody));
  }

  async patchOrderById(orderId: number, requestBody: any): Promise<OrderResponseDTO> {
    return await lastValueFrom(this.ordersService.updateOrder(orderId, requestBody));
  }

  /**
   * Maps an OrderResponseDTO to OrderResponseDTOFormatted by enriching it with formatted data
   * @param order The OrderResponseDTO to format
   * @returns Promise<OrderResponseDTOFormatted> The formatted order data
   */
  async mapOrderResponseToFormatted(order: OrderResponseDTO): Promise<OrderResponseDTOFormatted> {
    return this.formatOrderData(order);
  }

  /**
   * Formats an OrderResponseDTO into an OrderResponseDTOFormatted
   * @param order The order to be formatted
   * @returns The formatted order data
   */
  private async formatOrderData(order: OrderResponseDTO): Promise<OrderResponseDTOFormatted> {
    let formatedPrimaryCostCenter: CostCenterFormatted | undefined = undefined;
    let formatedSecondaryCostCenter: CostCenterFormatted | undefined = undefined;
    let formatedDeliveryPerson: FormattedPerson | undefined = undefined;
    let formatedInvoicePerson: FormattedPerson | undefined = undefined;
    let formatedQueriesPerson: FormattedPerson | undefined = undefined;
    let formatedCurrency: FormattedCurrency | undefined = undefined;
    let formatedSupplier: SupplierFormatted | undefined = undefined;

    [
      formatedPrimaryCostCenter,
      formatedSecondaryCostCenter,
      formatedDeliveryPerson,
      formatedInvoicePerson,
      formatedQueriesPerson,
      formatedSupplier,
      formatedCurrency,
    ] = await Promise.all([
      order.primary_cost_center_id
        ? this.costCenterWrapperService.getCostCenterByIdFormattedForAutocomplete(
          order.primary_cost_center_id
        )
        : Promise.resolve(undefined),

      order.secondary_cost_center_id
        ? this.costCenterWrapperService.getCostCenterByIdFormattedForAutocomplete(
          order.secondary_cost_center_id
        )
        : Promise.resolve(undefined),

      order.delivery_person_id
        ? this.personsWrapperService.getPersonByIdFormattedForAutocomplete(order.delivery_person_id)
        : Promise.resolve(undefined),

      order.invoice_person_id
        ? this.personsWrapperService.getPersonByIdFormattedForAutocomplete(order.invoice_person_id)
        : Promise.resolve(undefined),

      order.queries_person_id
        ? this.personsWrapperService.getPersonByIdFormattedForAutocomplete(order.queries_person_id)
        : Promise.resolve(undefined),

      order.supplier_id
        ? this.suppliersWrapperService.getSupplierByIdFormattedForAutocomplete(order.supplier_id)
        : Promise.resolve(undefined),
      order.currency
        ? this.currenciesWrapperService.formatCurrencyForAutocomplete(order.currency)
        : Promise.resolve(undefined),
    ]);

    return {
      ...order,
      booking_year: order.booking_year
        ? '20' + order.booking_year.toString().padStart(2, '0')
        : undefined,
      currency: formatedCurrency,
      primary_cost_center_id: formatedPrimaryCostCenter,
      secondary_cost_center_id: formatedSecondaryCostCenter,
      delivery_person_id: formatedDeliveryPerson,
      invoice_person_id: formatedInvoicePerson,
      queries_person_id: formatedQueriesPerson,
      supplier_id: formatedSupplier,
      quote_price: this.formatPriceToGerman(order.quote_price ?? 0),
      currency_short: formatedCurrency,
    };
  }

  mapItemResponseToTableModel(items: ItemResponseDTO[]): ItemTableModel[] {
    return items.map(item => ({
      item_id: item.item_id,
      name: item.name ?? '',
      price_per_unit: this.formatPriceToGerman(item.price_per_unit!) ?? 0,
      quantity: item.quantity ?? 0,
      quantity_unit: item.quantity_unit,
      article_id: item.article_id,
      comment: item.comment,
      vat_value: item.vat?.value?.toString(),
      preferred_list: item.preferred_list,
      preferred_list_number: item.preferred_list_number,
      vat_type: item.vat_type ?? 'netto',
    }));
  }

  mapItemRequestToTableModel(item: ItemRequestDTO): ItemTableModel {
    return {
      name: item.name,
      price_per_unit: this.formatPriceToGerman(item.price_per_unit),
      quantity: item.quantity,
      quantity_unit: item.quantity_unit,
      article_id: item.article_id,
      comment: item.comment,
      vat_value: item.vat_value,
      preferred_list: item.preferred_list,
      preferred_list_number: item.preferred_list_number,
      vat_type: item.vat_type,
    };
  }

  mapItemTableModelToItemRequestDTO(item: ItemTableModel): ItemRequestDTO {
    // Ensure vat_value is always a string (use vat_value, fallback to vat?.value, fallback '0')
    const vatValue =
      item.vat_value ?? (item.vat?.value === undefined ? '0' : String(item.vat.value));

    return {
      name: item.name,
      price_per_unit: this.parseGermanPriceToNumber(item.price_per_unit) ?? 0,
      quantity: item.quantity ?? 0,
      quantity_unit: item.quantity_unit,
      article_id: item.article_id,
      comment: item.comment,
      vat_value: vatValue,
      // preferred_list is optional in both models; cast to match generated enum type
      preferred_list: item.preferred_list as ItemRequestDTO.PreferredListEnum | undefined,
      preferred_list_number: item.preferred_list_number,
      // cast vat_type to the generated enum type ('netto' | 'brutto')
      vat_type: item.vat_type as ItemRequestDTO.VatTypeEnum,
    };
  }

  mapQuotationResponseToTableModel(quotations: QuotationResponseDTO[]): QuotationTableModel[] {
    return quotations.map(q => ({
      index: q.index ?? 0,
      quote_date: this.formatISODateTimeToDateString(q.quote_date!) ?? '',
      price: this.formatPriceToGerman(q.price ?? 0),
      company_name: q.company_name ?? '',
      company_city: q.company_city ?? '',
    }));
  }

  mapQuotationRequestToTableModel(quotations: QuotationRequestDTO[]): QuotationTableModel[] {
    return quotations.map(q => ({
      quote_date: q.quote_date,
      price: this.formatPriceToGerman(q.price),
      company_name: q.company_name,
      company_city: q.company_city,
    }));
  }

  mapQuotationTableModelToQuotationRequestDTO(quotation: QuotationTableModel): QuotationRequestDTO {
    return {
      quote_date: this.convertToISODateString(quotation.quote_date),
      price: this.parseGermanPriceToNumber(quotation.price) ?? 0,
      company_name: quotation.company_name,
      company_city: quotation.company_city,
    };
  }

  /**
   * Converts various date formats to ISO date string (YYYY-MM-DD)
   * Handles Luxon DateTime objects, JavaScript Date objects, and date strings
   * @param value The date value to convert
   * @returns ISO date string (YYYY-MM-DD) or empty string if invalid
   */
  private convertToISODateString(value: any): string {
    if (value === null || value === undefined) return '';

    // Handle Luxon DateTime objects
    if (typeof value === 'object' && 'isLuxonDateTime' in value && value.isLuxonDateTime) {
      return value.toISODate?.() ?? value.toFormat?.('yyyy-MM-dd') ?? '';
    }

    // Handle JavaScript Date objects
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
      return value.toISOString().split('T')[0];
    }

    // Handle string dates (German format DD.MM.YYYY or ISO format)
    if (typeof value === 'string' && value.length > 0) {
      // Check if it's German format (DD.MM.YYYY)
      const germanDateRegex = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/;
      const germanDateMatch = germanDateRegex.exec(value);
      if (germanDateMatch) {
        const [, day, month, year] = germanDateMatch;
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
      // Try parsing as ISO or other format
      const date = new Date(value);
      if (!Number.isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    }

    return '';
  }

  /**
   * Transforms a number or string into a German formatted price string, e.g. "1234.5" → "1.234,50"
   * Supports both dot and comma as decimal separators in the input.
   * @param value The number or string to format.
   * @returns The formatted price string in German format.
   */
  formatPriceToGerman(value: string | number): string {
    if (value === null || value === undefined) return '0,00';

    // Convert to string and trim whitespace
    let str = String(value).trim();

    // If both comma and dot are present, determine which is the decimal separator
    const lastComma = str.lastIndexOf(',');
    const lastDot = str.lastIndexOf('.');
    if (lastComma > lastDot) {
      str = str.replaceAll('.', '').replace(',', '.'); // remove dots and replace comma with dot as decimal separator
    } else {
      str = str.replaceAll(',', ''); // remove commas and keep dot as decimal separator
    }

    const num = Number.parseFloat(str);
    if (Number.isNaN(num)) return '0,00';

    // Format as German price string
    return num.toLocaleString('de-DE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  /**
   * Maps an OrderResponseDTOFormatted to OrderRequestDTO for API submission
   * @param formattedOrder The formatted order to convert
   * @returns OrderRequestDTO The request DTO ready for API submission
   */
  mapFormattedOrderToRequest(formattedOrder: OrderResponseDTOFormatted): OrderRequestDTO {
    return {
      primary_cost_center_id: formattedOrder.primary_cost_center_id?.value,
      booking_year: formattedOrder.booking_year?.slice(-2), // Get last 2 digits
      legacy_alias: formattedOrder.legacy_alias,
      owner_id: formattedOrder.owner_id,
      content_description: formattedOrder.content_description ?? '',
      currency_short: formattedOrder.currency?.value,
      comment: formattedOrder.comment,
      comment_for_supplier: formattedOrder.comment_for_supplier,
      quote_number: formattedOrder.quote_number,
      quote_sign: formattedOrder.quote_sign,
      quote_date: this.convertToISODateString(formattedOrder.quote_date),
      quote_price: this.parseGermanPriceToNumber(formattedOrder.quote_price),
      delivery_person_id: formattedOrder.delivery_person_id?.value,
      invoice_person_id: formattedOrder.invoice_person_id?.value,
      queries_person_id: formattedOrder.queries_person_id?.value,
      customer_id: formattedOrder.customer_id,
      supplier_id: formattedOrder.supplier_id?.value,
      secondary_cost_center_id: formattedOrder.secondary_cost_center_id?.value,
      fixed_discount: formattedOrder.fixed_discount,
      percentage_discount: formattedOrder.percentage_discount,
      cashback_percentage: formattedOrder.cash_discount, // Map cash_discount to cashback_percentage
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
   * Parses a German formatted price string (e.g. "1.234,56") to a number
   * @param price The German formatted price string
   * @returns The parsed number or undefined if parsing fails
   */
  parseGermanPriceToNumber(price?: string): number | undefined {
    if (!price) return undefined;

    // Remove thousand separators (.) and replace decimal comma with dot
    const normalized = price.replaceAll('.', '').replace(',', '.');
    const num = Number.parseFloat(normalized);

    return Number.isNaN(num) ? undefined : num;
  }

  /**
   * Compares two order objects and returns the fields that have changed
   * @param original The original order object
   * @param modified The modified order object
   * @returns An object containing the changed fields
   */
  compareOrdersAndReturnChangedFields(
    original: OrderResponseDTOFormatted,
    modified: OrderResponseDTOFormatted
  ): Partial<OrderResponseDTOFormatted> {
    const changedFields: Partial<OrderResponseDTOFormatted> = {};

    // Fields that should be formatted as ISO date (YYYY-MM-DD) only
    const dateFields = new Set(['quote_date', 'order_date', 'delivery_date']);

    // Fields that need price parsing (German format to number)
    const priceFields = new Set(['quote_price']);

    // --- Special handling for currency and currency_short fields ---
    const extractValue = (value: any): string | undefined => {
      if (value === null || value === undefined) return undefined;
      if (typeof value === 'string') return value;
      if (typeof value === 'object' && 'value' in value) {
        return (value as { value?: string }).value;
      }
      return undefined;
    };

    const originalCurrencyValue =
      extractValue(original.currency) ?? extractValue((original as any).currency_short);
    const modifiedCurrencyShortValue = extractValue((modified as any).currency_short);

    if (originalCurrencyValue !== modifiedCurrencyShortValue) {
      (changedFields as any).currency_short = modifiedCurrencyShortValue;
    }

    // --- Iterate through all fields except currency & currency_short ---
    for (const key in modified) {
      if (!Object.hasOwn(modified, key)) continue;
      if (key === 'currency' || key === 'currency_short') continue; // Skip currency fields (handled above)

      const originalValue = (original as any)[key];
      const modifiedValue = (modified as any)[key];

      // Special handling for price fields - compare parsed values
      if (priceFields.has(key)) {
        const origParsed = this.parseGermanPriceToNumber(originalValue);
        const modParsed = this.parseGermanPriceToNumber(modifiedValue);
        if (origParsed !== modParsed) {
          (changedFields as any)[key] = modParsed;
        }
        continue;
      }

      if (
        typeof originalValue === 'object' &&
        originalValue !== null &&
        typeof modifiedValue === 'object' &&
        modifiedValue !== null
      ) {
        // prefer comparing .value when available
        if ('value' in originalValue || 'value' in modifiedValue) {
          const orig = originalValue.value;
          const mod = modifiedValue.value;
          if (orig !== mod) {
            (changedFields as any)[key] = mod;
          }
        } else if (JSON.stringify(originalValue) !== JSON.stringify(modifiedValue)) {
          // fallback to deep compare
          (changedFields as any)[key] = modifiedValue;
        }
      } else if (
        typeof modifiedValue === 'object' &&
        modifiedValue !== null &&
        'value' in modifiedValue
      ) {
        const mod = modifiedValue.value;
        const orig = originalValue;
        if (orig !== mod) {
          (changedFields as any)[key] = mod;
        }
      } else if (originalValue !== modifiedValue) {
        (changedFields as any)[key] = modifiedValue;
      }
    }

    // Convert undefined values to null for API compatibility
    // Format date fields to ISO date format (YYYY-MM-DD)
    return Object.fromEntries(
      Object.entries(changedFields).map(([key, value]) => {
        if (value === undefined || value === null) {
          return [key, null];
        }
        // Format date fields to ISO date string (YYYY-MM-DD) using helper method
        if (dateFields.has(key)) {
          return [key, this.convertToISODateString(value)];
        }
        return [key, value];
      })
    ) as Partial<OrderResponseDTOFormatted>;
  }

  public formatLocalDateTimeToISO(date: Date): string {
    if (!date) return '';
    // example input: 2200-12-08T00:00:00.000+01:00
    return date.toISOString();
  }

  public formatISODateTimeToDateString(dateString: string): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('de-DE');
  }
}
