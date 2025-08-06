import { Component, input, signal, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { TableActionButton, TableColumn } from '../../models/generic-table';

/**
 * A generic table component for displaying tabular data with optional action buttons.
 *
 * This component uses Angular Material's table, sort, and button modules to provide a flexible and customizable table.
 * It supports dynamic columns, sorting, and action buttons.
 * The type parameter `T` of dataSource and columns must be the same.
 *
 * @example
 * <app-generic-table
 *  [dataSource]="dataSource"
 *  [columns]="columns"
 *  [actions]="actions">
 * </app-generic-table>
 */
@Component({
  selector: 'app-generic-table',
  imports: [
    MatTableModule,
    MatButtonModule,
    MatSortModule,
    MatPaginatorModule
  ],
  templateUrl: './generic-table.component.html',
  styleUrl: './generic-table.component.css'
})
export class GenericTableComponent<T> {

  /**
   * The data source for the table, required to be provided.
   */
  dataSource = input.required<MatTableDataSource<T>>();

  /**
   * The columns to be displayed in the table, required to be provided.
   * Each column must have an `id` that matches the keys in the data source.
   */
  columns = input.required<TableColumn<T>[]>();

  /**
   * The action buttons to be displayed in the table, optional.
   * If not provided, no action buttons will be displayed.
   */
  actions = input<TableActionButton[]>([]);

  /**
   * Internal representation of the columns.
   */
  internalColumns = signal<TableColumn[]>([]);

  /**
   * Internal representation of the displayed column IDs.
   */
  displayedColumnIds = signal<string[]>([]);

  /**
   * Reference to the MatSort directive for enabling sorting functionality.
   */
  @ViewChild(MatSort) sort!: MatSort;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  /**
   * Lifecycle hook that is called after the component has been initialized.
   * It sets up the internal state of the component and initializes action buttons.
   */
  ngOnInit() {
    this.ngOnChanges();
  }

  /**
   * Lifecycle hook that is called when any data-bound input properties change.
   * It sets up the internal state of the component and initializes action buttons.
   */
  ngOnChanges() {
    this._setupInternals();
    this._setupActions();
  }

  /**
   * Lifecycle hook that is called after the view has been initialized.
   * It sets the sort property of the data source to enable sorting functionality.
   */
  ngAfterViewInit() {
    this.dataSource().sort = this.sort;
    this.dataSource().paginator = this.paginator;
    this.paginator._intl.itemsPerPageLabel = 'Einträge pro Seite';
  }

  /**
   * Handles the action button click event.
   * @param {TableActionButton} button - The action button that was clicked.
   * @param {T} row - The data row associated with the button click.
   */
  handleAction(button: TableActionButton, row: T) {
    button.action ? button.action(row) : console.warn(`No action defined for button: ${button.label}`);
  }

  /**
   * Sets up the internal state of the component based on the provided inputs.
   * It filters out invisible columns and sets the displayed column IDs.
   * It also initializes the internal columns with the provided column definitions.
   * @private
   */
  private _setupInternals() {
    this.displayedColumnIds.set(this.columns()
      .filter(c => !c.isInvisible)
      .map(c => c.id));
    this.internalColumns.set(this.columns());
  }

  /**
   * Sets up the action buttons for the table.
   * If actions are provided, adds an 'actions' column to the displayed columns.
   * @private
   */
  private _setupActions() {
    if (this.actions().length > 0) {
      this.displayedColumnIds.update(ids => [...ids, 'actions']);
      this.internalColumns.update(cols => [...cols, { id: 'actions', label: 'Actions', isUnsortable: true }]);
    }
  }

}
