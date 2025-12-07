import { lastValueFrom } from 'rxjs';
import { VatsService, VatResponseDTO} from '../../api-services-v2';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})

export class VatWrapperService {
  constructor(private readonly vatsService: VatsService) { }

  private cachedVats: VatResponseDTO[] | null = null;
  private cacheTimestamp: number | null = null;
  private readonly CACHE_DURATION_MS = 60 * 1000 * 60; // 1 hour
  async getAllVats() {
    const now = Date.now();

    // If cache is valid, return cached data
    if (this.cachedVats && this.cacheTimestamp && now - this.cacheTimestamp < this.CACHE_DURATION_MS) {
      return this.cachedVats;
    }

    // Fetch fresh data and update cache
    this.cachedVats = await lastValueFrom(this.vatsService.getAllVats());
    this.cacheTimestamp = now;
    return this.cachedVats;
  }
}
