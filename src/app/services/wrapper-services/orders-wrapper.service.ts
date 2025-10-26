import {
  FormattedPerson,
  PersonsWrapperService,
} from './persons-wrapper.service';
import { CostCenterWrapperService } from './cost-centers-wrapper.service';
import { Injectable } from '@angular/core';
import {
  CurrencyResponseDTO,
  ItemRequestDTO,
  ItemResponseDTO,
  OrderRequestDTO,
  OrderResponseDTO,
  OrdersService,
  OrderStatus,
  PagedOrderResponseDTO,
  QuotationRequestDTO,
  QuotationResponseDTO,
} from '../../api';
import { CurrencyWithDisplayName } from './currencies-wrapper.service';
import { CurrenciesWrapperService } from './currencies-wrapper.service';
import { CostCenterFormatted } from './cost-centers-wrapper.service';
import {
  SupplierFormatted,
  SuppliersWrapperService,
} from './suppliers-wrapper.service';
import { Form } from '@angular/forms';
import {
  ItemTableModel,
  QuotationTableModel,
} from '../../pages/order/edit-order-page/edit-order-page.component';

export interface OrderResponseDTOFormatted {
  id?: number;
  primary_cost_center_id?: CostCenterFormatted | undefined;
  booking_year?: string; //
  auto_index?: number;
  created_date?: string;
  legacy_alias?: string;
  owner_id?: number;
  content_description?: string; // Beschreibung der Bestellung
  status?: OrderResponseDTO.status;
  currency?: CurrencyWithDisplayName | undefined;
  comment?: string;
  comment_for_supplier?: string;
  quote_number?: string; // Angebotsnummer
  quote_sign?: string;
  quote_date?: string;
  quote_price?: number;
  delivery_person_id?: FormattedPerson | undefined;
  invoice_person_id?: FormattedPerson | undefined;
  queries_person_id?: FormattedPerson | undefined;
  customer_id?: string;
  supplier_id?: SupplierFormatted | undefined;
  secondary_cost_center_id?: CostCenterFormatted | string | undefined;
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
    private costCenterWrapperService: CostCenterWrapperService,
    private personsWrapperService: PersonsWrapperService,
    private currenciesWrapperService: CurrenciesWrapperService,
    private suppliersWrapperService: SuppliersWrapperService
  ) {}
  /**
   * @param page Seitenzahl für die Paginierung (beginnend bei 0).
   * @param size Anzahl der Elemente pro Seite.
   * @param sort Sortierung der Ergebnisse. Mehrfache Sortierfelder möglich, z. B.  `sort=bookingYear,desc&sort=id,asc` sortiert zuerst nach `bookingYear` (absteigend), dann nach `id` (aufsteigend).
   *
   * @param primaryCostCenters Filtert nach IDs der primären Kostenstellen.
   * @param bookingYears Filtert nach den letzten zwei Ziffern der Jahreszahl der Buchung. Achtung, diese muss ein String sein, z.B. "25".
   * @param createdAfter Filtert nach Bestellungen, welche nach oder zu diesem Zeitpunkt erstellt wurden.
   * @param createdBefore Filtert nach Bestellungen, welche vor oder zu diesem Zeitpunkt erstellt wurden.
   * @param ownerIds Filtert nach IDs der Ersteller der Bestellung. Beinh
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
  async getAllOrders(
    page?: number,
    size: number = 20,
    sort?: Array<string>,
    primaryCostCenters?: Array<string>,
    bookingYears?: Array<string>,
    createdAfter?: string,
    createdBefore?: string,
    ownerIds?: Array<number>,
    statuses?: Array<OrderStatus>,
    quotePriceMin?: number,
    quotePriceMax?: number,
    deliveryPersonIds?: Array<number>,
    invoicePersonIds?: Array<number>,
    queriesPersonIds?: Array<number>,
    customerIds?: Array<string>,
    supplierIds?: Array<number>,
    secondaryCostCenters?: Array<string>,
    lastUpdatedTimeAfter?: string,
    lastUpdatedTimeBefore?: string
  ): Promise<PagedOrderResponseDTO> {
    return await OrdersService.getAllOrders(
      page,
      size,
      sort,
      primaryCostCenters,
      bookingYears,
      createdAfter,
      createdBefore,
      ownerIds,
      statuses,
      quotePriceMin,
      quotePriceMax,
      deliveryPersonIds,
      invoicePersonIds,
      queriesPersonIds,
      customerIds,
      supplierIds,
      secondaryCostCenters,
      lastUpdatedTimeAfter,
      lastUpdatedTimeBefore
    );
  }

  async createOrder(request: OrderRequestDTO): Promise<OrderResponseDTO> {
    request.booking_year = request.booking_year?.slice(-2); // Nur die letzten zwei Ziffern übergeben
    return await OrdersService.createOrder(request);
  }

  async getOrderById(orderId: number): Promise<OrderResponseDTO> {
    return await OrdersService.getOrderById(orderId);
  }

  async deleteOrder(orderId: number): Promise<void> {
    return await OrdersService.deleteOrder(orderId);
  }

  async getOrderItems(orderId: number): Promise<ItemResponseDTO[]> {
    return await OrdersService.getOrderItems(orderId);
  }

  async createOrderItems(orderId: number, requestBody: any): Promise<any> {
    return await OrdersService.createOrderItems(orderId, requestBody);
  }

  async deleteItemOfOrder(orderId: number, itemId: number): Promise<void> {
    return await OrdersService.deleteItemOfOrder(orderId, itemId);
  }

  async getOrderQuotations(orderId: number): Promise<QuotationResponseDTO[]> {
    return await OrdersService.getOrderQuotations(orderId);
  }

  async createOrderQuotations(orderId: number, requestBody: any): Promise<any> {
    return await OrdersService.createOrderQuotations(orderId, requestBody);
  }

  async deleteQuotationOfOrder(
    orderId: number,
    quotationId: number
  ): Promise<void> {
    return await OrdersService.deleteQuotationOfOrder(orderId, quotationId);
  }

  async exportOrderToFormula(orderId: string): Promise<any> {
    return await OrdersService.exportOrderToFormula(orderId);
  }

  async getOrderByIDInFormFormat(
    orderId: number
  ): Promise<OrderResponseDTOFormatted> {
    const orderData = await OrdersService.getOrderById(orderId);
    return this.formatOrderData(orderData);
  }

  private async formatOrderData(
    order: OrderResponseDTO
  ): Promise<OrderResponseDTOFormatted> {
    let formatedPrimaryCostCenter: CostCenterFormatted | undefined = undefined;
    let formatedSecondaryCostCenter: CostCenterFormatted | undefined =
      undefined;
    let formatedDeliveryPerson: FormattedPerson | undefined = undefined;
    let formatedInvoicePerson: FormattedPerson | undefined = undefined;
    let formatedQueriesPerson: FormattedPerson | undefined = undefined;
    let formatedCurrency: CurrencyWithDisplayName | undefined = undefined;
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
        ? this.personsWrapperService.getPersonByIdFormattedForAutocomplete(
            order.delivery_person_id
          )
        : Promise.resolve(undefined),

      order.invoice_person_id
        ? this.personsWrapperService.getPersonByIdFormattedForAutocomplete(
            order.invoice_person_id
          )
        : Promise.resolve(undefined),

      order.queries_person_id
        ? this.personsWrapperService.getPersonByIdFormattedForAutocomplete(
            order.queries_person_id
          )
        : Promise.resolve(undefined),

      order.supplier_id
        ? this.suppliersWrapperService.getSupplierByIdFormattedForAutocomplete(
            order.supplier_id
          )
        : Promise.resolve(undefined),
      order.currency
        ? this.currenciesWrapperService.formatCurrencyWithSymbol(order.currency)
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
    };
  }

  mapItemResponseToTableModel(items: ItemResponseDTO[]): ItemTableModel[] {
    return items.map((item) => ({
      item_id: item.item_id,
      name: item.name ?? '',
      price_per_unit: item.price_per_unit ?? 0,
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
      price_per_unit: item.price_per_unit,
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

  mapQuotationResponseToTableModel(
    quotations: QuotationResponseDTO[]
  ): QuotationTableModel[] {
    return quotations.map((q) => ({
      index: q.index ?? 0,
      quote_date: q.quote_date ?? '',
      price: this.formatPriceToGerman(q.price ?? 0),
      company_name: q.company_name ?? '',
      company_city: q.company_city ?? '',
    }));
  }

  mapQuotationRequestToTableModel(
    quotations: QuotationRequestDTO[]
  ): QuotationTableModel[] {
    return quotations.map((q) => ({
      quote_date: q.quote_date,
      price: this.formatPriceToGerman(q.price),
      company_name: q.company_name,
      company_city: q.company_city,
    }));
  }

  /**
   * Transforms a number or string into a German formatted price string, e.g. "1234.5" → "1.234,50"
   * Supports both dot and comma as decimal separators in the input.
   * @param value The number or string to format.
   * @returns The formatted price string in German format.
   */
  formatPriceToGerman(value: string | number): string {
    if (value === null || value === undefined) return '0,00';

    // Als String konvertieren und Leerzeichen entfernen
    let str = String(value).trim();

    // Falls beides vorkommt (Punkt und Komma), nur das letzte als Dezimaltrennzeichen interpretieren
    const lastComma = str.lastIndexOf(',');
    const lastDot = str.lastIndexOf('.');
    if (lastComma > lastDot) {
      str = str.replace(/\./g, '').replace(',', '.'); // deutsches Format → normalisieren
    } else {
      str = str.replace(/,/g, ''); // falls nur Punkt-Format vorhanden ist
    }

    const num = parseFloat(str);
    if (isNaN(num)) return '0,00';

    // Deutsch formatieren
    return num.toLocaleString('de-DE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
}
