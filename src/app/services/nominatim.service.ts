import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
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
  [key: string]: string | undefined; // fallback für dynamische Keys
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
  private readonly cacheTTL = 10 * 60 * 1000; // 10 minutes in milliseconds

  private lastRequestTime = 0; // Timestamp der letzten Anfrage in ms

  constructor(private readonly http: HttpClient) {}

  // Delay zwischen den Anfragen
  private canSendRequest(): boolean {
    const now = Date.now();
    if (now - this.lastRequestTime >= 1000) {
      this.lastRequestTime = now;
      return true;
    }
    return false;
  }

  /**
   * Throttled search: nur 1 Request pro Sekunde, alles andere wird verworfen.
   */
  throttledSearch(
    query: string,
    params: Record<string, string> = {}
  ): Observable<NominatimMappedAddress[]> {
    if (!this.canSendRequest()) {
      // verworfen → gib ein leeres Observable zurück
      return new Observable<NominatimMappedAddress[]>(observer => {
        observer.complete();
      });
    }

    return new Observable<NominatimMappedAddress[]>(observer => {
      // Prüfe Cache und Gültigkeitsdauer
      const cacheEntry = this.cache.get(query);
      if (cacheEntry && Date.now() - cacheEntry.timestamp < this.cacheTTL) {
        const mappedResults = cacheEntry.results.map((result, index) =>
          this.mapToAddressRequest(result as NominatimResponseDTO, index)
        );
        observer.next(mappedResults);
        observer.complete();
        return;
      }

      // Führe die Suche durch
      this.search(query, params).subscribe({
        next: results => {
          // Cache die Ergebnisse mit Timestamp
          this.cache.set(query, { results, timestamp: Date.now() });
          const mappedResults = results.map((result, index) =>
            this.mapToAddressRequest(result, index)
          );
          observer.next(mappedResults);
          observer.complete();
        },
        error: err => {
          observer.error(err);
        },
      });
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
      ...params,
    };

    return this.http.get<NominatimResponseDTO[]>(url, { headers, params: httpParams });
  }

  // Convert a Nominatim response item into our AddressRequestDTO plus name
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
