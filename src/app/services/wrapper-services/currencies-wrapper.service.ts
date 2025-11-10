import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { CurrenciesService } from '../../api-services-v2';

@Injectable({
  providedIn: 'root',
})
export class CurrencyWrapperService {
  constructor(private readonly currenciesService: CurrenciesService) { }

  getAllCurrencies() {
    try {
      return lastValueFrom(this.currenciesService.getAllCurrencies());
    } catch (error) {
      console.error('Error fetching currencies:', error);
      throw error;
    }
  }
}
