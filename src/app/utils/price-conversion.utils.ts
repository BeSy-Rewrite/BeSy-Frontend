/**
 * Utility functions for price conversion and formatting.
 * These functions are used to convert prices between different formats and calculate totals.
 */
import { ItemResponseDTO } from '../api-services-v2';

/**
 * Transforms a number or string into a German formatted price string, e.g. "1234.5" → "1.234,50"
 * Supports both dot and comma as decimal separators in the input.
 * @param value The number or string to format.
 * @returns The formatted price string in German format.
 */
export function formatPriceToGerman(value: string | number): string {
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
 * Parses a German formatted price string (e.g. "1.234,56") to a number
 * @param price The German formatted price string
 * @returns The parsed number or undefined if parsing fails
 */
export function parseGermanPriceToNumber(price?: string): number | undefined {
  if (!price) return undefined;

  // Remove thousand separators (.) and replace decimal comma with dot
  const normalized = price.replaceAll('.', '').replace(',', '.');
  const num = Number.parseFloat(normalized);

  return Number.isNaN(num) ? undefined : num;
}

/**
 * Calculates the net price from a gross price and VAT percentage.
 * If VAT is zero or negative, returns the gross price unchanged.
 * @param grossPrice The gross price including VAT.
 * @param vatPercent The VAT percentage to apply. E.g., 19 for 19% VAT.
 * @returns The calculated net price.
 */
export function calculateNetPrice(grossPrice: number, vatPercent: number): number {
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
export function calculateGrossPrice(netPrice: number, vatPercent: number): number {
  if (vatPercent <= 0) return netPrice;
  return netPrice * (1 + vatPercent / 100);
}

/**
 * Calculates the total net price for a list of items.
 * @param items The list of items to calculate the total net price for.
 * @returns The total net price.
 */
export function calculateTotalNetPrice(items: ItemResponseDTO[]): number {
  let totalNetPrice = 0;
  for (const item of items) {
    let price = (item.price_per_unit ?? 0) * (item.quantity ?? 0);
    if (item.vat_type === ItemResponseDTO.VatTypeEnum.BRUTTO) {
      price = calculateNetPrice(price, item.vat?.value ?? 0);
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
export function calculateTotalGrossPrice(items: ItemResponseDTO[]): number {
  let totalGrossPrice = 0;
  for (const item of items) {
    let price = (item.price_per_unit ?? 0) * (item.quantity ?? 0);
    if (item.vat_type === ItemResponseDTO.VatTypeEnum.NETTO) {
      price = calculateGrossPrice(price, item.vat?.value ?? 0);
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
export function calculateTotalQuantity(items: ItemResponseDTO[]): number {
  let totalQuantity = 0;
  for (const item of items) {
    totalQuantity += item.quantity ?? 0;
  }
  return totalQuantity;
}
