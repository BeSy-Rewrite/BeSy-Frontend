import { ClipboardModule } from "@angular/cdk/clipboard";
import { Component, computed, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from "@angular/material/divider";
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTabsModule } from "@angular/material/tabs";
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { OrderStatus } from '../../../api';
import { ApprovalsComponent } from '../../../components/approvals/approvals.component';
import { OrderMainInformationComponent } from '../../../components/order-main-information/order-main-information.component';
import { OrderPersonsComponent } from "../../../components/order-persons/order-persons.component";
import { PersonDetailsComponent } from "../../../components/person-details/person-details.component";
import { QuotationsListComponent } from '../../../components/quotations-list/quotations-list.component';
import { StateHistoryComponent } from "../../../components/state-history/state-history.component";
import { ORDER_FIELD_LABELS } from '../../../display-name-mappings/order-names';
import { DisplayableOrder } from '../../../models/displayable-order';


type SectionId = 'quotations' | 'contacts' | 'approvals' | 'history';
interface Section { id: SectionId; title: string; }

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
    OrderPersonsComponent,
    QuotationsListComponent,
    ApprovalsComponent,
    StateHistoryComponent,
  ],
  templateUrl: './view-order-page.component.html',
  styleUrl: './view-order-page.component.scss'
})
export class ViewOrderPageComponent {
  /**
   * The order and its formatted data to display.
   */
  order = input.required<DisplayableOrder>();

  orderFieldNames = ORDER_FIELD_LABELS;
  orderStates = OrderStatus;

  currentUrl = computed(() => window.location.href);

  sections: Section[] = [
    { id: 'quotations', title: 'Vergleichsangebote' },
    { id: 'contacts', title: 'Kontaktdaten' },
    { id: 'approvals', title: 'Freigaben' },
    { id: 'history', title: 'Statusverlauf' },
  ];

}
