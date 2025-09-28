import { Injectable } from '@angular/core';
import { SuppliersService } from '../../api';

@Injectable({
  providedIn: 'root'
})
export class SuppliersWrapperService {

  async getAllSuppliers() {
    const suppliers = await SuppliersService.getAllSuppliers();
    return suppliers;
  }

  async getSupplierById(id: number) {
    const supplier = await SuppliersService.getSupplierById(id);
    return supplier;
  }

  async createSupplier(supplier: any) {
    const createdSupplier = await SuppliersService.createSupplier(supplier);
    console.log("Created supplier:", createdSupplier);
    return createdSupplier;
  }

  async updateSupplier(id: number, supplier: any) {
    const updatedSupplier = await SuppliersService.updateSupplierById(id, supplier);
    console.log("Updated supplier:", updatedSupplier);
    return updatedSupplier;
  }

  /**
     * @param supplierId Die eindeutige ID des Lieferanten, für welchen die Kundennummern abgerufen werden sollen.
     * @returns CustomerIdResponseDTO Liste der Kundennummern eines Lieferanten.
     * @throws ApiError
     */
  async getCustomersIdBySupplier(supplierId: number) {
    const customerId = await SuppliersService.getCustomerIdsOfOrder(supplierId);
    return customerId;
  }

  async createSupplierCustomerId(supplierId: number, customerId: any) {
    const createdCustomerId = await SuppliersService.createSupplierCustomerId(supplierId, customerId);
    console.log("Created customer ID:", createdCustomerId);
    return createdCustomerId;
  }

  async getSuppliersAddresses() {
    const addresses = await SuppliersService.getSuppliersAddresses();
    return addresses;
  }

  async getSupplierAddress(id: number) {
    const address = await SuppliersService.getSuppliersAddress(id);
    return address;
  }
}
