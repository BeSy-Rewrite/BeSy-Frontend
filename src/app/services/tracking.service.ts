import { HttpClient, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { EMPTY, interval, map, of, startWith, Subscription, switchMap, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { UserPreferencesResponseDTO } from '../api-services-v2';
import { UsersWrapperService } from './wrapper-services/users-wrapper.service';


export const trackingInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  return next(req).pipe(
    tap({
      next: () => TrackingService.requests++,
      error: () => TrackingService.errors++,
    })
  );
};


export type TrackingData = {
  year: number;
  requests: number;
  errors: number;
  totalTime: number;
};

export type TrackingSettings = {
  disableTracking: boolean;
};

const TRACKING_DATA_PREFERENCE_KEY = 'TRACKING_DATA';
const TRACKING_SETTINGS_PREFERENCE_TYPE = 'TRACKING_SETTINGS';


@Injectable({
  providedIn: 'root',
})
export class TrackingService implements OnDestroy {
  public static requests: number = 0;
  public static errors: number = 0;
  private readonly trackingInterval: Subscription;
  private userTrackingPreferences: UserPreferencesResponseDTO | undefined;

  constructor(private readonly http: HttpClient, private readonly userService: UsersWrapperService) {
    this.trackingInterval = this.initializeTracking().subscribe();
  }

  // Retrieve tracking data from user preferences
  getTrackingData() {
    return this.userService.getCurrentUserPreferences().pipe( // Add TRACKING_PREFERENCE_TYPE when api supports multiple preference types
      map(preferences => {
        return preferences?.map(entry => entry?.preferences as TrackingData).filter(data => data?.year !== undefined) ?? [];
      })
    );
  }

  setTrackingSettings(settings: TrackingSettings) {
    return this.getTrackingSettings().pipe(
      switchMap(() => {
        if (this.userTrackingPreferences) {
          return this.userService.updateCurrentUserPreferenceById(
            this.userTrackingPreferences.id,
            { preference_type: TRACKING_SETTINGS_PREFERENCE_TYPE, preferences: settings }
          );
        }
        //return this.userService.addCurrentUserPreference({ preference_type: TRACKING_SETTINGS_PREFERENCE_TYPE, preferences: settings });
        return of({} as UserPreferencesResponseDTO); // Placeholder until multiple preference types are supported
      })
    );
  }

  // Reset tracking data counters
  resetTrackingData() {
    TrackingService.requests = 0;
    TrackingService.errors = 0;
  }

  // Clean up the interval subscription on service destruction
  ngOnDestroy() {
    this.trackingInterval.unsubscribe();
  }

  // Retrieve tracking settings from user preferences
  getTrackingSettings() {
    if (this.userTrackingPreferences) {
      return of(this.userTrackingPreferences.preferences as TrackingSettings);
    }
    return this.userService.getCurrentUserPreferences().pipe( // Add TRACKING_SETTINGS_PREFERENCE_TYPE when api supports multiple preference types
      map(preferences => {
        //return preferences?.find(entry => entry?.preference_type === TRACKING_SETTINGS_PREFERENCE_TYPE);
        return preferences?.[0]; // Placeholder until multiple preference types are supported
      }),
      switchMap(preference => {
        if (preference == undefined) {
          //return this.userService.addCurrentUserPreference({ preference_type: TRACKING_SETTINGS_PREFERENCE_TYPE, preferences: { disableTracking: false } });
          console.warn('Tracking settings preference not found. Using default settings.'); // Placeholder until multiple preference types are supported
          return of({} as UserPreferencesResponseDTO);
        }
        return of(preference);
      }),
      tap(preference => {
        this.userTrackingPreferences = preference;
      }),
      map(preference => (preference.preferences as TrackingSettings) ?? { disableTracking: false })
    );
  }

  // Check user preferences and start tracking if not disabled
  private initializeTracking() {
    return this.getTrackingSettings().pipe(
      switchMap(settings => {
        if (!settings.disableTracking) {
          return interval(environment.trackingInterval).pipe(startWith(0));
        }
        return EMPTY;
      }),
      switchMap(() => this.storeTrackingData())
    )
  }

  // Store tracking data to user preferences
  private storeTrackingData() {
    // Add TRACKING_PREFERENCE_TYPE when api supports multiple preference types
    return this.userService.getCurrentUserPreferences().pipe(
      switchMap(preferences => {
        const currentYear = new Date().getFullYear();
        const existingDataEntry = (preferences ?? []).find(entry => entry?.preferences['year'] === currentYear)

        const updatedTrackingData: TrackingData = {
          year: currentYear,
          requests: TrackingService.requests,
          errors: TrackingService.errors,
          totalTime: environment.trackingInterval
        };

        if (existingDataEntry?.preferences['year'] === currentYear) {
          updatedTrackingData.requests += existingDataEntry.preferences['requests'] ?? 0;
          updatedTrackingData.errors += existingDataEntry.preferences['errors'] ?? 0;
          updatedTrackingData.totalTime += existingDataEntry.preferences['totalTime'] ?? 0;

          return this.userService.updateCurrentUserPreferenceById(existingDataEntry.id, { preference_type: TRACKING_DATA_PREFERENCE_KEY, preferences: updatedTrackingData });
        }

        //return this.userService.addCurrentUserPreference({ preference_type: TRACKING_PREFERENCE_TYPE, preferences: updatedTrackingData });
        return of({} as UserPreferencesResponseDTO); // Placeholder until multiple preference types are supported
      }),
    );
  }
}
