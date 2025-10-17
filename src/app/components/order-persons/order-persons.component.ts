import { Component, input, OnInit } from '@angular/core';
import { OrderResponseDTO } from '../../api';
import { ORDER_FIELD_NAMES } from '../../display-name-mappings/order-names';
import { PersonDetailsComponent } from '../person-details/person-details.component';

type Gender = 'm' | 'f' | 'd';

@Component({
  selector: 'app-order-persons',
  imports: [
    PersonDetailsComponent
  ],
  templateUrl: './order-persons.component.html',
  styleUrl: './order-persons.component.scss'
})
export class OrderPersonsComponent implements OnInit {
  /** The order whose persons should be displayed */
  order = input.required<OrderResponseDTO>();

  orderFieldNames = ORDER_FIELD_NAMES;

  personKeys = ['delivery_person_id', 'invoice_person_id', 'queries_person_id'];
  personMappings = new Map<number, string[]>();

  personGenderMap = new Map<number, Gender>();

  ngOnInit(): void {
    for (const key of this.personKeys) {
      const personId = this.order()[key as keyof OrderResponseDTO] as number | undefined;
      if (personId == undefined) continue;

      this.personGenderMap.set(personId ?? -1, 'd');

      if (this.personMappings.has(personId)) {
        this.personMappings.get(personId)?.push(key);
      } else {
        this.personMappings.set(personId, [key]);
      }
    }
  }

  /**
   * Get a gendered word based on the provided gender.
   * @param word The word to be gendered. Must contain ':in' to indicate where
   * @param gender The gender to use for gendering the word.
   * @returns The gendered word.
   */
  getGenderedWord(word: string, gender: Gender): string {
    switch (gender) {
      case 'f':
        return word.replace(':in', 'in');
      case 'm':
        return word.replace(':in', '');
      case 'd':
        return word;
    }
  }
}
