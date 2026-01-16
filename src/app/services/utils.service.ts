import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import JSConfetti from 'js-confetti';
import { catchError, map, of } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UtilsService {
  private readonly jsConfetti = new JSConfetti();
  private apiVersion: string | undefined = undefined;

  constructor(private readonly http: HttpClient) { }

  getConfettiInstance(): JSConfetti {
    return this.jsConfetti;
  }

  getApiVersion() {
    if (this.apiVersion) {
      return of(this.apiVersion);
    }
    return this.http.get(environment.apiVersionEndpoint).pipe(
      map(version => {
        this.apiVersion = (version as any)?.info?.version as string;
        return this.apiVersion;
      }),
      catchError(() => {
        this.apiVersion = undefined;
        return of(undefined);
      })
    );
  }
}
