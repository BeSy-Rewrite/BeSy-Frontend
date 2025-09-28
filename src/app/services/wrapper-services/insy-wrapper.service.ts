import { Injectable } from '@angular/core';
import { InsyService } from '../../api';

@Injectable({
  providedIn: 'root'
})
export class InsyWrapperService {

  /**
     * Sendet eine Bestellung anhand der Bestell-ID an das Insy-System.
     * @param orderId ID der zu sendenden Bestellung.
     * @returns any Bestellung erfolgreich an Insy gesendet.
     * @throws ApiError
     */
  async postOrderToInsy(orderId: number) {
    const response = await InsyService.postOrderToInsy(orderId);
    return response;
  }
}
