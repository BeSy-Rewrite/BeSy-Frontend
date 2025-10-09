import { Injectable } from '@angular/core';
import { SupplierRequestDTO, SuppliersService } from '../../api';

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

  async updateSupplier(id: number, supplier: SupplierRequestDTO) {
    const updatedSupplier = await SuppliersService.updateSupplierById(id, supplier);
    console.log("Updated supplier:", updatedSupplier);
    return updatedSupplier;
  }

  /**
     * @param supplierId The unique ID of the supplier for which to retrieve customer IDs.
     * @returns CustomerIdResponseDTO List of customer IDs for a supplier.
     * @throws ApiError
     */
  async getCustomersIdsBySupplierId(supplierId: number) {
    const customerIds = await SuppliersService.getCustomerIdsOfOrder(supplierId);
    return customerIds;
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
