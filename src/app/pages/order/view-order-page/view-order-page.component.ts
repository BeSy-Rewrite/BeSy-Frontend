import { Component, input, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from "@angular/material/divider";
import { MatTabsModule } from "@angular/material/tabs";
import { RouterModule } from '@angular/router';
import { OrderResponseDTO } from '../../../api';
import { OrderDetailsComponent } from '../../../components/order-details/order-details.component';
import { PersonDetailsComponent } from "../../../components/person-details/person-details.component";
import { ORDER_FIELD_LABELS } from '../../../display-name-mappings/order-names';
import { DisplayableOrder } from '../../../models/displayable-order';

@Component({
  selector: 'app-view-order-page',
  imports: [
    RouterModule,
    MatDividerModule,
    MatButtonModule,
    MatTabsModule,
    OrderDetailsComponent,
    PersonDetailsComponent
  ],
  templateUrl: './view-order-page.component.html',
  styleUrl: './view-order-page.component.scss'
})
export class ViewOrderPageComponent implements OnInit {
  order = input.required<DisplayableOrder>();
  orderFieldNames = ORDER_FIELD_LABELS;

  personKeys = ['owner_id', 'delivery_person_id', 'invoice_person_id', 'queries_person_id'];
  personMappings = new Map<number, string[]>();

  ngOnInit(): void {
    for (const key of this.personKeys) {
      const personId = this.order().order[key as keyof OrderResponseDTO] as number | undefined;
      if (personId == undefined) continue;

      if (!this.personMappings.has(personId)) {
        this.personMappings.set(personId, [key]);
      } else {
        this.personMappings.get(personId)?.push(key);
      }
    }
  }
}
