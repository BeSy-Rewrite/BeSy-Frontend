import { Injectable } from '@angular/core';
import { from, map, Observable } from 'rxjs';
import { UserResponseDTO, UsersService } from '../../api';
import { AuthenticationService } from '../authentication.service';

@Injectable({
  providedIn: 'root'
})
export class UsersWrapperService {

  constructor(private readonly authService: AuthenticationService) { }

  /**
     * @returns UserResponseDTO OK
     * @throws ApiError
     */
  async getAllUsers() {
    const users = await UsersService.getAllUsers();
    return users;
  }

  /**
     * @param id
     * @returns UserResponseDTO OK
     * @throws ApiError
     */
  async getUserById(id: string) {
    const user = await UsersService.getUser(id);
    return user;
  }

  /**
   * Resolves the current user in the given filter presets.
   * @param filterPresets The array of OrdersFilterPreset to resolve the current user in.
   * @returns An observable of the resolved UserResponseDTO or undefined if not found.
   */
  getCurrentUser(): Observable<UserResponseDTO | undefined> {
    const currentUsername = this.authService.getUsername();

    return from(UsersService.getAllUsers()).pipe(
      map(users => users.find(user => {
        const fullName = `${user.name} ${user.surname}`.trim().toLowerCase();
        return fullName === currentUsername?.trim().toLowerCase();
      }))
    );
  }
}
