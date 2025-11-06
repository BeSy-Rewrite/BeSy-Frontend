import { Injectable } from '@angular/core';
import { lastValueFrom, map } from 'rxjs';
import { PersonsService } from '../../api-services-v2';

@Injectable({
  providedIn: 'root'
})
export class PersonsWrapperService {
  constructor(private readonly personsService: PersonsService) { }

  async getAllPersons() {
    return lastValueFrom(this.personsService.getAllPersons());
  }

  async getPersonById(id: number) {
    return lastValueFrom(this.personsService.getPersonById(id));
  }

  async createPerson(person: any) {
    return lastValueFrom(this.personsService.createPerson(person));
  }

  async getAllPersonsWithFullName() {
    return lastValueFrom(this.personsService.getAllPersons().pipe(
      map(persons =>
        persons.map(person => ({
          ...person,
          fullName: [person.name, person.surname].filter(Boolean).join(' ')
        }))
      )
    ));
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
}
