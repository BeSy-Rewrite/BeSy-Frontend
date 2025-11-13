import { Injectable } from '@angular/core';
import { SupplierRequestDTO, SuppliersService } from '../../api-services-v2';
import { lastValueFrom } from 'rxjs';

export interface SupplierFormatted {
  label: string | undefined;
  value: number | undefined;
}

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

  async updateSupplier(id: number, supplier: SupplierRequestDTO) {
    const updatedSupplier = await lastValueFrom(this.suppliersService.updateSupplierById(id, supplier));
    console.log("Updated supplier:", updatedSupplier);
    return updatedSupplier;
  }

  /**
     * @param supplierId The unique ID of the supplier for which to retrieve customer IDs.
     * @returns CustomerIdResponseDTO List of customer IDs for a supplier.
     * @throws ApiError
     */
  async getCustomersIdsBySupplierId(supplierId: number) {
    const customerIds = await lastValueFrom(this.suppliersService.getCustomerIdsOfOrder(supplierId));
    return customerIds;
  }

  async createSupplierCustomerId(supplierId: number, customerId: any) {
    return lastValueFrom(this.suppliersService.createSupplierCustomerId(supplierId, customerId));
  }

  async getSupplierAddress(id: number) {
    return lastValueFrom(this.suppliersService.getSupplierAddress(id));
  }

  async getSupplierByIdFormattedForAutocomplete(id: number): Promise<SupplierFormatted | undefined> {
    const supplier = await this.getSupplierById(id);
    if (supplier) {
      return {
        label: supplier.name,
        value: supplier.id
      };
    }
    return undefined;
  }
}
