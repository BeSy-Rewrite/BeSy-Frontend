import { Injectable } from '@angular/core';
import { PersonResponseDTO, PersonsService } from '../../api';

// Interface for person with full name
export interface PersonWithFullName extends PersonResponseDTO {
  fullName: string;
}

@Injectable({
  providedIn: 'root'
})
export class PersonsWrapperService {
  constructor() {}

  async getAllPersons() {
    const persons = await PersonsService.getAllPersons();
    return persons;
  }

  async getPersonById(id: number) {
    const person = await PersonsService.getPersonById(id);
    return person;
  }

  async createPerson(person: any) {
    const createdPerson = await PersonsService.createPerson(person);
    console.log("Created person:", createdPerson);
    return createdPerson;
  }

  /**
   * Fetch all persons with their full name
   * @returns PersonWithFullName[] List of persons with full name
   */
  async getAllPersonsWithFullName() {
    const persons = await PersonsService.getAllPersons();
    const personsWithFullName = persons.map((person) => {
      return {
        ...person,
        fullName: `${person.name}` + " " + `${person.surname}` as string,
      };
    });
    return personsWithFullName as PersonWithFullName[];
  }

  async getAllPersonsAddresses() {
    const addresses = await PersonsService.getPersonsAddresses();
    return addresses;
  }

  async getPersonAddressesById(id: number) {
    const addresses = await PersonsService.getPersonsAddress(id);
    return addresses;
  }

  async createPersonAddress(address: any) {
    const createdAddress = await PersonsService.createPersonAddress(address);
    return createdAddress;
  }
}

