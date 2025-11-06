import { Component, input } from '@angular/core';
import { OrderResponseDTO } from '../../../api';
import { PersonDetailsComponent } from '../../person-details/person-details.component';

type Gender = 'm' | 'f' | 'd';

@Component({
  selector: 'app-order-persons',
  imports: [
    PersonDetailsComponent
  ],
  templateUrl: './order-persons.component.html',
  styleUrl: './order-persons.component.scss'
})
export class OrderPersonsComponent {
  /** The order whose persons should be displayed */
  order = input.required<OrderResponseDTO>();
}
