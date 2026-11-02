import { AfterViewInit, Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';
import { ConfirmDialogComponent } from '../../../../components/confirm-dialog/confirm-dialog.component';
import { OrderDocumentsComponent } from '../../../../components/documents/order-documents/order-documents.component';
import { StateDisplayComponent } from '../../../../components/state-display/state-display.component';
import { DisplayableOrder } from '../../../../models/displayable-order';
import { EditingFormattedOrder } from '../editing-formatted-order';
import { ItemsTabSaveStrategy } from '../saving/strategies/items-tab-save-strategy';
import { TAB_SAVE_STRATEGY, TabSaveStrategy } from '../saving/tab-save-strategy';
import { OrderEditGeneralComponent } from '../tabs/order-edit-general/order-edit-general.component';
import { OrderEditItemsComponent } from '../tabs/order-edit-items/order-edit-items/order-edit-items.component';
import { OrderItemsStateService } from '../tabs/order-edit-items/order-items-state.service';
import { ORDER_EDITING_TABS, OrderEditTabIdentifier } from '../tabs/order-edit-tab.config';

@Component({
  selector: 'app-order-edit',
  imports: [
    RouterModule,
    MatDividerModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    StateDisplayComponent,
    OrderEditGeneralComponent,
    OrderDocumentsComponent,
    OrderEditItemsComponent,
  ],
  providers: [
    OrderItemsStateService,
    { provide: TAB_SAVE_STRATEGY, useClass: ItemsTabSaveStrategy, multi: true },
  ],
  templateUrl: './order-edit.component.html',
  styleUrl: './order-edit.component.scss',
})
export class OrderEditComponent implements OnInit, AfterViewInit {
  protected readonly tabIdentifiers = OrderEditTabIdentifier;
  protected readonly tabs = ORDER_EDITING_TABS;

  private readonly strategies = inject(TAB_SAVE_STRATEGY) as TabSaveStrategy[]; // multi -> Array
  private readonly formBuilder = inject(FormBuilder);
  private readonly dialog = inject(MatDialog);

  protected readonly order = input.required<DisplayableOrder>();
  /**
   * Formatted for use in FormGroups.
   * Autocompletable values are formatted as {@link AutocompleteOption}.
   */
  protected readonly formattedOrder = input.required<EditingFormattedOrder>();

  protected readonly selectedTabIndex = signal(0);
  private readonly selectedTabIdentifier = computed(
    () => this.tabs[this.selectedTabIndex()].identifier
  );

  protected formGroup!: FormGroup;

  ngOnInit() {
    const groups: Partial<Record<OrderEditTabIdentifier, FormGroup>> = {};
    for (const tab of this.tabs) {
      groups[tab.identifier] = this.formBuilder.group({});
    }
    this.formGroup = this.formBuilder.group(groups);
  }

  ngAfterViewInit() {
    this.setEditabiliy();
  }

  private setEditabiliy() {
    const state = this.order().order.status;
    if (!state) {
      console.error('Order status is undefined.');
      return;
    }

    for (const tab of this.tabs) {
      const isEnabled = tab.enabledStates.includes(state);
      const tabFormGroup = this.formGroup.get(tab.identifier) as FormGroup;
      if (!tabFormGroup) {
        console.error(`Form group for tab ${tab.identifier} not found.`);
      }
      isEnabled ? tabFormGroup.enable() : tabFormGroup.disable();
    }
  }

  protected saveTab(identifier: OrderEditTabIdentifier = this.selectedTabIdentifier()): void {
    const strategy = this.strategies.find(s => s.tabIdentifier === identifier);
    if (!strategy) {
      console.error(`Keine Save-Strategy für Tab "${identifier}" registriert.`);
      return;
    }

    const tabFormGroup = this.formGroup.get(identifier) as FormGroup;
    strategy.save(tabFormGroup, this.formattedOrder()).subscribe({
      next: patch => this.applyOrderPatch(patch),
      error: err => console.error(`Speichern von Tab "${identifier}" fehlgeschlagen:`, err),
    });
    tabFormGroup.markAsPristine();
  }

  protected saveAll(): void {
    // Hinweis: Für echte Atomarität ggf. concatMap/forkJoin statt sequenziellem Aufruf verwenden.
    for (const tab of this.tabs) {
      this.saveTab(tab.identifier);
    }
    this.formGroup.markAsPristine();
  }

  private applyOrderPatch(patch: Partial<EditingFormattedOrder>): void {
    if (Object.keys(patch).length === 0) return;
    // z. B. formattedOrder-Signal neu befüllen / betroffene Felder in den Form-Groups patchen
  }

  protected revertTab(identifier: OrderEditTabIdentifier = this.selectedTabIdentifier()): void {
    const strategy = this.strategies.find(s => s.tabIdentifier === identifier);
    if (!strategy) {
      console.error(`Keine Revert-Strategy für Tab "${identifier}" registriert.`);
      return;
    }

    strategy.revert();
  }

  protected revertAll(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Alle Änderungen zurücksetzen',
        message:
          'Möchten Sie wirklich alle Änderungen zurücksetzen? Alle ungespeicherten Änderungen gehen verloren.',
        confirmButtonText: 'Zurücksetzen',
        cancelButtonText: 'Abbrechen',
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        for (const tab of this.tabs) {
          this.revertTab(tab.identifier);
        }
      }
    });
  }

  protected startTour(): void {
    console.log('Starting tour...');
  }
}
