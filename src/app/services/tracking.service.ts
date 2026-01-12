import { HttpClient, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject, Injectable, OnDestroy } from '@angular/core';
import { interval, startWith, Subscription, tap } from 'rxjs';
import { environment } from '../../environments/environment';


export const trackingInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const trackingService = inject(TrackingService);
  return next(req).pipe(
    tap({
      next: () => trackingService.trackRequest(),
      error: () => trackingService.trackError(),
    })
  );
};


@Injectable({
  providedIn: 'root',
})
export class TrackingService implements OnDestroy {
  private requests: number = 0;
  private errors: number = 0;
  private trackingInterval!: Subscription;

  constructor(private readonly http: HttpClient) {
    this.startTracking();
    console.log("Tracking service initialized");
  }

  private startTracking() {
    this.trackingInterval = interval(environment.trackingInterval).pipe(
      startWith(0)
    ).subscribe(() => {
      this.storeTrackingData();
    });
  }

  public trackRequest() {
    this.requests++;
  }

  public trackError() {
    this.errors++;
  }

  private storeTrackingData() {
    const data = {
      preference_type: 'TRACKING',
      preferences: {
        requests: this.requests,
        errors: this.errors,
      }
    };

    // Replace with your actual API endpoint
    //this.http.post(`${environment.apiUrl}/users/me/preferences`, data).subscribe();
    console.log('Tracking data sent:', data);

    this.resetTrackingData();
  }

  resetTrackingData() {
    this.requests = 0;
    this.errors = 0;
  }

  ngOnDestroy() {
    this.trackingInterval.unsubscribe();
  }
}
