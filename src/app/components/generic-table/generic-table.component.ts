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
 * 
 * @example
 * <app-generic-table
 *  [dataSource]="dataSource"
 *  [columns]="columns"
 *  [displayedColumnIds]="displayedColumnIds"
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
export class GenericTableComponent {

  /**
   * The data source for the table, required to be provided.
   */
  dataSource = input.required<MatTableDataSource<any>>();

  /**
   * The columns to be displayed in the table, required to be provided.
   * Each column must have an `id` that matches the keys in the data source.
   */
  columns = input.required<TableColumn[]>();

  /**
   * The IDs of the columns to be displayed, optional.
   * If not provided, it will be derived from the columns input.
   */
  displayedColumnIds = input<string[]>();

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
  internalDisplayedColumnIds = signal<string[]>([]);

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
   * @param {any} row - The data row associated with the button click.
   */
  handleAction(button: TableActionButton, row: any) {
    button.action ? button.action(row) : console.warn(`No action defined for button: ${button.label}`);
  }

  /**
   * Sets up the internal state of the component based on the provided inputs.
   * If displayedColumnIds is not provided, it defaults to the IDs of the columns.
   * @private
   */
  private _setupInternals() {
    if (this.displayedColumnIds() !== undefined) {
      this.internalDisplayedColumnIds.set(this.displayedColumnIds()!);
    } else {
      this.internalDisplayedColumnIds.set(this.columns().map(c => c.id))
    }
    this.internalColumns.set(this.columns());
  }

  /**
   * Sets up the action buttons for the table.
   * If actions are provided, adds an 'actions' column to the displayed columns.
   * @private
   */
  private _setupActions() {
    if (this.actions().length > 0) {
      this.internalDisplayedColumnIds.update(ids => [...ids, 'actions']);
      this.internalColumns.update(cols => [...cols, { id: 'actions', label: 'Actions', isUnsortable: true }]);
    }
  }

}
