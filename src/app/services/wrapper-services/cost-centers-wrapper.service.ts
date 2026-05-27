import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import {
  CostCenterRequestDTO,
  CostCenterResponseDTO,
  CostCentersService,
} from '../../api-services-v2';
import { convertToISODateString } from '../utilities';

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

  constructor(private readonly costCentersService: CostCentersService) {}

  async getAllCostCenters(): Promise<CostCenterResponseDTO[]> {
    const now = Date.now();

    // If cache is valid, return cached data
    if (
      this.cachedCostCenters &&
      this.cacheTimestamp &&
      now - this.cacheTimestamp < this.CACHE_DURATION_MS
    ) {
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
    const formattedCostCenter: CostCenterRequestDTO = {
      ...costCenter,
      // Ensure dates are in ISO format (yyyy-MM-dd)
      begin_date: costCenter.begin_date ? convertToISODateString(costCenter.begin_date) : undefined,
      end_date: costCenter.end_date ? convertToISODateString(costCenter.end_date) : undefined,
    };
    const createdCostCenter = await lastValueFrom(
      this.costCentersService.createCostCenter(formattedCostCenter)
    );

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
  async getCostCenterByIdFormattedForAutocomplete(
    id: string
  ): Promise<CostCenterFormatted | undefined> {
    const costCenters = await this.getAllCostCenters();
    const costCenter = costCenters.find(cc => cc.id === id);
    if (!costCenter) return undefined;

    return {
      // Concatenate code and name for better identification in the label in format "code (name)"
      label: `${costCenter.id ?? ''} (${costCenter.name ?? ''})`,
      value: costCenter.id ?? '',
    };
  }
}
