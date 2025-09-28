import { Injectable } from '@angular/core';
import { UsersService } from '../../api';

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
}

