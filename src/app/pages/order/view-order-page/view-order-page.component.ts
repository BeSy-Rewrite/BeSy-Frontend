import { ClipboardModule } from "@angular/cdk/clipboard";
import { Component, computed, input, OnInit, signal, WritableSignal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from "@angular/material/dialog";
import { MatDividerModule } from "@angular/material/divider";
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from "@angular/material/icon";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatTabsModule } from "@angular/material/tabs";
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterModule } from '@angular/router';
import { OrderStatus, UserResponseDTO } from '../../../api';
import { setupDialog } from "../../../components/dialog/dialog.component";
import { OrderDocumentsComponent } from "../../../components/documents/order-documents/order-documents.component";
import { ApprovalsComponent } from '../../../components/order-display/approvals/approvals.component';
import { OrderMainInformationComponent } from '../../../components/order-display/order-main-information/order-main-information.component';
import { OrderPersonsComponent } from "../../../components/order-display/order-persons/order-persons.component";
import { QuotationsListComponent } from '../../../components/order-display/quotations-list/quotations-list.component';
import { StateHistoryComponent } from "../../../components/order-display/state-history/state-history.component";
import { Step } from "../../../components/progress-bar/progress-bar.component";
import { StateDisplayComponent } from "../../../components/state-display/state-display.component";
import { ORDER_FIELD_NAMES } from '../../../display-name-mappings/order-names';
import { STATE_CHANGE_TO_NAMES, STATE_DISPLAY_NAMES, STATE_ICONS } from "../../../display-name-mappings/status-names";
import { AllowedStateTransitions } from "../../../models/allowed-states-transitions";
import { DisplayableOrder } from '../../../models/displayable-order';
import { OrdersWrapperService } from "../../../services/wrapper-services/orders-wrapper.service";
import { StateWrapperService } from "../../../services/wrapper-services/state-wrapper.service";
import { UsersWrapperService } from "../../../services/wrapper-services/users-wrapper.service";


type SectionId = 'quotations' | 'contacts' | 'approvals' | 'history' | 'documents';
interface Section { id: SectionId; title: string; isFullWidth: boolean; }
interface StateChangeButtons {
  label: string;
  icon: string;
  tooltip: string;
  state: OrderStatus;
}

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
    MatIconModule,
    OrderMainInformationComponent,
    OrderPersonsComponent,
    QuotationsListComponent,
    ApprovalsComponent,
    StateHistoryComponent,
    StateDisplayComponent,
    OrderDocumentsComponent,
  ],
  templateUrl: './view-order-page.component.html',
  styleUrl: './view-order-page.component.scss'
})
export class ViewOrderPageComponent implements OnInit {
  /**
   * The order and its formatted data to display.
   */
  order = input.required<DisplayableOrder>();

  internalOrder!: WritableSignal<DisplayableOrder>;

  orderFieldNames = ORDER_FIELD_NAMES;
  orderStates = OrderStatus;

  currentUrl = computed(() => globalThis.location.href);

  sections: Section[] = [
    { id: 'quotations', title: 'Vergleichsangebote', isFullWidth: true },
    { id: 'documents', title: 'Dokumente', isFullWidth: true },
    { id: 'contacts', title: 'Kontaktdaten', isFullWidth: false },
    { id: 'approvals', title: 'Freigaben', isFullWidth: false },
    { id: 'history', title: 'Statusverlauf', isFullWidth: false },
  ];

  states: Step[] = [];

  owner: UserResponseDTO | undefined;

  stateTransitionMap: AllowedStateTransitions = {};
  stateChangeButtons: StateChangeButtons[] = [];

  constructor(
    private readonly usersService: UsersWrapperService,
    private readonly stateService: StateWrapperService,
    private readonly ordersService: OrdersWrapperService,
    private readonly router: Router,
    private readonly snackBar: MatSnackBar,
    private readonly dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.internalOrder = signal<DisplayableOrder>(this.order());

    const ownerId = this.internalOrder().order.owner_id;
    if (ownerId) {
      this.usersService.getUserById(ownerId.toString()).then(user => {
        this.owner = user;
      });
    }

    this.stateService.getAllowedStateTransitions().subscribe(transitions => {
      this.stateTransitionMap = transitions;
      this.createStateChangeButtons();
    });
  }

  getNextAllowedStates(): OrderStatus[] {
    const currentState = this.internalOrder().order.status;
    if (!currentState) {
      return [];
    }
    return this.stateTransitionMap[currentState] ?? [];
  }

  createStateChangeButtons(): void {
    this.stateChangeButtons = [];
    for (const state of this.getNextAllowedStates()) {
      this.stateChangeButtons.push({
        label: STATE_CHANGE_TO_NAMES.get(state) ?? `change to ${state}`,
        icon: STATE_ICONS.get(state) ?? '',
        tooltip: `Zu '${STATE_DISPLAY_NAMES.get(state) ?? state}' wechseln`,
        state
      });
    }
  }

  changeOrderState(newState: OrderStatus): void {
    if (!this.getNextAllowedStates().includes(newState)) {
      this.snackBar.open(`Statuswechsel zu '${STATE_DISPLAY_NAMES.get(newState) ?? newState}' ist nicht erlaubt.`, 'Schließen', { duration: 5000 });
      return;
    }

    if ([OrderStatus.IN_PROGRESS, OrderStatus.COMPLETED].includes(newState)) {
      this.ordersService.putOrderState(this.internalOrder().order.id!, newState).then(() => {
        this.snackBar.open(`Bestellungsstatus erfolgreich zu '${STATE_DISPLAY_NAMES.get(newState) ?? newState}' geändert.`, 'Schließen', { duration: 5000 });

        const currentUrl = this.router.url;
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          this.router.navigate([currentUrl]);
        });
      });
      return;
    }

    if (newState === OrderStatus.DELETED) {
      this.handleDeleteOrder();
      return;
    }

    console.warn(`Statuswechsel zu '${newState}' ist nicht implementiert.`);
    // TODO: Implement order requirements check for other state changes. Use a service or something.
  }

  /**
   * Handle the deletion of the order with a confirmation dialog.
   */
  private handleDeleteOrder() {
    const data = {
      title: 'Bestellung wirklich löschen?',
      description: 'Die Bestellung wird dauerhaft gelöscht und kann nur von Admins wiederhergestellt werden.',
      cancelButtonText: 'Abbrechen',
      confirmButtonText: 'Löschen'
    };
    setupDialog(this.dialog, data, (result: boolean) => {
      if (result) {
        this.ordersService.deleteOrder(this.internalOrder().order.id!).then(() => {
          this.snackBar.open('Bestellung erfolgreich gelöscht.', 'Schließen', { duration: 5000 });
          this.router.navigate(['/orders']);
        });
      }
    });
  }

}
