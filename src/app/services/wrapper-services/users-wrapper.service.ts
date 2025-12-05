import { Injectable } from '@angular/core';
import { lastValueFrom, Observable, of, tap } from 'rxjs';
import { UserPreferencesResponseDTO, UserResponseDTO, UsersService } from '../../api-services-v2';
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
   * Retrieves the preferences of a user by their ID.
   * @param userId The ID of the user.
   * @returns An Observable of UserPreferencesResponseDTO containing the user's preferences.
   */
  getUserPreferences(userId: number): Observable<UserPreferencesResponseDTO> {
    return this.usersService.getUserPreferences(userId);
  }

  /**
   * Adds preferences for a user by their ID.
   * @param userId The ID of the user.
   * @param preferences The preferences to add.
   * @returns An Observable of UserPreferencesResponseDTO containing the updated preferences.
   */
  addUserPreferences(userId: number, preferences: UserPreferencesResponseDTO): Observable<UserPreferencesResponseDTO> {
    return this.usersService.addUserPreferences(userId, preferences);
  }

  /**
   * Deletes preferences for a user by their ID.
   * @param userId The ID of the user.
   * @param preferences The preferences to delete.
   * @returns An Observable of UserPreferencesResponseDTO containing the updated preferences.
   */
  deleteFromUserPreferences(userId: number, preferences: UserPreferencesResponseDTO): Observable<UserPreferencesResponseDTO> {
    return this.usersService.deleteUserPreferences(userId, preferences);
  }
}
