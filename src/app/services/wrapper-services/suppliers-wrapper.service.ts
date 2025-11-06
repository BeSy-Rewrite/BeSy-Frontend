import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { SuppliersService } from '../../api-services-v2';

@Injectable({
  providedIn: 'root'
})
export class SuppliersWrapperService {
  constructor(private readonly suppliersService: SuppliersService) { }

  async getAllSuppliers() {
    return lastValueFrom(this.suppliersService.getAllSuppliers());
  }

  async getSupplierById(id: number) {
    return lastValueFrom(this.suppliersService.getSupplierById(id));
  }

  async createSupplier(supplier: any) {
    return lastValueFrom(this.suppliersService.createSupplier(supplier));
  }

  async updateSupplier(id: number, supplier: any) {
    return lastValueFrom(this.suppliersService.updateSupplierById(id, supplier));
  }

  /**
   * @param supplierId Die eindeutige ID des Lieferanten.
   * @returns Liste der Kundennummern eines Lieferanten.
   */
  async getCustomersIdBySupplier(supplierId: number) {
    return lastValueFrom(this.suppliersService.getCustomerIdsOfOrder(supplierId));
  }

  async createSupplierCustomerId(supplierId: number, customerId: any) {
    return lastValueFrom(this.suppliersService.createSupplierCustomerId(supplierId, customerId));
  }

  async getSupplierAddress(id: number) {
    return lastValueFrom(this.suppliersService.getSupplierAddress(id));
  }
}
