import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { catchError, EMPTY, from, map, Observable, of, switchMap } from 'rxjs';
import { AddressResponseDTO, PersonResponseDTO } from '../api-services-v2';
import { PersonsWrapperService } from '../services/wrapper-services/persons-wrapper.service';

export interface EditPersonResolvedData {
  person: PersonResponseDTO;
  address?: AddressResponseDTO;
}

@Injectable({
  providedIn: 'root',
})
export class EditPersonResolver implements Resolve<EditPersonResolvedData | null> {
  constructor(
    private readonly router: Router,
    private readonly personsService: PersonsWrapperService
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot
  ): Observable<EditPersonResolvedData | null> {
    const id = route.paramMap.get('id');

    if (!id) {
      this.router.navigate(['/not-found'], { skipLocationChange: true });
      return EMPTY;
    }

    const numericId = Number.parseInt(id, 10);
    if (Number.isNaN(numericId)) {
      this.router.navigate(['/not-found'], { skipLocationChange: true });
      return EMPTY;
    }

    // Fetch person by ID, if the person has an addressId, fetch the address as well
    return from(this.personsService.getPersonById(numericId)).pipe(
      catchError(error => {
        if (error?.status === 404) {
          this.router.navigate(['/not-found'], { skipLocationChange: true });
        } else {
          console.error('Error loading person for edit:', error);
        }
        return EMPTY;
      }),
      // Map to EditPersonResolvedData
      switchMap(person => {
        if (!person) {
          this.router.navigate(['/not-found'], { skipLocationChange: true });
          return EMPTY;
        }

        if (person.address_id) {
          return from(this.personsService.getPersonAddressById(person.address_id)).pipe(
            map(address => ({ person, address })),
            catchError(error => {
              console.error('Error loading address for person edit:', error);
              return of({ person });
            })
          );
        } else {
          return of({ person });
        }
      })
    );
  }
}
