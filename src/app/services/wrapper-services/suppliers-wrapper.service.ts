import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { SupplierRequestDTO, SupplierResponseDTO, SuppliersService } from '../../api-services-v2';

export interface SupplierFormatted {
  label: string | undefined;
  value: number | undefined;
}

@Injectable({
  providedIn: 'root',
})
export class SuppliersWrapperService {
  private supplierCache: SupplierResponseDTO[] | undefined = undefined;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

  constructor(private readonly suppliersService: SuppliersService) {}

  private isCacheValid(): boolean {
    return (
      this.supplierCache !== undefined && Date.now() - this.cacheTimestamp < this.CACHE_DURATION
    );
  }

  async getAllSuppliers() {
    // Return cached suppliers if cache is still valid
    if (this.isCacheValid()) {
      return this.supplierCache!;
    }

    // Fetch from API and cache the result
    const suppliers = await lastValueFrom(this.suppliersService.getAllSuppliers());
    this.supplierCache = suppliers;
    this.cacheTimestamp = Date.now();
    return suppliers;
  }

  async getSupplierById(id: number) {
    if (!this.isCacheValid()) {
      await this.getAllSuppliers();
    }
    const cachedSupplier = this.supplierCache?.find(supplier => supplier.id === id);
    if (cachedSupplier) {
      return cachedSupplier;
    }
    return lastValueFrom(this.suppliersService.getSupplierById(id));
  }

  async createSupplier(supplier: any) {
    this.supplierCache = undefined; // Invalidate cache
    return lastValueFrom(this.suppliersService.createSupplier(supplier));
  }

  async updateSupplier(id: number, supplier: SupplierRequestDTO) {
    this.supplierCache = undefined; // Invalidate cache
    const updatedSupplier = await lastValueFrom(
      this.suppliersService.updateSupplierById(id, supplier)
    );
    console.log('Updated supplier:', updatedSupplier);
    return updatedSupplier;
  }

  /**
   * @param supplierId The unique ID of the supplier for which to retrieve customer IDs.
   * @returns CustomerIdResponseDTO List of customer IDs for a supplier.
   * @throws ApiError
   */
  async getCustomersIdsBySupplierId(supplierId: number) {
    const customerIds = await lastValueFrom(
      this.suppliersService.getCustomerIdsOfOrder(supplierId)
    );
    return customerIds;
  }

  async createSupplierCustomerId(supplierId: number, customerId: any) {
    return lastValueFrom(this.suppliersService.createSupplierCustomerId(supplierId, customerId));
  }

  async getSupplierAddress(id: number) {
    return lastValueFrom(this.suppliersService.getSupplierAddress(id));
  }

  async getSupplierByIdFormattedForAutocomplete(
    id: number
  ): Promise<SupplierFormatted | undefined> {
    const supplier = await this.getSupplierById(id);
    if (supplier) {
      return {
        label: supplier.name,
        value: supplier.id,
      };
    }
    return undefined;
  }

  async checkIfSupplierExists(name: string): Promise<boolean> {
    if (!this.isCacheValid()) {
      await this.getAllSuppliers();
    }
    return this.supplierCache?.some(supplier => supplier.name === name) || false;
  }
}
