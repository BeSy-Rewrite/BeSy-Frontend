import { Injectable } from '@angular/core';
import { lastValueFrom, Observable, of, tap } from 'rxjs';
import {
  UserControllerService,
  UserPreferencesRequestDTO,
  UserPreferencesResponseDTO,
  UserResponseDTO,
} from '../../api-services-v2';
import { AuthenticationService } from '../authentication.service';

@Injectable({
  providedIn: 'root',
})
export class UsersWrapperService {
  private currentUserCache?: UserResponseDTO;

  constructor(
    private readonly usersService: UserControllerService,
    private readonly authService: AuthenticationService
  ) {}

  /**
   * @returns Promise<UserResponseDTO[]>
   * @throws ApiError
   */
  getAllUsers(): Promise<UserResponseDTO[]> {
    return lastValueFrom(this.usersService.getAllUsers());
  }

  /**
   * @param id
   * @returns Promise<UserResponseDTO>
   * @throws ApiError
   */
  getUserById(id: number): Observable<UserResponseDTO> {
    return this.usersService.getUserById(id);
  }

  /**
   * Resolves the current user.
   * Caches the user to avoid redundant API calls.
   * @returns Observable<UserResponseDTO>
   */
  getCurrentUser(): Observable<UserResponseDTO> {
    if (this.currentUserCache && this.authService.hasValidToken()) {
      return of(this.currentUserCache);
    } else {
      this.currentUserCache = undefined;
    }

    return this.usersService.getCurrentUser().pipe(
      tap(user => {
        this.currentUserCache = user;
      })
    );
  }

  /**
   * Retrieves preferences for the current user.
   * @param type The type of preference to retrieve (optional).
   * @returns An Observable of UserPreferencesResponseDTO array.
   */
  getCurrentUserPreferences(type?: string): Observable<UserPreferencesResponseDTO[]> {
    return this.usersService.getUserPreferences(type);
  }

  /**
   * Adds a new preference for the current user.
   * @param preference The preference data to add.
   * @returns An Observable of UserPreferencesResponseDTO containing the added preference.
   */
  addCurrentUserPreference(
    preference: UserPreferencesRequestDTO
  ): Observable<UserPreferencesResponseDTO> {
    return this.usersService.addUserPreferences(preference);
  }

  /**
   * Deletes a preference for the current user by its ID.
   * @param preferenceId The ID of the preference to delete.
   * @returns An Observable of UserPreferencesResponseDTO containing the deleted preference.
   */
  deleteCurrentUserPreference(preferenceId: number): Observable<void> {
    return this.usersService.deleteUserPreferences(preferenceId);
  }

  /**
   * Updates a preference for the current user by its ID.
   * @param preferenceId The ID of the preference to update.
   * @param preference The updated preference data.
   * @returns An Observable of UserPreferencesResponseDTO containing the updated preference.
   */
  updateCurrentUserPreferenceById(
    preferenceId: number,
    preference: UserPreferencesRequestDTO
  ): Observable<UserPreferencesResponseDTO> {
    return this.usersService.updateUserPreferences(preferenceId, preference);
  }
}
