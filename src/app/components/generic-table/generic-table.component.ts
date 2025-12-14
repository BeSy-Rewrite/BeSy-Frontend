import { DataSource } from '@angular/cdk/table';
import {
  AfterViewInit,
  Component,
  computed,
  input,
  isSignal,
  OnChanges,
  OnInit,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
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
 *
 * If custom, per cell, tooltips are needed, the datasources elements must follow this structure:
 *
 * interface DataWithTooltip {
 *   someKey: any;
 *   someOtherKey: any;
 *   tooltips: { [k in keyof Partial<Omit<DataWithTooltip, 'tooltips'>>]: string };
 * }
 *
 * See DisplayItem.ts
 */
@Component({
  selector: 'app-generic-table',
  imports: [
    MatTableModule,
    MatButtonModule,
    MatSortModule,
    MatPaginatorModule,
    MatDividerModule,
    MatTooltipModule,
  ],
  templateUrl: './generic-table.component.html',
  styleUrl: './generic-table.component.scss',
})
export class GenericTableComponent<T> implements OnInit, OnChanges, AfterViewInit {
  /**
   * The data source for the table, required to be provided.
   */
  dataSource = input.required<DataSource<T>>();

  /**
   * The columns to be displayed in the table, required to be provided.
   * Each column must have an `id` that matches the keys in the data source.
   */
  columns = input.required<TableColumn<T>[]>();

  /**
   * The action buttons to be displayed in the table, optional.
   * If not provided, no action buttons will be displayed.
   */
  actions = input<TableActionButton<T>[]>([]);

  /**
   * The number of items to display per page.
   * Defaults to 10 if not provided.
   */
  pageSize = input<number>(10);

  /**
   * The options for the number of items to display per page.
   * Defaults to [5, 10, 25, 100] if not provided.
   */
  pageSizeOptions = input<number[]>([5, 10, 25, 50, 100]);

  /**
   * Internal representation of the page size options, ensuring the current page size is included.
   */
  internalPageSizeOptions = computed(() => {
    const options = this.pageSizeOptions();
    if (!options.includes(this.pageSize())) {
      return [...options, this.pageSize()].sort((a, b) => a - b);
    }
    return options;
  });

  /**
   * Internal representation of the columns.
   */
  internalColumns = signal<TableColumn[]>([]);

  /**
   * Internal representation of the displayed column IDs.
   */
  displayedColumnIds = signal<string[]>([]);

  /**
   * Tracks the currently selected row internally.
   */
  selectedRow: T | null = null; // Undefined is not possible here, because then the event emitter doesn't emit anything. null works somehow

  rowClicked = output<T>();

  /**
   * Reference to the MatSort directive for enabling sorting functionality.
   */
  sort = viewChild.required(MatSort);

  paginator = viewChild.required(MatPaginator);

  showFooter = computed(() => this.internalColumns().some(col => col.footerContent !== undefined));

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
    this._setupDataSource();
  }

  /**
   * Lifecycle hook that is called after the view has been initialized.
   * It sets the sort property of the data source to enable sorting functionality.
   */
  ngAfterViewInit() {
    this._setupDataSource();
  }

  /**
   * Handles the action button click event.
   * @param {TableActionButton<T>} button - The action button that was clicked.
   * @param {T} row - The data row associated with the button click.
   */
  handleAction(button: TableActionButton<T>, row: T) {
    button.action
      ? button.action(row)
      : console.warn(`No action defined for button: ${button.label}`);
  }

  /**
   * Sets up the internal state of the component based on the provided inputs.
   * It filters out invisible columns and sets the displayed column IDs.
   * It also initializes the internal columns with the provided column definitions.
   * @private
   */
  private _setupInternals() {
    this.displayedColumnIds.set(
      this.columns()
        .filter(c => !c.isInvisible)
        .map(c => c.id)
    );
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
      this.internalColumns.update(cols => [
        ...cols,
        { id: 'actions', label: 'Actions', isUnsortable: true },
      ]);
    }
  }

  /**
   * Sets up the data source for the table.
   * Assigns the MatSort and MatPaginator directives to the data source.
   * @private
   */
  private _setupDataSource() {
    const ds = this.dataSource();
    // Only assign sort and paginator if they exist on the data source
    if (ds && this.sort() && this.paginator() && 'sort' in ds && 'paginator' in ds) {
      this._setupPaginator();
      ds.sort = this.sort();
      ds.paginator = this.paginator();
    }
  }

  /**
   * Configures the paginator with custom labels and settings.
   * @private
   */
  private _setupPaginator() {
    const paginator = this.paginator();
    if (paginator) {
      paginator._intl.itemsPerPageLabel = 'Einträge pro Seite';
      paginator._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
        if (length === 0 || pageSize === 0) {
          return `0 von ${length}`;
        }
        return `${page * pageSize + 1} - ${Math.min((page + 1) * pageSize, length)} von ${length}`;
      };
      paginator._intl.firstPageLabel = 'Erste Seite';
      paginator._intl.lastPageLabel = 'Letzte Seite';
      paginator._intl.nextPageLabel = 'Nächste Seite';
      paginator._intl.previousPageLabel = 'Vorherige Seite';
      paginator.pageSize = this.pageSize();
    }
  }

  /**
   * Handles the row click event.
   * Sets the selected row and emits the rowClicked event.
   * @param {T} row - The data row that was clicked.
   */
  onRowClick(row: T) {
    // If the same row is clicked again, deselect it
    if (this.selectedRow === row) {
      this.selectedRow = null;
      this.rowClicked.emit(null as any);
      return;
    }
    this.selectedRow = row;
    this.rowClicked.emit(row);
  }

  /**
   * Checks if an action button is disabled.
   * Supports both boolean and Signal<boolean> for the disabled property.
   * @param {TableActionButton<T>} button - The action button to check.
   * @returns {boolean} Whether the button is disabled.
   */
  isButtonDisabled(button: TableActionButton<T>): boolean {
    if (button.disabled === undefined) {
      return false;
    }
    if (isSignal(button.disabled)) {
      return button.disabled();
    }
    return button.disabled;
  }
}
