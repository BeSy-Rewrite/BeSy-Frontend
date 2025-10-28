import { Injectable } from '@angular/core';
import { SuppliersService } from '../../apiv2';

@Injectable({
  providedIn: 'root'
})
export class SuppliersWrapperService {

  constructor(private readonly suppliersService: SuppliersService) { }

  getAllSuppliers() {
    return this.suppliersService.getAllSuppliers();
  }

  getSupplierById(id: number) {
    return this.suppliersService.getSupplierById(id);
  }

  createSupplier(supplier: any) {
    return this.suppliersService.createSupplier(supplier);
  }

  updateSupplier(id: number, supplier: any) {
    return this.suppliersService.updateSupplierById(id, supplier);
  }

  /**
     * @param supplierId Die eindeutige ID des Lieferanten, für welchen die Kundennummern abgerufen werden sollen.
     * @returns CustomerIdResponseDTO Liste der Kundennummern eines Lieferanten.
     * @throws ApiError
     */
  getCustomersIdBySupplier(supplierId: number) {
    return this.suppliersService.getCustomerIdsOfOrder(supplierId);
  }

  createSupplierCustomerId(supplierId: number, customerId: any) {
    return this.suppliersService.createSupplierCustomerId(supplierId, customerId);
  }

  getSuppliersAddresses() {
    return this.suppliersService.suppliersAddressesGet();
  }

  getSupplierAddress(id: number) {
    return this.suppliersService.suppliersSupplierIdAddressGet(id);
  }
}
