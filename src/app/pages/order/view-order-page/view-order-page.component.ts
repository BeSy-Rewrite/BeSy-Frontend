import { ClipboardModule } from "@angular/cdk/clipboard";
import { Component, computed, input, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from "@angular/material/divider";
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTabsModule } from "@angular/material/tabs";
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { OrderResponseDTO, OrderStatus } from '../../../api';
import { ApprovalsComponent } from '../../../components/approvals/approvals.component';
import { OrderMainInformationComponent } from '../../../components/order-main-information/order-main-information.component';
import { PersonDetailsComponent } from "../../../components/person-details/person-details.component";
import { QuotationsListComponent } from '../../../components/quotations-list/quotations-list.component';
import { StateHistoryComponent } from "../../../components/state-history/state-history.component";
import { ORDER_FIELD_LABELS } from '../../../display-name-mappings/order-names';
import { DisplayableOrder } from '../../../models/displayable-order';

type Gender = 'm' | 'f' | 'd';

@Component({
  selector: 'app-view-order-page',
  imports: [
    RouterModule,
    MatDividerModule,
    MatButtonModule,
    MatTabsModule,
    MatExpansionModule,
    MatTooltipModule,
    ClipboardModule,
    OrderMainInformationComponent,
    PersonDetailsComponent,
    QuotationsListComponent,
    ApprovalsComponent,
    StateHistoryComponent,
  ],
  templateUrl: './view-order-page.component.html',
  styleUrl: './view-order-page.component.scss'
})
export class ViewOrderPageComponent implements OnInit {
  order = input.required<DisplayableOrder>();
  orderFieldNames = ORDER_FIELD_LABELS;
  orderStates = OrderStatus;

  personKeys = ['delivery_person_id', 'invoice_person_id', 'queries_person_id'];
  personMappings = new Map<number, string[]>();

  ordererGender = signal<Gender>('d');
  personGenderMap = new Map<number, Gender>();

  currentUrl = computed(() => window.location.href);

  ngOnInit(): void {
    for (const key of this.personKeys) {
      const personId = this.order().order[key as keyof OrderResponseDTO] as number | undefined;
      if (personId == undefined) continue;

      this.personGenderMap.set(personId ?? -1, 'd');

      if (this.personMappings.has(personId)) {
        this.personMappings.get(personId)?.push(key);
      } else {
        this.personMappings.set(personId, [key]);
      }
    }
  }

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
