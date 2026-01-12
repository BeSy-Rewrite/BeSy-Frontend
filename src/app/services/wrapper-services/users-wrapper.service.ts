import { Injectable } from '@angular/core';
import { lastValueFrom, Observable, of, tap } from 'rxjs';
import { PreferenceType, UserPreferencesRequestDTO, UserPreferencesResponseDTO, UserResponseDTO, UsersService } from '../../api-services-v2';
import { AuthenticationService } from '../authentication.service';

@Injectable({
  providedIn: 'root'
})
export class UsersWrapperService {

  private currentUserCache?: UserResponseDTO;

  constructor(private readonly usersService: UsersService,
    private readonly authService: AuthenticationService
  ) { }

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
  getUserById(id: string): Promise<UserResponseDTO> {
    return lastValueFrom(this.usersService.getUser(id));
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
  getCurrentUserPreferences(type?: PreferenceType): Observable<UserPreferencesResponseDTO[]> {
    return this.usersService.getCurrentUserPreferences(type);
  }

  /**
   * Adds a new preference for the current user.
   * @param preference The preference data to add.
   * @returns An Observable of UserPreferencesResponseDTO containing the added preference.
   */
  addCurrentUserPreference(preference: UserPreferencesRequestDTO): Observable<UserPreferencesResponseDTO> {
    return this.usersService.addCurrentUserPreference(preference);
  }

  /**
   * Deletes a preference for the current user by its ID.
   * @param preferenceId The ID of the preference to delete.
   * @returns An Observable of UserPreferencesResponseDTO containing the deleted preference.
   */
  deleteCurrentUserPreference(preferenceId: number): Observable<void> {
    return this.usersService.deleteCurrentUserPreference(preferenceId);
  }
}
