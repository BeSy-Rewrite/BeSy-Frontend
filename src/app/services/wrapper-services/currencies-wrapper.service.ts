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

  async getAllCurrencies() {
    return CurrenciesService.getAllCurrencies();
  }


  /** Fetch currencies with symbols
   *  e.g. "Euro (€)"
   */
  async getAllCurrenciesWithSymbol() {
    // Fetch currencies from the API service
    const currencies = await CurrenciesService.getAllCurrencies();

    // Add symbol for each element
    return currencies.map((c) => {
      const code = c.code ?? ''; // ISO 4217 currency code
      const name = c.name ?? ''; // name of the currency

      // Fetch currency symbol
      let symbol = '';
      if (code) {
        try {
          symbol =
            Intl.NumberFormat('en', { style: 'currency', currency: code })
              .formatToParts(0)
              .find((part) => part.type === 'currency')?.value ?? '';
        } catch {
          // Fallback for unsupported code
          symbol = '';
        }
      }

      return {
        ...c,
        symbol, // e.g. "€"
        displayName: `${name} (${symbol})`, // e.g. "Euro (€)"
      } as CurrencyWithDisplayName;
    });
  }
}
