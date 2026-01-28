import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import {
  BehaviorSubject,
  debounceTime,
  EMPTY,
  interval,
  map,
  Observable,
  of,
  skipWhile,
  startWith,
  Subject,
  Subscription,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { environment } from '../../environments/environment';
import { UserPreferencesResponseDTO } from '../api-services-v2';
import { AuthenticationService } from './authentication.service';
import { UsersWrapperService } from './wrapper-services/users-wrapper.service';

export const trackingInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
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
  private trackingInterval: Subscription;
  private userTrackingPreferences = new BehaviorSubject<UserPreferencesResponseDTO | undefined>(
    undefined
  );

  private currentYearTrackingDataEntryId: number | undefined;
  private currentYearTrackingData: TrackingData | undefined;

  private readonly trackingSettingsDebouncer = new Subject<TrackingSettings>();

  constructor(
    private readonly authService: AuthenticationService,
    private readonly userService: UsersWrapperService
  ) {
    this.trackingInterval = this.initializeTracking().subscribe();

    this.trackingSettingsDebouncer
      .asObservable()
      .pipe(
        debounceTime(300),
        switchMap(settings => {
          console.log('Applying tracking settings:', settings);
          if (this.userTrackingPreferences.value?.id) {
            return this.userService.updateCurrentUserPreferenceById(
              this.userTrackingPreferences.value.id,
              {
                preference_type: TRACKING_SETTINGS_PREFERENCE_TYPE,
                preferences: settings,
              }
            );
          }
          return this.userService.addCurrentUserPreference({
            preference_type: TRACKING_SETTINGS_PREFERENCE_TYPE,
            preferences: settings,
          });
        })
      )
      .subscribe(preference => {
        this.userTrackingPreferences.next(preference);

        if (preference.preferences['disableTracking']) {
          this.trackingInterval.unsubscribe();
          this.resetTrackingData();
        } else if (this.trackingInterval.closed) {
          this.trackingInterval = this.initializeTracking().subscribe();
        }
      });
  }

  // Retrieve tracking data from user preferences
  getTrackingData() {
    return this.userService.getCurrentUserPreferences(TRACKING_DATA_PREFERENCE_KEY).pipe(
      map(preferences => {
        return (
          preferences
            ?.map(entry => entry?.preferences as TrackingData)
            .filter(data => data?.year !== undefined) ?? []
        );
      })
    );
  }

  setTrackingSettings(settings: TrackingSettings): Observable<UserPreferencesResponseDTO> {
    this.trackingSettingsDebouncer.next(settings);
    console.log('Updating tracking settings:', settings);

    return this.userTrackingPreferences.asObservable().pipe(
      skipWhile(preference => preference === undefined),
      map(preference => preference as UserPreferencesResponseDTO),
      take(1)
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

  /**
   * Retrieves the tracking settings from user preferences.
   * Skips until the user is authenticated.
   * @returns An observable emitting the user's tracking settings
   */
  getTrackingSettings() {
    if (this.userTrackingPreferences.value?.id) {
      return of(this.userTrackingPreferences.value.preferences as TrackingSettings);
    }
    return this.authService.authStateChanged.pipe(
      startWith(0),
      skipWhile(() => !this.authService.hasValidToken()),
      switchMap(() => this.fetchTrackingSettings())
    );
  }

  /**
   * Fetches the tracking settings from user preferences.
   * @returns An observable emitting the user's tracking settings
   */
  private fetchTrackingSettings() {
    return this.userService.getCurrentUserPreferences(TRACKING_SETTINGS_PREFERENCE_TYPE).pipe(
      map(preferences => {
        return preferences?.find(
          entry => entry?.preference_type === TRACKING_SETTINGS_PREFERENCE_TYPE
        );
      }),
      switchMap(preference => {
        if (preference == undefined) {
          return this.setTrackingSettings({ disableTracking: false });
        }
        return of(preference);
      }),
      tap(preference => {
        this.userTrackingPreferences.next(preference);
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
    );
  }

  // Store tracking data to user preferences
  private storeTrackingData() {
    let trackingDataEntry;
    if (this.currentYearTrackingData && this.currentYearTrackingDataEntryId) {
      trackingDataEntry = of({
        id: this.currentYearTrackingDataEntryId,
        preference_type: TRACKING_DATA_PREFERENCE_KEY,
        preferences: this.currentYearTrackingData,
      } as UserPreferencesResponseDTO);
    } else {
      trackingDataEntry = this.userService
        .getCurrentUserPreferences(TRACKING_DATA_PREFERENCE_KEY)
        .pipe(
          map(preferences =>
            (preferences ?? []).find(
              entry => entry?.preferences['year'] === new Date().getFullYear()
            )
          ),
          tap(entry => {
            if (entry) {
              this.currentYearTrackingDataEntryId = entry.id;
              this.currentYearTrackingData = entry.preferences as TrackingData;
            }
          })
        );
    }

    return trackingDataEntry.pipe(
      switchMap(existingDataEntry => {
        const updatedTrackingData: TrackingData = {
          year: new Date().getFullYear(),
          requests: TrackingService.requests,
          errors: TrackingService.errors,
          totalTime: environment.trackingInterval,
        };

        if (existingDataEntry?.id) {
          updatedTrackingData.requests += existingDataEntry.preferences['requests'] ?? 0;
          updatedTrackingData.errors += existingDataEntry.preferences['errors'] ?? 0;
          updatedTrackingData.totalTime += existingDataEntry.preferences['totalTime'] ?? 0;

          return this.userService.updateCurrentUserPreferenceById(existingDataEntry.id, {
            preference_type: TRACKING_DATA_PREFERENCE_KEY,
            preferences: updatedTrackingData,
          });
        }

        return this.userService.addCurrentUserPreference({
          preference_type: TRACKING_DATA_PREFERENCE_KEY,
          preferences: updatedTrackingData,
        });
      }),
      tap(savedEntry => {
        this.currentYearTrackingDataEntryId = savedEntry.id;
        this.currentYearTrackingData = savedEntry.preferences as TrackingData;
        this.resetTrackingData();
      })
    );
  }
}
