import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import { environment } from '../../environments/environment';
import { AddressRequestDTO } from '../api-services-v2';

export interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
}

export interface NominatimAddress {
  house_number?: string;
  road?: string;
  town?: string;
  postcode?: string;
  county?: string;
  country?: string;
  [key: string]: string | undefined; // fallback for dynamic keys
}

export interface NominatimResponseDTO {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  category: string;
  type: string;
  place_rank: number;
  importance: number;
  addresstype?: string;
  name?: string;
  display_name: string;
  address: NominatimAddress;
  boundingbox: [string, string, string, string];
}

// Mapped Nominatim result for our forms: structured address plus optional name
export interface NominatimMappedAddress extends AddressRequestDTO {
  id: number;
  name?: string;
}

@Injectable({
  providedIn: 'root',
})
export class NominatimService {
  private readonly apiUrl = environment.nominatimUrl;
  private readonly cache = new Map<string, { results: NominatimResult[]; timestamp: number }>();
  private readonly cacheTTL = 10 * 60 * 1000; // Cache invalidation time: 10 minutes

  private lastRequestTime = 0; // Timestamp of the last request
  private readonly requestQueue: Array<{
    query: string;
    params: Record<string, string>;
    observers: Observer<NominatimMappedAddress[]>[];
  }> = [];
  private isProcessingQueue = false;

  constructor(private readonly http: HttpClient) {}

  /**
   * Queued search: requests are queued and processed with 1-second intervals.
   * Results are cached to avoid duplicate requests.
   */
  throttledSearch(
    query: string,
    params: Record<string, string> = {}
  ): Observable<NominatimMappedAddress[]> {
    return new Observable<NominatimMappedAddress[]>(observer => {
      // Check cache first
      const cacheEntry = this.cache.get(query);
      if (cacheEntry && Date.now() - cacheEntry.timestamp < this.cacheTTL) {
        const mappedResults = cacheEntry.results.map((result, index) =>
          this.mapToAddressRequest(result as NominatimResponseDTO, index)
        );
        observer.next(mappedResults);
        observer.complete();
        return;
      }

      // Check if request is already in queue
      const existingQueueItem = this.requestQueue.find(item => item.query === query);
      if (existingQueueItem) {
        // Add observer to existing queue item's observers array
        existingQueueItem.observers.push(observer);
        return;
      }

      // Add to queue with observers array
      this.requestQueue.push({
        query,
        params,
        observers: [observer],
      });

      // Start processing queue if not already processing
      if (!this.isProcessingQueue) {
        this.processQueue();
      }
    });
  }

  private processQueue(): void {
    if (this.requestQueue.length === 0) {
      this.isProcessingQueue = false;
      return;
    }

    this.isProcessingQueue = true;
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    // If enough time has passed, process next request immediately
    if (timeSinceLastRequest >= 1000) {
      this.processNextRequest();
    } else {
      // Wait for remaining time, then process
      const waitTime = 1000 - timeSinceLastRequest;
      setTimeout(() => {
        this.processNextRequest();
      }, waitTime);
    }
  }

  private processNextRequest(): void {
    if (this.requestQueue.length === 0) {
      this.isProcessingQueue = false;
      return;
    }

    const request = this.requestQueue.shift()!;
    this.lastRequestTime = Date.now();

    // Check cache again (might have been cached while in queue)
    const cacheEntry = this.cache.get(request.query);
    if (cacheEntry && Date.now() - cacheEntry.timestamp < this.cacheTTL) {
      const mappedResults = cacheEntry.results.map((result, index) =>
        this.mapToAddressRequest(result as NominatimResponseDTO, index)
      );

      // Notify all observers
      for (const observer of request.observers) {
        observer.next(mappedResults);
        observer.complete();
      }

      // Continue processing queue
      setTimeout(() => this.processQueue(), 1000);
      return;
    }

    // Perform actual search
    this.search(request.query, request.params).subscribe({
      next: results => {
        // Cache the results
        this.cache.set(request.query, { results, timestamp: Date.now() });
        const mappedResults = results.map((result, index) =>
          this.mapToAddressRequest(result, index)
        );

        // Notify all observers
        for (const observer of request.observers) {
          observer.next(mappedResults);
          observer.complete();
        }

        // Continue processing queue after delay
        setTimeout(() => this.processQueue(), 1000);
      },
      error: err => {
        // Notify all observers of error
        for (const observer of request.observers) {
          observer.error(err);
        }

        // Continue processing queue even on error
        setTimeout(() => this.processQueue(), 1000);
      },
    });
  }

  private search(
    query: string,
    params: Record<string, string> = {}
  ): Observable<NominatimResponseDTO[]> {
    const url = `${this.apiUrl}`;
    const headers = new HttpHeaders({
      'User-Agent': 'Besy/1.0',
      'Accept-Language': 'de',
    });

    const httpParams = {
      q: query,
      format: 'json',
      addressdetails: '1',
      limit: '5',
      countrycodes: 'de, at,ch,lu,li, be, nl, uk, fr, us',
      ...params,
    };

    return this.http.get<NominatimResponseDTO[]>(url, { headers, params: httpParams });
  }

  /**
   * Maps a Nominatim response to our AddressRequestDTO format.
   * @param result The Nominatim response object.
   * @param id An identifier for the mapped address.
   * @returns A NominatimMappedAddress object.
   */
  mapToAddressRequest(result: NominatimResponseDTO, id: number): NominatimMappedAddress {
    const addr = result.address || {};

    const street = addr.road || addr['pedestrian'] || addr['footway'] || addr['cycleway'] || '';
    const town =
      addr.town ||
      addr['city'] ||
      addr['village'] ||
      addr['hamlet'] ||
      addr['municipality'] ||
      addr['suburb'] ||
      addr.county ||
      '';
    const county = addr.county || addr['state_district'] || addr['state'] || addr['region'];

    return {
      id,
      name: result.name,
      building_number: addr.house_number,
      street,
      postal_code: addr.postcode,
      country: addr.country,
      county,
      town, // required in DTO, fallbacks above ensure a string
    };
  }
}
