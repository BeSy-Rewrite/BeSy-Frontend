import { ClipboardModule } from "@angular/cdk/clipboard";
import { Component, computed, input, OnInit, signal, WritableSignal } from '@angular/core';
import { MatButtonAppearance, MatButtonModule } from '@angular/material/button';
import { MatDialog } from "@angular/material/dialog";
import { MatDividerModule } from "@angular/material/divider";
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from "@angular/material/icon";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatTabsModule } from "@angular/material/tabs";
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterModule } from '@angular/router';
import { ZodError } from "zod";
import { environment } from "../../../../environments/environment";
import { OrderStatus, UserResponseDTO } from '../../../api-services-v2';
import { setupDialog } from "../../../components/dialog/dialog.component";
import { OrderDocumentsComponent } from "../../../components/documents/order-documents/order-documents.component";
import { ApprovalsComponent } from '../../../components/order-display/approvals/approvals.component';
import { OrderAddressesComponent } from "../../../components/order-display/order-addresses/order-addresses.component";
import { OrderArticleListComponent } from "../../../components/order-display/order-article-list/order-article-list.component";
import { OrderMainInformationComponent } from '../../../components/order-display/order-main-information/order-main-information.component';
import { OrderMainQuoteComponent } from "../../../components/order-display/order-main-quote/order-main-quote.component";
import { OrderPersonsComponent } from "../../../components/order-display/order-persons/order-persons.component";
import { QuotationsListComponent } from '../../../components/order-display/quotations-list/quotations-list.component';
import { StateHistoryComponent } from "../../../components/order-display/state-history/state-history.component";
import { Step } from "../../../components/progress-bar/progress-bar.component";
import { StateDisplayComponent } from "../../../components/state-display/state-display.component";
import { ToastInvalidOrderComponent } from "../../../components/toast-invalid-order/toast-invalid-order.component";
import { ToastRequest } from "../../../components/toast/toast.component";
import { ORDER_FIELD_NAMES } from '../../../display-name-mappings/order-names';
import { STATE_CHANGE_TO_NAMES, STATE_DISPLAY_NAMES, STATE_ICONS } from "../../../display-name-mappings/status-names";
import { AllowedStateTransitions } from "../../../models/allowed-states-transitions";
import { DisplayableOrder } from '../../../models/displayable-order';
import { AuthenticationService } from "../../../services/authentication.service";
import { DriverJsTourService } from "../../../services/driver.js-tour.service";
import { OrderStateValidityService } from "../../../services/order-state-validity.service";
import { OrderSubresourceResolverService } from "../../../services/order-subresource-resolver.service";
import { ToastService } from "../../../services/toast.service";
import { OrdersWrapperService } from "../../../services/wrapper-services/orders-wrapper.service";
import { StateWrapperService } from "../../../services/wrapper-services/state-wrapper.service";
import { UsersWrapperService } from "../../../services/wrapper-services/users-wrapper.service";
import { ORDER_EDIT_TABS } from "../edit-order-page/edit-order-page.component";


type SectionId = 'main-information' | 'addresses' | 'main-quote' | 'articles' | 'quotations' | 'contacts' | 'approvals' | 'history' | 'documents';
interface Section {
  id: SectionId;
  title: string;
  isFullWidth: boolean;
  editTabId?: (typeof ORDER_EDIT_TABS)[number];
}
interface StateChangeButtons {
  label: string;
  icon: string;
  tooltip: string;
  state: OrderStatus;
  color?: string;
  style?: MatButtonAppearance;
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
    OrderMainQuoteComponent,
    OrderArticleListComponent,
    OrderAddressesComponent
  ],
  templateUrl: './view-order-page.component.html',
  styleUrl: './view-order-page.component.scss'
})
export class ViewOrderPageComponent implements OnInit {
  environment = environment;
  /**
   * The order and its formatted data to display.
   */
  order = input.required<DisplayableOrder>();

  internalOrder!: WritableSignal<DisplayableOrder>;

  orderFieldNames = ORDER_FIELD_NAMES;
  orderStates = OrderStatus;

  currentUrl = computed(() => globalThis.location.href);

  sections: Section[] = [
    { id: 'main-information', title: 'Allgemeine Informationen', isFullWidth: false, editTabId: "General" },
    { id: 'addresses', title: 'Adressen', isFullWidth: false, editTabId: "Addresses" },
    { id: 'main-quote', title: 'Hauptangebot', isFullWidth: true, editTabId: "MainOffer" },
    { id: 'articles', title: 'Artikelübersicht', isFullWidth: true, editTabId: "Items" },
    { id: 'quotations', title: 'Vergleichsangebote', isFullWidth: true, editTabId: "Quotations" },
    { id: 'documents', title: 'Dokumente', isFullWidth: true },
    { id: 'contacts', title: 'Kontaktdaten', isFullWidth: false, editTabId: "General" },
    { id: 'approvals', title: 'Freigaben', isFullWidth: false, editTabId: "Approvals" },
    { id: 'history', title: 'Statusverlauf', isFullWidth: false },
  ];

  states: Step[] = [];

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
    private readonly dialog: MatDialog,
    private readonly orderStateValidityService: OrderStateValidityService,
    private readonly toastService: ToastService,
    private readonly driverJsService: DriverJsTourService,
  ) { }

  /**
   * Initializes the component, fetching necessary data and setting up state transitions.
   */
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

  /**
   * Exports the order as a PDF document.
   */
  export(): void {
    if (!this.internalOrder().order.id) {
      this.snackBar.open('Bestellung hat keine gültige ID und kann nicht exportiert werden.', 'Schließen', { duration: 5000 });
      return;
    }

    this.ordersService.exportOrderToDocument(this.internalOrder().order.id?.toString()!).subscribe(blob => {
      const link = document.createElement('a');
      const objectUrl = URL.createObjectURL(blob);
      link.href = objectUrl;
      link.download = `Bestellung-${this.internalOrder().orderDisplay.besy_number}.pdf`;
      link.click();
      URL.revokeObjectURL(objectUrl);

      this.snackBar.open('Bestellung erfolgreich exportiert.', 'Schließen', { duration: 5000 });
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
      if (state === OrderStatus.APPROVED && !this.authService.isAuthorizedFor(environment.approveOrdersRole)) {
        continue;
      }
      let color;
      let style: MatButtonAppearance = 'elevated';
      switch (state) {
        case OrderStatus.DELETED:
          color = 'warn';
          style = 'outlined';
          break;
        case OrderStatus.APPROVED:
          color = 'accent';
          break;
        default:
          color = 'default';
      }

      this.stateChangeButtons.push({
        label: STATE_CHANGE_TO_NAMES.get(state) ?? `change to ${state}`,
        icon: STATE_ICONS.get(state) ?? '',
        tooltip: state === OrderStatus.DELETED ? 'Bestellung wirklich löschen?' : `Zu '${STATE_DISPLAY_NAMES.get(state) ?? state}' wechseln`,
        state,
        color,
        style
      });
    }
    const deletedButtonIndex = this.stateChangeButtons.findIndex(btn => btn.state === OrderStatus.DELETED);
    if (deletedButtonIndex !== -1) {
      const [deletedButton] = this.stateChangeButtons.splice(deletedButtonIndex, 1);
      this.stateChangeButtons.push(deletedButton);
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

    this.orderStateValidityService.canTransitionToState(this.internalOrder().order, newState).subscribe({
      next: () => {
        if (newState === OrderStatus.DELETED) {
          this.handleDeleteOrder();
        } else {
          this.ordersService.updateOrderState(this.internalOrder().order.id!, newState).then(() => {
            this.snackBar.open(`Bestellungsstatus erfolgreich von \
            '${STATE_DISPLAY_NAMES.get(this.internalOrder().order.status!)}' zu '${STATE_DISPLAY_NAMES.get(newState)}' geändert.`, 'Schließen', { duration: 5000 });
            this.updateDisplayedOrderState(newState);
          });
        }
      },
      error: (err) => this.createErrorToast(err, newState)
    });
  }

  /**
   * Highlights the first invalid field in the order form based on the ZodError.
   * @param error The ZodError containing validation issues.
   */
  highlightFirstInvalidField(error: ZodError) {
    const invalidField = error?.issues?.[0]?.path?.at(-1)?.toString();
    if (invalidField && document.querySelector(`.${environment.orderFieldClassPrefix}${invalidField}`)) {
      this.driverJsService.highlightElement(`.${environment.orderFieldClassPrefix}${invalidField}`, 'Fehler beim Statuswechsel', error.issues[0].message);
    }
  }

  /**
   * Creates and displays an error toast for invalid order state transitions.
   * @param error The ZodError containing validation issues.
   * @param newState The new state that was attempted to be set.
   */
  createErrorToast(error: ZodError, newState: OrderStatus) {
    const errorToast: ToastRequest = {
      message: ToastInvalidOrderComponent,
      inputs: {
        orderId: this.internalOrder().order.id!,
        targetState: newState,
        zodError: error
      },
      type: 'error'
    };
    this.toastService.addToast(errorToast);
  }

  /**
   * Updates the order state and resolves its subresources.
   * @param newState The new state to set.
   */
  updateDisplayedOrderState(newState: OrderStatus) {
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
        this.ordersService.deleteOrder(this.internalOrder().order.id!).then(() => {
          this.snackBar.open('Bestellung erfolgreich gelöscht.', 'Schließen', { duration: 5000 });
          this.router.navigate(['/orders']);
        });
      }
    });
  }

  /** Determines whether to show the edit button for a given section. */
  showEditButton(section: Section): boolean {
    if (!section.editTabId) return false;

    const status = this.internalOrder().order.status;
    return status === OrderStatus.IN_PROGRESS ||
      (status === OrderStatus.COMPLETED && section.editTabId === "Approvals");
  }

}
