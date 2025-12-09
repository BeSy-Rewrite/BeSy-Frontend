import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import {
  CustomerIdRequestDTO,
  SupplierRequestDTO,
  SupplierResponseDTO,
  SuppliersService,
} from '../../api-services-v2';

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

  /**
   * Retrieves all suppliers, using cached data if available and valid.
   * @returns A promise that resolves to an array of all suppliers.
   */
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

  /**
   * Retrieves a supplier by its unique ID, checking the cache first before making an API call.
   * @param id The unique ID of the supplier to retrieve.
   * @returns A promise that resolves to the supplier data.
   */
  async getSupplierById(id: number) {
    // Check cache first
    if (this.isCacheValid()) {
      const cachedSupplier = this.supplierCache?.find(supplier => supplier.id === id);
      if (cachedSupplier) {
        return cachedSupplier;
      }
    }
    return lastValueFrom(this.suppliersService.getSupplierById(id));
  }

  /**
   * Creates a new supplier.
   * @param supplier The supplier data to create.
   * @returns A promise that resolves to the created supplier data.
   */
  async createSupplier(supplier: SupplierRequestDTO) {
    try {
      const response = await lastValueFrom(this.suppliersService.createSupplier(supplier));
      this.supplierCache = undefined; // Invalidate cache
      return response;
    } catch (error) {
      console.error('Error creating supplier:', supplier?.name ?? '[unknown name]', error);
      throw error;
    }
  }

  /**
   * Updates an existing supplier by its unique ID.
   * @param id The unique ID of the supplier to update.
   * @param supplier The updated supplier data.
   * @returns A promise that resolves to the updated supplier data.
   */
  async updateSupplier(id: number, supplier: SupplierRequestDTO) {
    try {
      const updatedSupplier = await lastValueFrom(
        this.suppliersService.updateSupplierById(id, supplier)
      );
      this.supplierCache = undefined; // Invalidate cache
      return updatedSupplier;
    } catch (error) {
      console.error('Error updating supplier with ID', id, ':', error);
      throw error;
    }
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

  /**
   * Creates a new customer ID for a given supplier.
   * @param supplierId The unique ID of the supplier for which to create a customer ID.
   * @param customerId The customer ID data to create.
   * @returns A promise that resolves to the created customer ID data.
   */
  async createSupplierCustomerId(supplierId: number, customerId: CustomerIdRequestDTO) {
    return lastValueFrom(this.suppliersService.createSupplierCustomerId(supplierId, customerId));
  }

  /**
   * Retrieves the address of a supplier by its unique ID.
   * @param id The unique ID of the supplier whose address is to be retrieved.
   * @returns A promise that resolves to the supplier's address data.
   */
  async getSupplierAddress(id: number) {
    return lastValueFrom(this.suppliersService.getSupplierAddress(id));
  }

  /**
   * Retrieves a supplier formatted for autocomplete by its unique ID.
   * @param id The unique ID of the supplier to retrieve.
   * @returns A promise that resolves to the supplier formatted for autocomplete.
   */
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

  /**
   * Checks if a supplier with the given name exists.
   * @param name The name of the supplier to check.
   * @returns A promise that resolves to a boolean indicating if the supplier exists.
   */
  async checkIfSupplierExists(name: string): Promise<boolean> {
    if (!this.isCacheValid()) {
      await this.getAllSuppliers();
    }
    return this.supplierCache?.some(supplier => supplier.name === name) || false;
  }
}
