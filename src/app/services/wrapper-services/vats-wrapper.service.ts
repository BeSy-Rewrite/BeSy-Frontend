import { Injectable } from '@angular/core';
import { VatResponseDTO, VatSService } from '../../api';

@Injectable({
  providedIn: 'root',
})

export class VatWrapperService {

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
    this.cachedVats = await VatSService.getAllVats();
    this.cacheTimestamp = now;
    return this.cachedVats;
  }
}
