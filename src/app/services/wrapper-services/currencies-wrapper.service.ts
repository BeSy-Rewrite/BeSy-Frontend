import { Injectable } from '@angular/core';
import { CurrenciesService, CurrencyResponseDTO } from '../../api';

export interface CurrencyWithDisplayName extends CurrencyResponseDTO {
  symbol: string; // currency symbol, e.g. "€"
  displayName: string; // field combining name with the currency symbol, e.g. "Euro (€)"
}

@Injectable({
  providedIn: 'root',
})
export class CurrenciesWrapperService {
  private static readonly CACHE_KEY = 'currencies_cache';
  private static readonly CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

  async getAllCurrencies() {
    return CurrenciesService.getAllCurrencies();
  }

  /**
   * Fetch all currencies with their symbols.
   * @param forceRefresh Whether to bypass the cache and fetch fresh data.
   * @returns A promise that resolves to an array of currencies with their symbols.
   */
  async getAllCurrenciesWithSymbol(
    forceRefresh = false
  ): Promise<CurrencyWithDisplayName[]> {
    const cacheString = localStorage.getItem(
      CurrenciesWrapperService.CACHE_KEY
    );
    const cache = cacheString ? JSON.parse(cacheString) : null;

    // Check if cache is set and still valid
    if (
      !forceRefresh &&
      cache &&
      Date.now() - cache.timestamp < CurrenciesWrapperService.CACHE_TTL_MS
    ) {
      return cache.data as CurrencyWithDisplayName[];
    }

    // If cache is not valid or doesn't exist, make API call
    const currencies = await CurrenciesService.getAllCurrencies();

    // Enrich currencies with symbols
    const enrichedCurrencies = currencies.map((c) => {
      const code = c.code ?? '';
      const name = c.name ?? '';

      let symbol = '';
      if (code) {
        try {
          symbol =
            Intl.NumberFormat('en', { style: 'currency', currency: code })
              .formatToParts(0)
              .find((part) => part.type === 'currency')?.value ?? '';
        } catch {
          symbol = '';
        }
      }

      return {
        ...c,
        symbol,
        displayName: `${name} (${symbol})`,
      } as CurrencyWithDisplayName;
    });

    // Cache the enriched data with a timestamp
    localStorage.setItem(
      CurrenciesWrapperService.CACHE_KEY,
      JSON.stringify({
        timestamp: Date.now(),
        data: enrichedCurrencies,
      })
    );

    // Enriched data zurückgeben
    return enrichedCurrencies;
  }

  formatCurrencyWithSymbol(currency: CurrencyResponseDTO): CurrencyWithDisplayName {
    const code = currency.code ?? '';

    let symbol = '';
    if (code) {
      try {
        symbol =
          Intl.NumberFormat('en', { style: 'currency', currency: code })
            .formatToParts(0)
            .find((part) => part.type === 'currency')?.value ?? '';
      } catch {
        symbol = '';
      }
    }

    return {
      ...currency,
      symbol,
      displayName: `${currency.name} (${symbol})`,
    };
  }
}
