import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, forkJoin, map, mergeMap, Observable, of, switchMap } from 'rxjs';
import { PreferenceType, UserPreferencesRequestDTO } from '../api-services-v2';
import {
  CURRENT_USER_PLACEHOLDER,
  ORDERS_FILTER_PRESETS
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
  ) { }

  /**
    * Combines default presets (resolved with the current user) and saved presets.
    * @param savedPresets An Observable of saved OrdersFilterPreset array.
    * @returns An Observable of an array of OrdersFilterPreset.
   */
  private getFullPresetList(savedPresets: Observable<OrdersFilterPreset[]>): Observable<OrdersFilterPreset[]> {
    return forkJoin({
      savedPresets,
      defaultPresets: this.resolveCurrentUserInPresets(ORDERS_FILTER_PRESETS),
    }).pipe(
      map(({ savedPresets, defaultPresets }) => {
        return [...defaultPresets, ...savedPresets];
      })
    );
  }

  /**
    * Retrieves order filter presets for the current user by combining default and saved presets.
    * Falls back to valid default presets on error.
    * @returns An Observable of an array of OrdersFilterPreset.
   */
  getPresets(): Observable<OrdersFilterPreset[]> {
    return this.getFullPresetList(this.getSavedPresets()).pipe(
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
    * Retrieves order filter presets saved by the current user.
    * @returns An Observable of an array of OrdersFilterPreset.
   */
  getSavedPresets(): Observable<OrdersFilterPreset[]> {
    return this.usersWrapper.getCurrentUserPreferences(PreferenceType.ORDER_PRESETS).pipe(
      map(preferences =>
        preferences.map(preference => {
          preference.preferences['id'] = preference.id; // Assign the preference ID to the preset
          return this.parseAndCheckPreset(preference.preferences)
        })
      )
    );
  }

  /**
   * Saves a new filter preset for the current user.
   * @param preset The OrdersFilterPreset to save.
    * @returns An Observable of an array of OrdersFilterPreset including the newly saved preset (combined with defaults and existing custom presets).
   */
  savePreset(preset: OrdersFilterPreset) {
    const preference: UserPreferencesRequestDTO = {
      preference_type: PreferenceType.ORDER_PRESETS,
      preferences: preset,
    };
    return this.usersWrapper.addCurrentUserPreference(preference).pipe(
      catchError(error => {
        console.error('Error saving filter preset:', error);
        this._snackBar.open(
          'Fehler beim Speichern der Filtervorgabe: ' + error.message,
          'Schließen',
          { duration: 5000 }
        );
        return this.getValidDefaultPresets();
      }),
      switchMap(() => this.getFullPresetList(this.getSavedPresets()))
    )
  }

  /**
   * Updates an existing filter preset identified by its label.
   * @param oldLabel The label of the preset to update.
   * @param updatedPreset The updated OrdersFilterPreset.
   * @returns An Observable of an array of OrdersFilterPreset including the updated preset (combined with defaults and existing custom presets).
   */
  updatePresetByLabel(
    oldLabel: string,
    updatedPreset: OrdersFilterPreset,
  ) {
    return this.getSavedPresets().pipe(
      switchMap(customPresets => {

        const deleteObservables: Observable<void>[] = [];
        for (const presetToUpdate of customPresets.filter(preset => preset.label === oldLabel)) {
          deleteObservables.push(this.usersWrapper.deleteCurrentUserPreference(presetToUpdate.id!));
        }

        if (deleteObservables.length === 0) return of(undefined);

        return forkJoin(deleteObservables).pipe(
          catchError(error => {
            console.error('Error updating filter preset:', error);
            return this.getValidDefaultPresets();
          })
        );
      }),

      switchMap(() => {
        return this.savePreset(updatedPreset);
      })
    );
  }

  /**
   * Deletes a specific filter preset for the current user.
    * @param presetId The ID of the user preference/preset to delete.
   * @returns An Observable of an array of OrdersFilterPreset.
   */
  deletePreset(presetId: number) {
    return this.usersWrapper.deleteCurrentUserPreference(presetId).pipe(
      catchError(error => {
        console.error('Error deleting filter preset:', error);
        this._snackBar.open(
          'Fehler beim Löschen der Filtervorgabe: ' + error.message,
          'Schließen',
          { duration: 5000 }
        );
        return this.getValidDefaultPresets();
      }),
      switchMap(() => this.getFullPresetList(this.getSavedPresets()))
    );
  }

  /**
    * Retrieves valid default filter presets for the current user.
    * If the current user is unavailable, presets requiring CURRENT_USER_PLACEHOLDER are removed.
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
    * Parses a preset provided as a JSON string or an object with a `label` field,
    * and ensures any date ranges inside filters are properly formatted.
    * @param inputPreset The preset as a JSON string, an object with keys, or an OrdersFilterPreset.
    * @returns The parsed and checked OrdersFilterPreset.
   */
  parseAndCheckPreset(inputPreset: string | { [key: string]: any } | OrdersFilterPreset): OrdersFilterPreset {
    let preset: OrdersFilterPreset;
    if (typeof inputPreset === 'string') {
      preset = JSON.parse(inputPreset);
    } else if (typeof inputPreset === 'object' && ('label' in inputPreset))
      preset = inputPreset as OrdersFilterPreset;
    else {
      throw new Error('Invalid preset format');
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
   * Throws an error if the current user cannot be determined.
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
    * Replaces CURRENT_USER_PLACEHOLDER in a single applied filter when applicable (filters with `chipIds`).
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

  /**
   * Removes presets that contain CURRENT_USER_PLACEHOLDER when no user context is available.
   * Logs a warning indicating how many presets were removed.
   * @param presets The original preset list.
   * @returns The filtered list without presets requiring CURRENT_USER_PLACEHOLDER.
   */
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
