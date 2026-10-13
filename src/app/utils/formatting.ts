import { environment } from '../../environments/environment';
import {
  CostCenterResponseDTO,
  CurrencyResponseDTO,
  ItemResponseDTO,
  OrderResponseDTO,
  PersonResponseDTO,
  SupplierResponseDTO,
  UserResponseDTO,
  VatResponseDTO,
} from '../api-services-v2';
import { PREFERRED_LIST_NAMES } from '../display-name-mappings/preferred-list-names';

/**
 * Formats an ISO date string into a localized, human-readable date.
 * Returns an empty string when the input is falsy or invalid.
 * @param dateString ISO 8601 date string.
 * @returns Formatted date string.
 */
export function formatDate(dateString: string | undefined): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Formats a price to German locale with currency.
 * Returns an empty string when price or currencyCode is missing.
 * @param price Numeric price value.
 * @param currencyCode ISO 4217 currency code (e.g., "EUR").
 * @returns Formatted price string including currency.
 */
export function getCurrencySymbol(code: string): string | undefined {
  try {
    return (
      Intl.NumberFormat('de', { style: 'currency', currency: code })
        .formatToParts(0)
        .find(part => part.type === 'currency')?.value ?? undefined
    );
  } catch {
    return undefined;
  }
}

/**
 * Formats a price with currency according to locale.
 * Returns an empty string when price or currencyCode is missing.
 * @param price Numeric price value.
 * @param currencyCode ISO 4217 currency code (e.g., "EUR").
 * @returns Formatted price string including currency.
 */
export function formatPriceToGerman(
  price: number | undefined,
  currencyCode: string | undefined
): string {
  return Intl.NumberFormat('de', { style: 'currency', currency: currencyCode ?? 'EUR' }).format(
    price ?? 0
  );
}

/**
 * Returns a human-readable label for a currency (e.g., "EUR – Euro").
 */
export function formatCurrency(currency: CurrencyResponseDTO): string {
  return currency.code
    ? `${currency.code} (${getCurrencySymbol(currency.code)})`
    : (currency.name ?? '');
}

export function formatVat(vat: VatResponseDTO): string {
  return `${vat.description} (${vat.value}%)`;
}

/**
 * Formats a supplier object into a display label (e.g., "123 - Supplier AG").
 * @param supplier Supplier DTO.
 * @returns Formatted supplier label or empty string.
 */
export function formatSupplier(supplier: SupplierResponseDTO | undefined): string {
  return supplier?.name ?? supplier?.website ?? '';
}

/**
 * Returns a human-readable label for a user (e.g., "u123 – Jane Doe").
 */
export function formatUser(user: UserResponseDTO): string {
  const names = [user.name, user.surname];
  return names.filter(Boolean).join(' ');
}

/**
 * Returns a human-readable label for a person (e.g., "p42 – John Doe").
 */
export function formatPerson(person: PersonResponseDTO): string {
  const names = [person.title, person.name, person.surname];
  return names.filter(Boolean).join(' ');
}

/**
 * Returns a human-readable label for a cost center (e.g., "4711 (IT Services)").
 */
export function formatCostCenter(center: CostCenterResponseDTO): string {
  return `${center.id} (${center.name})`;
}

/**
 * Formats the preferred list enum into a human-readable string.
 * @param preferredList The preferred list enum value.
 * @returns The formatted preferred list string.
 */
export function formatPreferredList(
  preferredList: ItemResponseDTO.PreferredListEnum | undefined
): string {
  if (preferredList) {
    return PREFERRED_LIST_NAMES.get(preferredList) ?? preferredList;
  }
  return 'Keine bevorzugte Liste';
}

/**
 * Constructs the order number from its components.
 * @param order The order DTO.
 * @returns The constructed order number or undefined if any part is missing.
 */
export function getOrderNumber(order: OrderResponseDTO): string | undefined {
  const formattedIndex =
    order.auto_index != undefined ? order.auto_index.toString().padStart(3, '0') : undefined;
  const orderNumber = [order.primary_cost_center_id, order.booking_year, formattedIndex];
  if (orderNumber.some(part => part === undefined || part === null || part === '')) {
    return undefined;
  }
  return environment.besyNumber.prefix + orderNumber.join(environment.besyNumber.separator);
}

/** Converts a 2-digit booking year ("24") to a full year ("2024"). */
export function formatBookingYear(year?: string): string | undefined {
  return year ? `20${year.padStart(2, '0')}` : undefined;
}
