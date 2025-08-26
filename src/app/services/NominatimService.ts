import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { NominatimResponseDTO } from '../api/models/response-dtos/NominatimResponseDTO';
import { Observable } from 'rxjs';


export interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
}

@Injectable({
  providedIn: 'root'
})
export class AddressAutocompleteServiceService {
  private apiUrl = environment.nominatimUrl;
  private cache = new Map<string, NominatimResult[]>();

  private lastRequestTime = 0; // Timestamp der letzten Anfrage in ms

  constructor(private http: HttpClient) {}

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
  throttledSearch(query: string, params: Record<string, string> = {}): Observable<NominatimResponseDTO[]> {
    if (!this.canSendRequest()) {
      // verworfen → gib ein leeres Observable zurück
      return new Observable<NominatimResponseDTO[]>(observer => {
        observer.complete();
      });
    }

    return this.search(query, params);
  }

  private search(query: string, params: Record<string, string> = {}): Observable<NominatimResponseDTO[]> {
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
}

