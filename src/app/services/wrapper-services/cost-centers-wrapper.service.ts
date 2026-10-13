import { inject, Injectable } from '@angular/core';
import { lastValueFrom, map, Observable, of, tap } from 'rxjs';
import {
  CostCenterRequestDTO,
  CostCenterResponseDTO,
  CostCentersService,
} from '../../api-services-v2';
import { AutocompleteOption } from '../../form-config-patching/autocomplete-option';
import { formatCostCenter } from '../../utils/formatting';
import { convertToISODateString } from '../../utils/time-conversion.utils';

export interface CostCenterFormatted {
  label: string;
  value: number;
}

@Injectable({
  providedIn: 'root',
})
export class CostCenterWrapperService {
  private cachedCostCenters: CostCenterResponseDTO[] | null = null;
  private cacheTimestamp: number | null = null;
  private readonly CACHE_DURATION_MS = 60 * 1000; // 1 minute

  private readonly costCentersService = inject(CostCentersService);

  getAllCostCenters(): Observable<CostCenterResponseDTO[]> {
    const now = Date.now();

    // If cache is valid, return cached data
    if (
      this.cachedCostCenters &&
      this.cacheTimestamp &&
      now - this.cacheTimestamp < this.CACHE_DURATION_MS
    ) {
      return of(this.cachedCostCenters);
    }

    // Otherwise, fetch new data
    return this.costCentersService.getCostCenters().pipe(
      // Update cache
      tap(costCenters => {
        this.cachedCostCenters = costCenters;
        this.cacheTimestamp = now;
      })
    );
  }

  getCostCenterById(id: number): Observable<CostCenterResponseDTO> {
    return this.getAllCostCenters().pipe(
      map(costCenters => {
        const costCenter = costCenters.find(costCenter => costCenter.id === id);
        if (!costCenter) {
          throw new Error(`Cost center with id ${id} not found`);
        }
        return costCenter;
      })
    );
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
   * Fetch all cost centers and format them for autocomplete usage.
   * @returns formatted cost centers for autocomplete
   */
  getAllCostCentersFormattedForAutocomplete(): Observable<
    AutocompleteOption<CostCenterResponseDTO>[]
  > {
    return this.getAllCostCenters().pipe(
      map(costCenters =>
        costCenters.map(costCenter => ({
          label: formatCostCenter(costCenter),
          value: costCenter,
        }))
      )
    );
  }

  /**
   * Fetch a cost center by its ID and format it for autocomplete usage.
   * @param id id of the costCenter to be returned
   * @returns formatted cost center or null if not found
   */
  getCostCenterByIdFormattedForAutocomplete(
    id: number
  ): Observable<CostCenterFormatted | undefined> {
    return this.getAllCostCenters().pipe(
      map(costCenters => {
        const costCenter = costCenters.find(cc => cc.id === id);

        if (!costCenter?.id) return undefined;

        return {
          // Concatenate code and name for better identification in the label in format "code (name)"
          label: formatCostCenter(costCenter),
          value: costCenter.id!,
        };
      })
    );
  }
}
