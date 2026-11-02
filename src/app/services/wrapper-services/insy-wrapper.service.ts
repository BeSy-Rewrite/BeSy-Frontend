import { inject, Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { InsyControllerService } from '../../api-services-v2';

@Injectable({
  providedIn: 'root',
})
export class InsyWrapperService {
  private readonly insyService = inject(InsyControllerService);

  /**
   * Sendet eine Bestellung anhand der Bestell-ID an das Insy-System.
   * @param orderId ID der zu sendenden Bestellung.
   * @returns any Bestellung erfolgreich an Insy gesendet.
   * @throws ApiError
   */
  async postOrderToInsy(orderId: number) {
    return await lastValueFrom(this.insyService.sendOrderToInsy(orderId));
  }
}
