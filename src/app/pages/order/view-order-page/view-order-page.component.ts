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
import { environment } from "../../../../environments/environment";
import { OrderStatus, UserResponseDTO } from '../../../apiv2';
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
import { STATE_ALLOW_PDF_EXPORT, STATE_CHANGE_TO_NAMES, STATE_DISPLAY_NAMES, STATE_ICONS } from "../../../display-name-mappings/status-names";
import { AllowedStateTransitions } from "../../../models/allowed-states-transitions";
import { DisplayableOrder } from '../../../models/displayable-order';
import { AuthenticationService } from "../../../services/authentication.service";
import { OrderSubresourceResolverService } from "../../../services/order-subresource-resolver.service";
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
  color?: string;
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
  allowPdfExportStates = STATE_ALLOW_PDF_EXPORT;

  owner: UserResponseDTO | undefined;

  stateTransitionMap: AllowedStateTransitions = {};
  stateChangeButtons: StateChangeButtons[] = [];

  lastStateChangeTimestamp = Date.now();

  constructor(
    private readonly usersService: UsersWrapperService,
    private readonly stateService: StateWrapperService,
    private readonly ordersService: OrdersWrapperService,
    private readonly orderDisplayService: OrderSubresourceResolverService,
    private readonly authService: AuthenticationService,
    private readonly router: Router,
    private readonly snackBar: MatSnackBar,
    private readonly dialog: MatDialog
  ) { }

  /**
   * Initializes the component, fetching necessary data and setting up state transitions.
   */
  ngOnInit(): void {
    this.internalOrder = signal<DisplayableOrder>(this.order());

    const ownerId = this.internalOrder().order.owner_id;
    if (ownerId) {
      this.usersService.getUserById(ownerId.toString()).subscribe(user => {
        this.owner = user;
      });
    }

    this.stateService.getAllowedStateTransitions().subscribe(transitions => {
      this.stateTransitionMap = transitions;
      this.createStateChangeButtons();
    });
  }

  /**
   * Exports the order as a PDF document if it is in the COMPLETED state.
   */
  export(): void {
    if (!this.internalOrder().order.id) {
      this.snackBar.open('Bestellung hat keine gültige ID und kann nicht exportiert werden.', 'Schließen', { duration: 5000 });
      return;
    }

    if (!this.allowPdfExportStates.includes(this.internalOrder().order.status!)) {
      this.snackBar.open(`Bestellung kann nur in den Statusen ${this.allowPdfExportStates.map(state => STATE_DISPLAY_NAMES.get(state)).join(', ')} exportiert werden.`, 'Schließen', { duration: 5000 });
      return;
    }

    this.ordersService.exportOrderToDocument(this.internalOrder().order.id?.toString()!).subscribe({
      next: (blob) => {
        const link = document.createElement('a');
        const objectUrl = URL.createObjectURL(blob);
        link.href = objectUrl;
        link.download = `Bestellung-${this.internalOrder().orderDisplay.besy_number}.pdf`;
        link.click();
        URL.revokeObjectURL(objectUrl);

        this.snackBar.open('Bestellung erfolgreich exportiert.', 'Schließen', { duration: 5000 });
      },
      error: () => {
        this.snackBar.open('Fehler beim Exportieren der Bestellung.', 'Schließen', { duration: 5000 });
      }
    });
  }

  /**
   * Gets the next allowed states for the current order status.
   */
  getNextAllowedStates(): OrderStatus[] {
    const currentState = this.internalOrder().order.status;
    if (!currentState) {
      return [];
    }
    return this.stateTransitionMap[currentState] ?? [];
  }

  /**
   * Creates the buttons data for changing the order state.
   */
  createStateChangeButtons(): void {
    this.stateChangeButtons = [];
    for (const state of this.getNextAllowedStates()) {
      if (state === OrderStatus.Approved && !this.authService.isAuthorizedFor(environment.approveOrdersRole)) {
        continue;
      }
      let color;
      switch (state) {
        case OrderStatus.Deleted:
          color = 'warn';
          break;
        case OrderStatus.Approved:
          color = 'accent';
          break;
        default:
          color = 'default';
      }

      this.stateChangeButtons.push({
        label: STATE_CHANGE_TO_NAMES.get(state) ?? `change to ${state}`,
        icon: STATE_ICONS.get(state) ?? '',
        tooltip: `Zu '${STATE_DISPLAY_NAMES.get(state) ?? state}' wechseln`,
        state,
        color
      });
    }
  }

  /**
   * Changes the order state to the specified new state.
   * @param newState The new state to change to.
   */
  changeOrderState(newState: OrderStatus): void {
    if (Date.now() - this.lastStateChangeTimestamp < 1000) {
      this.snackBar.open('Bitte warten Sie einen Moment, bevor Sie den Bestellungsstatus erneut ändern.', 'Schließen', { duration: 5000 });
      this.lastStateChangeTimestamp = Date.now();
      return;
    }
    if (!this.getNextAllowedStates().includes(newState)) {
      this.snackBar.open(`Statuswechsel zu '${STATE_DISPLAY_NAMES.get(newState) ?? newState}' ist nicht erlaubt.`, 'Schließen', { duration: 5000 });
      return;
    }

    if (newState === OrderStatus.InProgress) {
      this.ordersService.putOrderState(this.internalOrder().order.id!, newState).subscribe({
        next: () => {
          this.snackBar.open(`Bestellungsstatus erfolgreich zu '${STATE_DISPLAY_NAMES.get(newState) ?? newState}' geändert.`, 'Schließen', { duration: 5000 });
          this.updateOrderState(newState);
        },
        error: () => {
          this.snackBar.open('Fehler beim Ändern des Bestellungsstatus.', 'Schließen', { duration: 5000 });
        }
      });
      return;
    }

    if (newState === OrderStatus.Deleted) {
      this.handleDeleteOrder();
      return;
    }

    console.warn(`Statuswechsel zu '${newState}' ist nicht implementiert.`);
    // TODO: Implement order requirements check for other state changes. Use a service or something.
  }

  /**
   * Updates the order state and resolves its subresources.
   * @param newState The new state to set.
   */
  updateOrderState(newState: OrderStatus) {
    const newOrder = { ...this.internalOrder().order, status: newState };
    this.orderDisplayService.resolveOrderSubresources(newOrder).subscribe(orderDisplay => {
      this.internalOrder.set({ order: newOrder, orderDisplay });
    });
    this.createStateChangeButtons();
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
        this.ordersService.deleteOrder(this.internalOrder().order.id!).subscribe(() => {
          this.snackBar.open('Bestellung erfolgreich gelöscht.', 'Schließen', { duration: 5000 });
          this.router.navigate(['/orders']);
        });
      }
    });
  }

}
