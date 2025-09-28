import { Injectable } from '@angular/core';
import { CurrenciesService } from '../../api';

@Injectable({
  providedIn: 'root',
})
export class CurrencyWrapperService {
  getAllCurrencies() {
    try {
      return CurrenciesService.getAllCurrencies();
    } catch (error) {
      console.error('Error fetching currencies:', error);
      throw error;
    }
  }
}
