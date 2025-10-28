import { Injectable } from '@angular/core';
import { BehaviorSubject, debounceTime, forkJoin, map, Observable, of } from 'rxjs';
import { CostCenterResponseDTO, CurrencyResponseDTO, ItemResponseDTO, OrderResponseDTO, PersonResponseDTO, SupplierResponseDTO, UserResponseDTO } from '../apiv2';
import { PREFERRED_LIST_NAMES } from '../display-name-mappings/preferred-list-names';
import { STATE_DISPLAY_NAMES, STATE_ICONS } from '../display-name-mappings/status-names';
import { ChipFilterPreset, DateRangeFilterPreset, OrdersFilterPreset, RangeFilterPreset } from '../models/filter/filter-presets';
import { OrderDisplayData } from '../models/order-display-data';
import { CostCenterWrapperService } from './wrapper-services/cost-centers-wrapper.service';
import { CurrencyWrapperService } from './wrapper-services/currencies-wrapper.service';
import { PersonsWrapperService } from './wrapper-services/persons-wrapper.service';
import { SuppliersWrapperService } from './wrapper-services/suppliers-wrapper.service';
import { UsersWrapperService } from './wrapper-services/users-wrapper.service';

/**
 * Union of identifier types used to look up subresources.
 * - number: numeric ID
 * - string: textual ID or code
 * - undefined: when the reference is missing
 */
type numberOrString = number | string | undefined;

/**
 * Minimal shape of objects that can be identified either by `id` or `code`.
 */
type IdAble = { id?: number | string; } | { code?: string; };

/**
 * Generic helper that loads, caches, and formats subresources for display.
 * It batches fetch requests using a debounce and exposes a simple `format` API
 * that returns an observable label for a given id.
 */
class ResourceFormatter<T extends IdAble> {
  /** In-memory cache of fetched resources, keyed by id or code. */
  private mapping = new BehaviorSubject<Map<numberOrString, T>>(new Map());
  /** Debounced fetch trigger used to batch network requests. */
  private readonly requestFetch = new BehaviorSubject<void>(undefined);
  private fetchInProgress = false;

  /**
   * Creates a new ResourceFormatter.
   * @param formatter Function that converts a resource to a display string.
   * @param fetchAll Function that returns all resources for caching.
   * @param debounceMs Debounce duration in milliseconds for batching fetches. Defaults to 300 ms.
   */
  constructor(
    private readonly formatter: (value: T) => string,
    private readonly fetchAll: () => Observable<T[]>,
    private readonly debounceMs: number = 300
  ) {
    this.requestFetch
      .pipe(debounceTime(this.debounceMs))
      .subscribe(() =>
        this.fetchAll().subscribe(resources => {
          const map = new Map<numberOrString, T>();
          for (const resource of resources) {
            if ('id' in resource && resource.id) map.set(resource.id.toString().trim(), resource);
            if ('code' in resource && resource.code) map.set(resource.code.toString().trim(), resource);
          }
          this.fetchInProgress = false;
          this.mapping.next(map);
          this.mapping.complete();
          this.mapping = new BehaviorSubject<Map<numberOrString, T>>(map);
        })
      );
  }

  /**
   * Returns an observable display label for the given identifier.
   * If the resource is not yet cached, a debounced fetch is requested.
   * @param id Identifier of the resource (id or code).
   * @returns Observable that emits the formatted label or an empty string if not found.
   */
  format(id: numberOrString): Observable<string> {
    if (!id) return of('');
    id = id.toString().trim();

    if (this.mapping.getValue().has(id)) {
      return of(this.formatter(this.mapping.getValue().get(id)!));
    }

    if (!this.fetchInProgress) {
      this.fetchInProgress = true;
      this.requestFetch.next();
    }

    return this.mapping.asObservable().pipe(
      map(mapping => mapping.has(id) ? this.formatter(mapping.get(id)!) : '')
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class OrderSubresourceResolverService {
  /** Formats currencies for display and caches them by id/code. */
  private readonly currencyFormatter: ResourceFormatter<CurrencyResponseDTO>;
  /** Formats users for display and caches them by id/code. */
  private readonly userFormatter: ResourceFormatter<UserResponseDTO>;
  /** Formats persons for display and caches them by id/code. */
  private readonly personFormatter: ResourceFormatter<PersonResponseDTO>;
  /** Formats cost centers for display and caches them by id/code. */
  private readonly costCenterFormatter: ResourceFormatter<CostCenterResponseDTO>;
  /** Formats suppliers for display and caches them by id/code. */
  private readonly supplierFormatter: ResourceFormatter<SupplierResponseDTO>;

  /**
   * Constructs the resolver and wires up the resource formatters.
   * Inject API clients or services here to provide `fetchAll` functions.
   */
  constructor(
    private readonly usersService: UsersWrapperService,
    private readonly currenciesService: CurrencyWrapperService,
    private readonly personsService: PersonsWrapperService,
    private readonly costCentersService: CostCenterWrapperService,
    private readonly suppliersService: SuppliersWrapperService
  ) {

    this.currencyFormatter = new ResourceFormatter<CurrencyResponseDTO>(
      (c) => this.formatCurrency(c), () => this.currenciesService.getAllCurrencies()
    );
    this.userFormatter = new ResourceFormatter<UserResponseDTO>(
      (u) => this.formatUser(u), () => this.usersService.getAllUsers()
    );
    this.personFormatter = new ResourceFormatter<PersonResponseDTO>(
      (p) => this.formatPerson(p), () => this.personsService.getAllPersons()
    );
    this.costCenterFormatter = new ResourceFormatter<CostCenterResponseDTO>(
      (c) => this.formatCostCenter(c), () => this.costCentersService.getAllCostCenters()
    );
    this.supplierFormatter = new ResourceFormatter<SupplierResponseDTO>(
      (s) => this.formatSupplier(s), () => this.suppliersService.getAllSuppliers()
    );

  }

  /**
   * Resolves and formats all subresources of an order into display-ready data.
   * May perform async lookups; use this when you need an observable result.
   * @param order Raw order DTO received from the backend.
   * @returns Observable that emits the populated OrderDisplayData.
   */
  resolveOrderSubresources(order: OrderResponseDTO): Observable<OrderDisplayData> {
    return forkJoin({
      costCenter: this.costCenterFormatter.format(order.primary_cost_center_id),
      owner: this.userFormatter.format(order.owner_id),
      currency: this.currencyFormatter.format(order.currency?.code),
      deliveryPerson: this.personFormatter.format(order.delivery_person_id),
      invoicePerson: this.personFormatter.format(order.invoice_person_id),
      queriesPerson: this.personFormatter.format(order.queries_person_id),
      supplier: this.supplierFormatter.format(order.supplier_id),
      secondaryCostCenter: this.costCenterFormatter.format(order.secondary_cost_center_id ?? '')
    }).pipe(
      map(results => {
        const data = this.convertOrderToDisplayData(order);
        // Append resolved names to existing fields
        data.primary_cost_center_id += results.costCenter;
        data.owner_id = results.owner;
        data.currency = results.currency;
        data.delivery_person_id = results.deliveryPerson;
        data.invoice_person_id = results.invoicePerson;
        data.queries_person_id = results.queriesPerson;
        data.supplier_id = results.supplier;
        data.secondary_cost_center_id += results.secondaryCostCenter;
        return data;
      })
    );
  }

  /**
   * Converts a raw order DTO to display data synchronously, assuming
   * required subresources are already available in caches.
   * @param order Raw order DTO.
   * @returns Display-ready order data.
   */
  convertOrderToDisplayData(order: OrderResponseDTO): OrderDisplayData {
    const data = {} as OrderDisplayData;
    data.id = order.id?.toString() ?? '';
    data.besy_number = `${order.primary_cost_center_id}-${order.booking_year}-${order.auto_index}`;
    data.primary_cost_center_id = '';
    data.booking_year = order.booking_year ? '20' + order.booking_year : '';
    data.auto_index = order.auto_index ?? '';
    data.created_date = this.formatDate(order.created_date);
    data.legacy_alias = order.legacy_alias ?? '';
    data.owner_id = '';
    data.content_description = order.content_description ?? '';
    data.status = order.status ? (STATE_ICONS.get(order.status) ?? order.status) : '';
    data.currency = '';
    data.comment = order.comment ?? '';
    data.comment_for_supplier = order.comment_for_supplier ?? '';
    data.quote_number = order.quote_number ?? '';
    data.quote_sign = order.quote_sign ?? '';
    data.quote_date = this.formatDate(order.quote_date);
    data.quote_price = this.formatPrice(order.quote_price ?? 0, order.currency?.code ?? 'EUR');
    data.delivery_person_id = '';
    data.invoice_person_id = '';
    data.queries_person_id = '';
    data.customer_id = order.customer_id ?? '';
    data.supplier_id = '';
    data.secondary_cost_center_id = '';
    data.fixed_discount = order.fixed_discount?.toString() ?? '';
    data.percentage_discount = order.percentage_discount?.toString() ?? '';
    data.cash_discount = order.cash_discount?.toString() ?? '';
    data.cashback_days = order.cashback_days?.toString() ?? '';
    data.last_updated_time = this.formatDate(order.last_updated_time);
    data.flag_decision_cheapest_offer = order.flag_decision_cheapest_offer ? 'Ja' : 'Nein';
    data.flag_decision_most_economical_offer = order.flag_decision_most_economical_offer ? 'Ja' : 'Nein';
    data.flag_decision_sole_supplier = order.flag_decision_sole_supplier ? 'Ja' : 'Nein';
    data.flag_decision_contract_partner = order.flag_decision_contract_partner ? 'Ja' : 'Nein';
    data.flag_decision_preferred_supplier_list = order.flag_decision_preferred_supplier_list ? 'Ja' : 'Nein';
    data.flag_decision_other_reasons = order.flag_decision_other_reasons ? 'Ja' : 'Nein';
    data.decision_other_reasons_description = order.decision_other_reasons_description ?? '';
    data.dfg_key = order.dfg_key ?? '';
    data.delivery_address_id = order.delivery_address_id;
    data.invoice_address_id = order.invoice_address_id;

    data.tooltips = this.getTooltips(order);

    return data;
  }

  /**
   * Formats an ISO date string into a localized, human-readable date.
   * Returns an empty string when the input is falsy or invalid.
   * @param dateString ISO 8601 date string.
   * @returns Formatted date string.
   */
  formatDate(dateString: string | undefined): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString("de-DE",
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
  }

  /**
   * Formats a price with currency according to locale.
   * Returns an empty string when price or currencyCode is missing.
   * @param price Numeric price value.
   * @param currencyCode ISO 4217 currency code (e.g., "EUR").
   * @returns Formatted price string including currency.
   */
  formatPrice(price: number | undefined, currencyCode: string | undefined): string {
    return Intl.NumberFormat('de', { style: 'currency', currency: currencyCode ?? 'EUR' }).format(price ?? 0);
  }

  /**
   * Formats a supplier object into a display label (e.g., "123 - Supplier AG").
   * @param supplier Supplier DTO.
   * @returns Formatted supplier label or empty string.
   */
  formatSupplier(supplier: SupplierResponseDTO | undefined): string {
    return supplier?.name ?? supplier?.website ?? '';
  }

  /**
   * Returns a human-readable label for a currency (e.g., "EUR – Euro").
   */
  formatCurrency = (currency: CurrencyResponseDTO) => {
    return currency.name ?? currency.code ?? '';
  };

  /**
   * Returns a human-readable label for a user (e.g., "u123 – Jane Doe").
   */
  formatUser = (user: UserResponseDTO) => {
    const names = [user.name ?? ''];
    names.push(user.surname ?? '');
    return names.filter(name => name && name.trim().length > 0).join(' ');
  };

  /**
   * Returns a human-readable label for a person (e.g., "p42 – John Doe").
   */
  formatPerson = (person: PersonResponseDTO) => {
    const names = [person.title ?? '', person.name ?? '', person.surname ?? ''];
    return names.filter(name => name && name.trim().length > 0).join(' ');
  };

  /**
   * Returns a human-readable label for a cost center (e.g., "4711 – IT Services").
   */
  formatCostCenter = (center: CostCenterResponseDTO) => {
    return `${center.id} - ${center.name}`;
  };

  /**
   * Formats the preferred list enum into a human-readable string.
   * @param preferredList The preferred list enum value.
   * @returns The formatted preferred list string.
   */
  formatPreferredList(preferredList: ItemResponseDTO.PreferredListEnum | undefined): string {
    switch (preferredList) {
      case ItemResponseDTO.PreferredListEnum.Rz:
        return PREFERRED_LIST_NAMES.get(ItemResponseDTO.PreferredListEnum.Rz) ?? 'RZ';
      case ItemResponseDTO.PreferredListEnum.Ta:
        return PREFERRED_LIST_NAMES.get(ItemResponseDTO.PreferredListEnum.Ta) ?? 'TA';
      default:
        return 'Keine bevorzugte Liste';
    }
  }

  /**
   * Calculates the net price from a gross price and VAT percentage.
   * If VAT is zero or negative, returns the gross price unchanged.
   * @param grossPrice The gross price including VAT.
   * @param vatPercent The VAT percentage to apply. E.g., 19 for 19% VAT.
   * @returns The calculated net price.
   */
  calculateNetPrice(grossPrice: number, vatPercent: number): number {
    if (vatPercent <= 0) return grossPrice;
    return grossPrice / (1 + vatPercent / 100);
  }

  /**
   * Calculates the gross price from a net price and VAT percentage.
   * If VAT is zero or negative, returns the net price unchanged.
   * @param netPrice The net price excluding VAT.
   * @param vatPercent The VAT percentage to apply. E.g., 19 for 19% VAT.
   * @returns The calculated gross price.
   */
  calculateGrossPrice(netPrice: number, vatPercent: number): number {
    if (vatPercent <= 0) return netPrice;
    return netPrice * (1 + vatPercent / 100);
  }

  /**
   * Calculates the total net price for a list of items.
   * @param items The list of items to calculate the total net price for.
   * @returns The total net price.
   */
  calculateTotalNetPrice(items: ItemResponseDTO[]): number {
    let totalNetPrice = 0;
    for (const item of items) {
      let price = (item.price_per_unit ?? 0) * (item.quantity ?? 0);
      if (item.vat_type === ItemResponseDTO.VatTypeEnum.Brutto) {
        price = this.calculateNetPrice(price, item.vat?.value ?? 0);
      }
      totalNetPrice += price;
    }
    return totalNetPrice;
  }

  /**
   * Calculates the total gross price for a list of items.
   * @param items The list of items to calculate the total gross price for.
   * @returns The total gross price.
   */
  calculateTotalGrossPrice(items: ItemResponseDTO[]): number {
    let totalGrossPrice = 0;
    for (const item of items) {
      let price = (item.price_per_unit ?? 0) * (item.quantity ?? 0);
      if (item.vat_type === ItemResponseDTO.VatTypeEnum.Netto) {
        price = this.calculateGrossPrice(price, item.vat?.value ?? 0);
      }
      totalGrossPrice += price;
    }
    return totalGrossPrice;
  }

  /**
   * Calculates the total quantity of items.
   * @param items The list of items to calculate the total quantity for.
   * @returns The total quantity.
   */
  calculateTotalQuantity(items: ItemResponseDTO[]): number {
    let totalQuantity = 0;
    for (const item of items) {
      totalQuantity += item.quantity ?? 0;
    }
    return totalQuantity;
  }

  /** Returns tooltip texts for specific fields in the order display data. */
  getTooltips(order: OrderResponseDTO): { [K in keyof Partial<Omit<OrderDisplayData, 'tooltips'>>]: string } {
    return {
      status: order.status ? (STATE_DISPLAY_NAMES.get(order.status) ?? order.status) : '',
    };
  }

  /**
   * Resolves the current user in the given filter presets.
   * @param filterPresets The array of OrdersFilterPreset to resolve the current user in.
   * @returns An observable of the resolved OrdersFilterPreset array.
   */
  resolveCurrentUserInPresets(filterPresets: OrdersFilterPreset[]): Observable<OrdersFilterPreset[]> {
    return this.usersService.getCurrentUser().pipe(
      map(user => {
        if (!user?.id) {
          throw new Error('Current user not found');
        }

        return this.replaceCurrentUserInPresets(filterPresets, user.id);
      })
    );
  }

  /**
   * Replaces occurrences of 'CURRENT_USER' in the filter presets with the actual user ID.
   * @param filterPresets The array of OrdersFilterPreset to process.
   * @param userId The ID of the current user.
   * @returns The modified array of OrdersFilterPreset.
   */
  private replaceCurrentUserInPresets(filterPresets: OrdersFilterPreset[], userId: string): OrdersFilterPreset[] {
    return filterPresets.map(preset => ({
      ...preset,
      appliedFilters: preset.appliedFilters.map(f => this.replaceCurrentUserInAppliedFilter(f, userId))
    }));
  }

  /**
   * Replaces 'CURRENT_USER' in a single applied filter if it is a ChipFilterPreset.
   * @param filter The filter preset to process.
   * @param userId The ID of the current user.
   * @returns The modified filter preset.
   */
  private replaceCurrentUserInAppliedFilter(filter: ChipFilterPreset | DateRangeFilterPreset | RangeFilterPreset, userId: string): any {
    if (!('chipIds' in filter)) {
      return filter;
    }

    return {
      ...filter,
      chipIds: filter.chipIds.map((id: numberOrString) =>
        id === 'CURRENT_USER' ? userId : id
      )
    };
  }
}
