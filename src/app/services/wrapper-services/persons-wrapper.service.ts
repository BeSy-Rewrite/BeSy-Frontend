import { Injectable } from '@angular/core';
import { lastValueFrom, map } from 'rxjs';
import { PersonResponseDTO, PersonsService } from '../../api-services-v2';

// Interface for person with full name
export interface PersonWithFullName extends PersonResponseDTO {
  fullName: string;
}

export interface FormattedPerson {
  label: string;
  value: number;
}

@Injectable({
  providedIn: 'root',
})
export class PersonsWrapperService {
  constructor(private readonly personsService: PersonsService) {}

  async getAllPersons() {
    return lastValueFrom(this.personsService.getAllPersons());
  }

  async getPersonById(id: number) {
    return lastValueFrom(this.personsService.getPersonById(id));
  }

  async createPerson(person: any) {
    return lastValueFrom(this.personsService.createPerson(person));
  }

  /**
   * Fetch all persons with their full name
   * @returns PersonWithFullName[] List of persons with full name
   */
  async getAllPersonsWithFullName() {
    return lastValueFrom(
      this.personsService.getAllPersons().pipe(
        map(persons =>
          persons.map(person => ({
            ...person,
            fullName: [person.name, person.surname].filter(Boolean).join(' '),
          }))
        )
      )
    );
  }

  /**
   * Fetch a person by ID with their full name
   * @param id ID of the person
   * @returns PersonWithFullName | undefined
   */
  async getPersonByIdWithFullName(id: number) {
    const person = await this.getPersonById(id);
    if (!person) return undefined;

    return {
      ...person,
      fullName: `${person.name} ${person.surname}`,
    } as PersonWithFullName;
  }

  async getAllPersonsAddresses() {
    return lastValueFrom(this.personsService.getAllPersonAddresses());
  }

  async getPersonAddressById(id: number) {
    return lastValueFrom(this.personsService.getPersonAddress(id));
  }

  async createPersonAddress(address: any) {
    return lastValueFrom(this.personsService.createPersonAddress(address));
  }

  async getPersonByIdFormattedForAutocomplete(id: number): Promise<FormattedPerson | undefined> {
    const person = await this.getPersonByIdWithFullName(id);
    if (!person) return undefined;

    return {
      label: person.fullName,
      value: person.id!,
    };
  }

  getAddress(addressId: number) {
    return lastValueFrom(
      this.personsService
        .getAllPersonAddresses()
        .pipe(map(addresses => addresses.find(addr => addr.id === addressId)))
    );
  }
}
