import { Component, computed, DestroyRef, effect, inject, input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { GenericTableComponent } from '../../../../../../components/generic-table/generic-table.component';
import {
  ButtonColor,
  TableActionButton,
  TableColumn,
} from '../../../../../../models/generic-table';
import { ItemService } from '../../../../../../services/wrapper-services/item.service';
import { formatPriceToGerman } from '../../../../../../utils/formatting';
import { calculateTotalGrossPrice } from '../../../../../../utils/price-conversion.utils';
import { EditingFormattedOrder } from '../../../editing-formatted-order';
import { ItemDialogComponent } from '../item-dialog/item-dialog.component';
import { ItemTableModel } from '../item-table-model';
import { ItemTablemodelMapperService } from '../item-tablemodel-mapper.service';
import { OrderItemsStateService } from '../order-items-state.service';

@Component({
  selector: 'app-order-edit-items',
  imports: [GenericTableComponent, MatButtonModule, MatIconModule, MatDialogModule],
  templateUrl: './order-edit-items.component.html',
  styleUrl: './order-edit-items.component.scss',
})
export class OrderEditItemsComponent implements OnInit {
  /**
   * The `OrderItemsStateService` is injected here, but it is not provided in this component.
   * It is provided in the `OrderEditComponent`, which is the parent component of this tab.
   * This way, both the tab component and the save strategy share the same instance of the service,
   * allowing them to communicate and share state without knowing about each other.
   * This is important for maintaining a consistent state of the items being edited.
   * The service keeps track of added, updated, and deleted items, and provides methods to manipulate them.
   * The save strategy can then access this state when saving the order.
   */
  private readonly itemsState = inject(OrderItemsStateService);
  private readonly itemTableModelMapper = inject(ItemTablemodelMapperService);
  private readonly itemService = inject(ItemService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);

  order = input.required<EditingFormattedOrder>();

  protected readonly formGroup = input<FormGroup>(new FormGroup({}));

  protected readonly items = this.itemsState.items;
  protected readonly tableDataSource = computed(() => new MatTableDataSource(this.items()));

  protected readonly isEditable = computed(() => this.formGroup().enabled);

  // Compute the footer content for the items table, showing the total sum of all items
  footerContent = computed(() => {
    const sum = calculateTotalGrossPrice(this.items());
    const formatted = formatPriceToGerman(sum, this.order().currency?.value.code ?? 'EUR');

    return `Gesamt: ${formatted} (brutto)`;
  });

  protected readonly columns: TableColumn<ItemTableModel>[] = [
    { id: 'position', label: 'Pos.' },
    { id: 'article_id', label: 'Artikelnummer' },
    { id: 'name', label: 'Artikelbezeichnung' },
    { id: 'comment', label: 'Kommentar' },
    { id: 'quantity', label: 'Anzahl' },
    {
      id: 'price_per_unit',
      label: 'Stückpreis',
      footerContent: this.footerContent,
      formatter: row =>
        formatPriceToGerman(row.price_per_unit, this.order().currency?.value.code ?? 'EUR') ?? '',
    },
    { id: 'vat_type', label: 'MwSt. Typ' },
    {
      id: 'vat_value',
      label: 'MwSt.',
      formatter: row => (row.vat_value == null ? '' : `${row.vat_value.toFixed(1)}%`),
    },
  ];

  protected readonly actions: TableActionButton<ItemTableModel>[] = [
    {
      id: 'delete',
      label: 'Löschen',
      type: 'button',
      buttonType: 'filled',
      color: ButtonColor.WARN,
      action: item => this.itemsState.removeItem(item),
      disabled: !this.isEditable,
    },
    {
      id: 'edit',
      label: 'Bearbeiten',
      type: 'button',
      buttonType: 'filled',
      color: ButtonColor.PRIMARY,
      action: item => this.openUpdateItemDialog(item),
      disabled: !this.isEditable,
    },
  ];

  constructor() {
    effect(() => {
      if (this.itemsState.isDirty()) {
        this.formGroup().markAllAsDirty();
      }
    });
  }

  ngOnInit(): void {
    this.itemService.getAllItemsForOrder(this.order().id).subscribe(responseItems => {
      this.itemsState.resetItemList(
        this.itemTableModelMapper.mapItemResponseToTableModel(responseItems)
      );
    });
  }

  private openItemDialog(
    data: ItemTableModel | undefined,
    onClosed: (item: ItemTableModel | undefined) => void
  ): void {
    if (!this.isEditable()) {
      this.snackBar.open('Die Bestellung ist nicht editierbar.', 'OK', {
        duration: 3000,
      });
      return;
    }

    const dialogRef = this.dialog.open(ItemDialogComponent, {
      width: '60%',
      data,
    });

    dialogRef.afterClosed().subscribe(onClosed);

    this.destroyRef.onDestroy(() => {
      dialogRef.close();
    });
  }

  openAddItemDialog(): void {
    this.openItemDialog(undefined, newItem => {
      if (newItem) {
        this.itemsState.addItem(newItem);
      }
    });
  }

  openUpdateItemDialog(oldItem: ItemTableModel): void {
    this.openItemDialog(oldItem, updatedItem => {
      if (updatedItem) {
        console.log('Updating item:', oldItem, 'to', updatedItem);
        this.itemsState.updateItem(oldItem, updatedItem);
      }
    });
  }
}
