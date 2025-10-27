import { Injectable } from '@angular/core';
import { InsyService } from '../../apiv2';

@Injectable({
  providedIn: 'root'
})
export class InsyWrapperService {
  constructor(private readonly insyService: InsyService) { }

  /**
     * Sends an order to Insy.
     * @param orderId The ID of the order to be sent.
     * @returns Observable with the result of the operation.
     */
  postOrderToInsy(orderId: number) {
    return this.insyService.postOrderToInsy(orderId);
  }
}
