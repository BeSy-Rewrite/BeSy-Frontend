import { Injectable } from '@angular/core';
import { UserResponseDTO, UsersService } from '../../api';

@Injectable({
  providedIn: 'root'
})
export class UsersWrapperService {

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
   * TODO: Implement actual current user retrieval
   * @returns UserResponseDTO OK
   * @throws ApiError
   */
  getCurrentUser(): Promise<UserResponseDTO> {
    return Promise.resolve({
      id: '-1',
      surname: 'Doe',
      name: 'John',
      email: 'john.doe@example.com'
    });
  }
}
