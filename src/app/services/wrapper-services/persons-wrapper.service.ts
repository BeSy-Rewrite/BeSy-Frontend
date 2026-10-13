import { Injectable } from '@angular/core';
import { lastValueFrom, map, Observable } from 'rxjs';
import { PersonRequestDTO, PersonResponseDTO, PersonsService } from '../../api-services-v2';
import { AutocompleteOption } from '../../form-config-patching/autocomplete-option';
import { formatPerson } from '../../utils/formatting';

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

  getPersonById(id: number) {
    return this.personsService.getPersonById(id);
  }

  async createPerson(person: PersonRequestDTO) {
    return lastValueFrom(this.personsService.createPerson(person));
  }
  async updatePerson(id: number, person: PersonRequestDTO) {
    return lastValueFrom(this.personsService.updatePersonById(id, person));
  }

  /**
   * Fetch all persons with their full name
   * @returns Observable<PersonWithFullName[]> List of persons with full name
   */
  getAllPersonsWithFullName(): Observable<PersonWithFullName[]> {
    return this.personsService.getAllPersons().pipe(
      map(persons =>
        persons.map(person => ({
          ...person,
          fullName: formatPerson(person),
        }))
      )
    );
  }

  /**
   * Fetch all persons formatted for autocomplete
   * @returns Observable<AutocompleteOption<PersonWithFullName>[]> List of persons formatted for autocomplete
   */
  getAllPersonsFormattedForAutocomplete(): Observable<AutocompleteOption<PersonWithFullName>[]> {
    return this.getAllPersonsWithFullName().pipe(
      map(persons =>
        persons.map(person => ({
          label: person.fullName,
          value: person,
        }))
      )
    );
  }

  /**
   * Fetch a person by ID with their full name
   * @param id ID of the person
   * @returns PersonWithFullName | undefined
   */
  async getPersonByIdWithFullName(id: number): Promise<PersonWithFullName | undefined> {
    const person = await lastValueFrom(this.getPersonById(id));
    if (!person) return undefined;

    return {
      ...person,
      fullName: formatPerson(person),
    };
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
