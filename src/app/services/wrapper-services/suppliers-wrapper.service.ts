import { Injectable } from '@angular/core';
import { lastValueFrom, map, Observable, of, tap } from 'rxjs';
import {
  CustomerIdRequestDTO,
  SupplierRequestDTO,
  SupplierResponseDTO,
  SuppliersService,
} from '../../api-services-v2';
import { AutocompleteOption } from '../../form-config-patching/autocomplete-option';
import { formatSupplier } from '../../utils/formatting';

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
  getAllSuppliers(): Observable<SupplierResponseDTO[]> {
    // Return cached suppliers if cache is still valid
    if (this.isCacheValid()) {
      return of(this.supplierCache!);
    }

    // Fetch from API and cache the result
    return this.suppliersService.getAllSuppliers().pipe(
      tap(suppliers => {
        this.supplierCache = suppliers;
        this.cacheTimestamp = Date.now();
      })
    );
  }

  /**
   * Retrieves a supplier by its unique ID, checking the cache first before making an API call.
   * @param id The unique ID of the supplier to retrieve.
   * @returns A promise that resolves to the supplier data.
   */
  getSupplierById(id: number) {
    // Check cache first
    if (this.isCacheValid()) {
      const cachedSupplier = this.supplierCache?.find(supplier => supplier.id === id);
      if (cachedSupplier) {
        return of(cachedSupplier);
      }
    }
    return this.suppliersService.getSupplierById(id);
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
      this.cacheTimestamp = 0; // Reset cache timestamp
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
      this.cacheTimestamp = 0; // Reset cache timestamp
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
  async getCustomerIdsBySupplierId(supplierId: number) {
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

  getAllSuppliersFormattedForAutocomplete(): Observable<AutocompleteOption<SupplierResponseDTO>[]> {
    return this.getAllSuppliers().pipe(
      map(suppliers =>
        suppliers.map(supplier => ({
          label: formatSupplier(supplier),
          value: supplier,
        }))
      )
    );
  }

  /**
   * Retrieves a supplier formatted for autocomplete by its unique ID.
   * @param id The unique ID of the supplier to retrieve.
   * @returns A promise that resolves to the supplier formatted for autocomplete.
   */
  async getSupplierByIdFormattedForAutocomplete(
    id: number
  ): Promise<SupplierFormatted | undefined> {
    const supplier = await lastValueFrom(this.getSupplierById(id));
    if (supplier) {
      return {
        label: formatSupplier(supplier),
        value: supplier.id,
      };
    }
    return undefined;
  }

  /**
   * Checks if a supplier with the given name exists.
   * @param name The name of the supplier to check.
   * @returns An observable that emits a boolean indicating if the supplier exists.
   */
  checkIfSupplierExists(name: string): Observable<boolean> {
    return this.getAllSuppliers().pipe(
      map(suppliers =>
        suppliers.some(supplier => supplier.name?.toLowerCase() === name.toLowerCase())
      )
    );
  }
}
