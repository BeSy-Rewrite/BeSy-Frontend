import { Component, input } from '@angular/core';
import { OrderResponseDTO } from '../../../api-services-v2';
import { PersonDetailsComponent } from '../../person-details/person-details.component';


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
