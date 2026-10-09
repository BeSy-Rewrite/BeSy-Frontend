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
