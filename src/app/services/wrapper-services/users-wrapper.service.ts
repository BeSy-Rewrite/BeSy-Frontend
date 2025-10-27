import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserResponseDTO, UsersService } from '../../api';
import { AuthenticationService } from '../authentication.service';

@Injectable({
  providedIn: 'root'
})
export class UsersWrapperService {

  constructor(private readonly authService: AuthenticationService, private readonly http: HttpClient) { }

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
    return this.http.get<UserResponseDTO>(`${environment.apiUrl}/users/me`);
  }
}
