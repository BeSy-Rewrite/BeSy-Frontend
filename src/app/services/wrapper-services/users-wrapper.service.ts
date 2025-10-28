import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserResponseDTO, UsersService } from '../../apiv2';

@Injectable({
  providedIn: 'root'
})
export class UsersWrapperService {

  constructor(private readonly usersService: UsersService) { }

  /**
   * @returns Array<UserResponseDTO> OK
   */
  getAllUsers() {
    return this.usersService.getAllUsers();
  }

  /**
   * @param id The ID of the user to retrieve.
   * @returns UserResponseDTO OK
   */
  getUserById(id: string) {
    return this.usersService.getUser(id);
  }

  /**
   * Resolves the current user in the given filter presets.
   * @returns An observable of the resolved UserResponseDTO.
   */
  getCurrentUser(): Observable<UserResponseDTO> {
    return this.usersService.getCurrentUser();
  }
}
