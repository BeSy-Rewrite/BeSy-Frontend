import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, forkJoin, map, mergeMap, Observable, of } from 'rxjs';
import { UserPreferencesResponseDTO } from '../api-services-v2';
import {
  CURRENT_USER_PLACEHOLDER,
  ORDERS_FILTER_PRESETS,
} from '../configs/orders-table/order-filter-presets-config';
import { FilterDateRange } from '../models/filter/filter-date-range';
import { FilterPresetType, OrdersFilterPreset } from '../models/filter/filter-presets';
import { UsersWrapperService } from './wrapper-services/users-wrapper.service';

@Injectable({
  providedIn: 'root',
})
export class UserPreferencesService {
  constructor(
    private readonly usersWrapper: UsersWrapperService,
    private readonly _snackBar: MatSnackBar
  ) {}

  /**
   * Executes an action for the current user by retrieving their user ID first.
   * @param action A function that takes a user ID and returns an Observable of type T.
   * @returns An Observable of type T resulting from the action executed with the current user's ID.
   */
  private executeForCurrentUser<T>(action: (userId: number) => Observable<T>): Observable<T> {
    return this.usersWrapper.getCurrentUser().pipe(
      mergeMap(user => {
        return action(Number.parseInt(user.id!));
      })
    );
  }

  /**
   * Retrieves the preferences of the current user.
   * @returns An Observable of UserPreferencesResponseDTO containing the user's preferences.
   */
  getPreferences(): Observable<UserPreferencesResponseDTO> {
    return this.executeForCurrentUser(userId => this.usersWrapper.getUserPreferences(userId));
  }

  /**
   * Adds preferences for the current user.
   * @param preferences The preferences to add.
   * @returns An Observable of UserPreferencesResponseDTO containing the updated preferences.
   */
  addPreferences(preferences: UserPreferencesResponseDTO): Observable<UserPreferencesResponseDTO> {
    return this.executeForCurrentUser(userId =>
      this.usersWrapper.addUserPreferences(userId, preferences)
    ).pipe(
      catchError(error => {
        console.error('Error adding user preferences:', error);
        this._snackBar.open(
          'Fehler beim Hinzufügen der Präferenzen: ' + error.message,
          'Schließen',
          { duration: 5000 }
        );
        return of({
          order_filter_preferences: [],
        });
      })
    );
  }

  /**
   * Deletes preferences for the current user.
   * @param preferences The preferences to delete.
   * @returns An Observable of UserPreferencesResponseDTO containing the updated preferences.
   */
  deletePreferences(
    preferences: UserPreferencesResponseDTO
  ): Observable<UserPreferencesResponseDTO> {
    return this.executeForCurrentUser(userId =>
      this.usersWrapper.deleteFromUserPreferences(userId, preferences)
    ).pipe(
      catchError(error => {
        console.error('Error deleting user preferences:', error);
        this._snackBar.open('Fehler beim Löschen der Präferenzen: ' + error.message, 'Schließen', {
          duration: 5000,
        });
        return of({
          order_filter_preferences: [],
        });
      })
    );
  }

  /**
   * Combines default and saved filter presets for the current user.
   * @param preferences An Observable of UserPreferencesResponseDTO containing the user's preferences.
   * @returns An Observable of an array of OrdersFilterPreset.
   */
  private getFullPresetList(
    preferences: Observable<UserPreferencesResponseDTO>
  ): Observable<OrdersFilterPreset[]> {
    return forkJoin({
      preferences,
      defaultPresets: this.resolveCurrentUserInPresets(ORDERS_FILTER_PRESETS),
    }).pipe(
      map(({ preferences, defaultPresets }) => {
        const savedPresets = preferences.order_filter_preferences.map(preset =>
          this.parseAndCheckPreset(preset)
        );
        return [...defaultPresets, ...savedPresets];
      })
    );
  }

  /**
   * Retrieves the order filter presets for the current user, combining default and saved presets.
   * @returns An Observable of an array of OrdersFilterPreset.
   */
  getPresets(): Observable<OrdersFilterPreset[]> {
    return this.getFullPresetList(this.getPreferences()).pipe(
      catchError(error => {
        console.error('Error loading filter presets:', error);
        this._snackBar.open('Fehler beim Laden der Filtervorgaben: ' + error.message, 'Schließen', {
          duration: 5000,
        });
        return this.getValidDefaultPresets();
      })
    );
  }

  /**
   * Retrieves custom order filter presets saved by the current user.
   * @returns An Observable of an array of OrdersFilterPreset.
   */
  getCustomPresets(): Observable<OrdersFilterPreset[]> {
    return this.getPreferences().pipe(
      map(preferences =>
        preferences.order_filter_preferences.map(preset => this.parseAndCheckPreset(preset))
      )
    );
  }

  /**
   * Saves a new filter preset for the current user.
   * @param preset The OrdersFilterPreset to save.
   * @returns An Observable of an array of OrdersFilterPreset including the newly saved preset.
   */
  savePreset(preset: OrdersFilterPreset) {
    return this.getFullPresetList(
      this.addPreferences({
        order_filter_preferences: [JSON.stringify(preset)],
      })
    ).pipe(
      catchError(error => {
        console.error('Error saving filter preset:', error);
        this._snackBar.open(
          'Fehler beim Speichern der Filtervorgabe: ' + error.message,
          'Schließen',
          { duration: 5000 }
        );
        return this.getValidDefaultPresets();
      })
    );
  }

  /**
   * Updates an existing preset identified by its label.
   * @param oldLabel The label of the preset to update.
   * @param updatedPreset The updated OrdersFilterPreset.
   * @returns An Observable of an array of OrdersFilterPreset.
   */
  updatePresetByLabel(
    oldLabel: string,
    updatedPreset: OrdersFilterPreset,
    createIfNotExists: boolean = false
  ) {
    return this.getCustomPresets().pipe(
      mergeMap(customPresets => {
        const presetToUpdate = customPresets.find(preset => preset.label === oldLabel);
        if (!presetToUpdate) {
          if (createIfNotExists) {
            return this.savePreset(updatedPreset);
          } else {
            throw new Error(`Preset with label "${oldLabel}" not found.`);
          }
        }
        return this.deletePreset(presetToUpdate).pipe(
          mergeMap(() => this.savePreset(updatedPreset))
        );
      })
    );
  }

  /**
   * Deletes a specific filter preset for the current user.
   * @param preset The OrdersFilterPreset to delete.
   * @returns An Observable of an array of OrdersFilterPreset.
   */
  deletePreset(preset: OrdersFilterPreset) {
    return this.getFullPresetList(
      this.deletePreferences({
        order_filter_preferences: [JSON.stringify(preset)],
      })
    ).pipe(
      catchError(error => {
        console.error('Error deleting filter preset:', error);
        this._snackBar.open(
          'Fehler beim Löschen der Filtervorgabe: ' + error.message,
          'Schließen',
          { duration: 5000 }
        );
        return this.getValidDefaultPresets();
      })
    );
  }

  /**
   * Retrieves valid default filter presets for the current user.
   * @returns An Observable of an array of OrdersFilterPreset.
   */
  getValidDefaultPresets(): Observable<OrdersFilterPreset[]> {
    return this.usersWrapper
      .getCurrentUser()
      .pipe(
        mergeMap(user =>
          user?.id == undefined
            ? of(this.removeCurrentUserPresets(ORDERS_FILTER_PRESETS))
            : this.resolveCurrentUserInPresets(ORDERS_FILTER_PRESETS)
        )
      );
  }

  /**
   * Parses a preset string or object and ensures date ranges are properly formatted.
   * @param presetString The preset as a JSON string or OrdersFilterPreset object.
   * @returns The parsed and checked OrdersFilterPreset.
   */
  parseAndCheckPreset(presetString: string | OrdersFilterPreset): OrdersFilterPreset {
    let preset: OrdersFilterPreset;
    if (typeof presetString === 'string') {
      preset = JSON.parse(presetString);
    } else {
      preset = presetString;
    }
    for (const filter of preset.appliedFilters) {
      if ('dateRange' in filter) {
        filter.dateRange = this.fixDateRange(filter.dateRange);
      }
    }
    return preset;
  }

  /**
   * Fixes date range by converting string dates to Date objects.
   * @param date The date range to fix.
   * @returns The fixed date range with Date objects.
   */
  private fixDateRange(date: FilterDateRange): FilterDateRange {
    return {
      start: typeof date.start === 'string' ? new Date(Date.parse(date.start)) : date.start,
      end: typeof date.end === 'string' ? new Date(Date.parse(date.end)) : date.end,
    };
  }

  /**
   * Resolves the current user in the given filter presets.
   * @param filterPresets The array of OrdersFilterPreset to resolve the current user in.
   * @returns An observable of the resolved OrdersFilterPreset array.
   */
  resolveCurrentUserInPresets(
    filterPresets: OrdersFilterPreset[]
  ): Observable<OrdersFilterPreset[]> {
    return this.usersWrapper.getCurrentUser().pipe(
      map(user => {
        if (!user?.id) {
          throw new Error('Current user not found');
        }

        return this.replaceCurrentUserInPresets(filterPresets, user.id);
      })
    );
  }

  /**
   * Replaces occurrences of 'CURRENT_USER' in the filter presets with the actual user ID.
   * @param filterPresets The array of OrdersFilterPreset to process.
   * @param userId The ID of the current user.
   * @returns The modified array of OrdersFilterPreset.
   */
  private replaceCurrentUserInPresets(
    filterPresets: OrdersFilterPreset[],
    userId: string
  ): OrdersFilterPreset[] {
    return filterPresets.map(preset => ({
      ...preset,
      appliedFilters: preset.appliedFilters.map(f =>
        this.replaceCurrentUserInAppliedFilter(f, userId)
      ),
    }));
  }

  /**
   * Replaces CURRENT_USER_PLACEHOLDER in a single applied filter if it is a ChipFilterPreset.
   * @param filter The filter preset to process.
   * @param userId The ID of the current user.
   * @returns The modified filter preset.
   */
  private replaceCurrentUserInAppliedFilter(filter: FilterPresetType, userId: string): any {
    if (!('chipIds' in filter)) {
      return filter;
    }

    return {
      ...filter,
      chipIds: filter.chipIds.map((id: number | string | undefined) =>
        id === CURRENT_USER_PLACEHOLDER ? userId : id
      ),
    };
  }

  removeCurrentUserPresets(presets: OrdersFilterPreset[]): OrdersFilterPreset[] {
    const filteredPresets = presets.filter(
      preset =>
        !preset.appliedFilters.some(filter => {
          if ('chipIds' in filter) {
            return filter.chipIds?.includes(CURRENT_USER_PLACEHOLDER);
          }
          return false;
        })
    );
    console.warn(`Removed ${CURRENT_USER_PLACEHOLDER} presets due to missing user context.`);
    return filteredPresets;
  }
}
