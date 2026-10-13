import { Injectable } from '@angular/core';
import { from, lastValueFrom, map, Observable } from 'rxjs';
import { CurrenciesService, CurrencyResponseDTO } from '../../api-services-v2';
import { AutocompleteOption } from '../../form-config-patching/autocomplete-option';
import { formatCurrency, getCurrencySymbol } from '../../utils/formatting';

export interface CurrencyWithDisplayName extends CurrencyResponseDTO {
  symbol: string; // currency symbol, e.g. "€"
  displayName: string; // field combining name with the currency symbol, e.g. "Euro (€)"
}

export interface FormattedCurrency {
  label: string;
  value: string;
}

@Injectable({
  providedIn: 'root',
})
export class CurrenciesWrapperService {
  constructor(private readonly currenciesService: CurrenciesService) {}
  private static readonly CACHE_KEY = 'currencies_cache';
  private static readonly CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

  async getAllCurrencies() {
    return lastValueFrom(this.currenciesService.getAllCurrencies());
  }

  /**
   * Fetch all currencies with their symbols.
   * @param forceRefresh Whether to bypass the cache and fetch fresh data.
   * @returns A promise that resolves to an array of currencies with their symbols.
   */
  async getAllCurrenciesWithSymbol(forceRefresh = false): Promise<CurrencyWithDisplayName[]> {
    const cacheString = localStorage.getItem(CurrenciesWrapperService.CACHE_KEY);
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
    const currencies = await this.getAllCurrencies();

    // Enrich currencies with symbols
    const enrichedCurrencies = currencies.map(c => this.formatCurrencyWithSymbol(c));

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
    return {
      ...currency,
      symbol: currency.code ? (getCurrencySymbol(currency.code) ?? '?') : '?',
      displayName: formatCurrency(currency),
    };
  }

  getAllCurrenciesForAutocomplete(): Observable<AutocompleteOption<CurrencyWithDisplayName>[]> {
    return from(this.getAllCurrenciesWithSymbol()).pipe(
      map(currencies =>
        currencies.map(currency => ({
          label: currency.displayName,
          value: currency,
        }))
      )
    );
  }

  /**
   * Format currencies for autocomplete components.
   */
  formatCurrencyForAutocomplete(currency: CurrencyResponseDTO): FormattedCurrency {
    const formatted = this.formatCurrencyWithSymbol(currency);
    return {
      label: formatted.displayName,
      value: formatted.code ?? '',
    };
  }
}
