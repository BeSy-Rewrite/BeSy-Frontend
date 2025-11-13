import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { CostCentersService, CostCenterRequestDTO, CostCenterResponseDTO } from '../../api-services-v2';

export interface CostCenterFormatted {
  label: string;
  value: string;
}

@Injectable({
  providedIn: 'root',
})
export class CostCenterWrapperService {
  private cachedCostCenters: CostCenterResponseDTO[] | null = null;
  private cacheTimestamp: number | null = null;
  private readonly CACHE_DURATION_MS = 60 * 1000; // 1 minute

  constructor(private readonly costCentersService: CostCentersService) { }

  async getAllCostCenters(): Promise<CostCenterResponseDTO[]> {
    const now = Date.now();

    // If cache is valid, return cached data
    if (this.cachedCostCenters && this.cacheTimestamp && now - this.cacheTimestamp < this.CACHE_DURATION_MS) {
      return this.cachedCostCenters;
    }

    // Otherwise, fetch new data
    const costCenters = await lastValueFrom(this.costCentersService.getCostCenters());

    // Update cache
    this.cachedCostCenters = costCenters;
    this.cacheTimestamp = now;

    return costCenters;
  }

  async createCostCenter(costCenter: CostCenterRequestDTO): Promise<CostCenterResponseDTO> {
    const createdCostCenter = await lastValueFrom(this.costCentersService.createCostCenter(costCenter));

    // Invalidate cache after creation
    this.cachedCostCenters = null;
    this.cacheTimestamp = null;

    return createdCostCenter;
  }

  /**
   * Fetch a cost center by its ID and format it for autocomplete usage.
   * @param id id of the costCenter to be returned
   * @returns formatted cost center or null if not found
   */
  async getCostCenterByIdFormattedForAutocomplete(id: string): Promise<CostCenterFormatted | undefined> {
    const costCenters = await this.getAllCostCenters();
    const costCenter = costCenters.find((cc) => cc.id === id);
    if (!costCenter) return undefined;

    return {
      label: costCenter.name ?? '',
      value: costCenter.id ?? '',
    };
  }
}

