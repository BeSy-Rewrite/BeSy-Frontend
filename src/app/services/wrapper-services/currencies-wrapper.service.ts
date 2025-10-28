import { Injectable } from '@angular/core';
import { CurrenciesService } from '../../apiv2';

@Injectable({
  providedIn: 'root',
})
export class CurrencyWrapperService {
  constructor(private readonly currenciesService: CurrenciesService) { }

  getAllCurrencies() {
    return this.currenciesService.getAllCurrencies();
  }
}
