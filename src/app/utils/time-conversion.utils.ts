/**
 * Converts various date formats to ISO date string (YYYY-MM-DD)
 * Handles Luxon DateTime objects, JavaScript Date objects, and date strings
 * @param value The date value to convert
 * @returns ISO date string (YYYY-MM-DD) or empty string if invalid
 */
export function convertToISODateString(value: any): string {
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

export function formatLocalDateTimeToISO(date: Date): string {
  if (!date) return '';
  // example input: 2200-12-08T00:00:00.000+01:00
  return date.toISOString();
}

export function formatISODateTimeToDateString(dateString: string): string {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('de-DE');
}
