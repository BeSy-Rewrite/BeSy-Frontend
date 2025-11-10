import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { InsyService } from '../../api-services-v2';

@Injectable({
  providedIn: 'root'
})
export class InsyWrapperService {
  constructor(private readonly insyService: InsyService) { }

  /**
     * Sendet eine Bestellung anhand der Bestell-ID an das Insy-System.
     * @param orderId ID der zu sendenden Bestellung.
     * @returns any Bestellung erfolgreich an Insy gesendet.
     * @throws ApiError
     */
  async postOrderToInsy(orderId: number) {
    return await lastValueFrom(this.insyService.postOrderToInsy(orderId));
  }
}
