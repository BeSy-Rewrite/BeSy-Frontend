import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { PersonRequestDTO, PersonResponseDTO, PersonsService } from '../../apiv2';

@Injectable({
  providedIn: 'root'
})
export class PersonsWrapperService {
  constructor(private readonly personsService: PersonsService) { }

  getAllPersons() {
    return this.personsService.getAllPersons();
  }

  getPersonById(id: number) {
    return this.personsService.getPersonById(id);
  }

  createPerson(person: PersonRequestDTO) {
    return this.personsService.createPerson(person);
  }

  /**
   * Retrieves all persons and adds a fullName property to each.
   */
  getAllPersonsWithFullName() {
    return this.personsService.getAllPersons().pipe(
      map(persons => this.addFullNameToPersons(persons))
    );
  }

  /**
   * Adds a full name property to each person object.
   */
  private addFullNameToPersons(persons: PersonResponseDTO[]) {
    const personsWithFullName = persons.map((person) => {
      return {
        ...person,
        fullName: [person.name, person.surname].filter(Boolean).join(' '),
      };
    });
    return personsWithFullName;
  }

  getAllPersonsAddresses() {
    return this.personsService.personsAddressesGet();
  }

  /**
   * Retrieves the address for a specific person by their ID.
   * @param id The ID of the person whose address is to be retrieved.
   * @returns An address object associated with the person.
   */
  getPersonAddressesById(id: number) {
    return this.personsService.personsPersonIdAddressGet(id);
  }

  createPersonAddress(address: any) {
    return this.personsService.createPersonAddress(address);
  }

  /**
   * Retrieves a specific address by its ID.
   * @param addressId The ID of the address to retrieve.
   * @returns The address object if found, otherwise undefined.
   */
  getAddressById(addressId: number) {
    return this.personsService.personsAddressesGet().pipe(
      map(addresses => addresses.find(addr => addr.id === addressId))
    );
  }
}
