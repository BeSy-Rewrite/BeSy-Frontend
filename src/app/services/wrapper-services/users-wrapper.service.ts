import { Injectable } from '@angular/core';
import { lastValueFrom, Observable } from 'rxjs';
import { UserResponseDTO, UsersService } from '../../api-services-v2';

@Injectable({
  providedIn: 'root'
})
export class UsersWrapperService {

  constructor(private readonly usersService: UsersService) { }

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
   * @returns Observable<UserResponseDTO | undefined>
   */
  getCurrentUser(): Observable<UserResponseDTO | undefined> {
    return this.usersService.getCurrentUser();
  }
}
