import { Component, computed, effect, input, OnInit, output, signal, viewChild, WritableSignal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatChipListbox, MatChipSelectionChange, MatChipsModule } from "@angular/material/chips";
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from "@angular/material/divider";
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { debounceTime, finalize, forkJoin, from, Observable, of, tap } from 'rxjs';
import { CostCenterResponseDTO, PersonResponseDTO, SupplierResponseDTO, UserResponseDTO } from '../../api';
import { ORDERS_FILTER_PRESETS } from '../../configs/order-filter-presets-config';
import { ORDERS_FILTER_MENU_CONFIG } from '../../configs/orders-filter-menu-config';
import { ordersTableConfig } from '../../configs/orders-table-config';
import { STATE_DISPLAY_NAMES, STATE_ICONS } from '../../display-name-mappings/status-names';
import { FilterChipData } from '../../models/filter-chip-data';
import { FilterDateRange } from '../../models/filter-date-range';
import { ActiveFilters } from '../../models/filter-menu-types';
import { ChipFilterPreset, DateRangeFilterPreset, OrdersFilterPreset, RangeFilterPreset } from '../../models/filter-presets';
import { FilterRange, isNumericRange } from '../../models/filter-range';
import { TableColumn } from '../../models/generic-table';
import { OrderSubresourceResolverService } from '../../services/order-subresource-resolver.service';
import { CostCenterWrapperService } from '../../services/wrapper-services/cost-centers-wrapper.service';
import { PersonsWrapperService } from '../../services/wrapper-services/persons-wrapper.service';
import { SuppliersWrapperService } from '../../services/wrapper-services/suppliers-wrapper.service';
import { UsersWrapperService } from '../../services/wrapper-services/users-wrapper.service';
import { ChipSelectionComponent } from '../chip-selection/chip-selection.component';
import { DateRangePickerComponent } from '../date-range-picker/date-range-picker.component';
import { FilterPresetsSaveComponent } from '../filter-preset-save/filter-presets-save.component';
import { FilterPresetsEditComponent } from '../filter-presets-edit/filter-presets-edit.component';
import { RangeSelectionSliderComponent } from '../range-selection-slider/range-selection-slider.component';

export const SAVED_FILTER_PRESETS_KEY = 'savedPresets';

/**
 * Component for displaying and managing the filter menu for orders.
 */
@Component({
  selector: 'app-filter-menu',
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatButtonToggleModule,
    MatChipsModule,
    MatExpansionModule,
    MatDividerModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    DateRangePickerComponent,
    ChipSelectionComponent,
    RangeSelectionSliderComponent,
  ],
  templateUrl: './filter-menu.component.html',
  styleUrl: './filter-menu.component.scss'
})
export class FilterMenuComponent implements OnInit {

  /** Initial filter preset to apply on component load. */
  initialPreset = input<OrdersFilterPreset | undefined>(undefined);

  /** List of available filter presets. */
  filterPresets = signal<OrdersFilterPreset[]>([]);
  defaultPresets = [...ORDERS_FILTER_PRESETS];
  /** Currently active filter presets. */
  private activePresets: OrdersFilterPreset[] = [];

  /** Emits when filters have changed. */
  filtersChanged = output<ActiveFilters>();
  /**
   * Computed signal representing the currently active filters.
   */
  activeFilter = computed<ActiveFilters>(() => {
    return {
      primary_cost_center_id: this.chips['primary_cost_center_id']().filter(chip => chip.isSelected),
      secondary_cost_center_id: this.chips['secondary_cost_center_id']().filter(chip => chip.isSelected),
      owner_id: this.chips['owner_id']().filter(chip => chip.isSelected),
      status: this.chips['status']().filter(chip => chip.isSelected),
      delivery_person_id: this.chips['delivery_person_id']().filter(chip => chip.isSelected),
      invoice_person_id: this.chips['invoice_person_id']().filter(chip => chip.isSelected),
      queries_person_id: this.chips['queries_person_id']().filter(chip => chip.isSelected),
      supplier_id: this.chips['supplier_id']().filter(chip => chip.isSelected),
      created_date: this.dateRanges['created_date'](),
      last_updated_time: this.dateRanges['last_updated_time'](),
      quote_price: this.ranges['quote_price'](),
      booking_year: this.chips['booking_year']().filter(chip => chip.isSelected)
    };
  });

  /**
   * Used to store the last active filters as a preset in localStorage
   * so that they can be reapplied on page reload
   * without needing to select a preset manually
   */
  readonly activeFiltersAsPreset: Observable<OrdersFilterPreset>;
  readonly activeFiltersSignal = computed<OrdersFilterPreset>(() => {
    return {
      label: 'activeFilters',
      appliedFilters: Object.entries(this.activeFilter()).map(([key, value]) => {
        const typedKey = key as keyof ActiveFilters;
        if (Array.isArray(value)) {
          return {
            id: typedKey,
            chipIds: value
              .filter((v: FilterChipData) => v.id !== undefined && v.id !== null)
              .map((v: FilterChipData) => v.id)
          } as ChipFilterPreset;
        } else if (isNumericRange(value)) {
          return {
            id: typedKey,
            range: value
          } as RangeFilterPreset;
        }
        return {
          id: typedKey,
          dateRange: value as FilterDateRange
        } as DateRangeFilterPreset;
      })
    };
  });

  /** Configuration for all available filters in the menu. */
  filters = ORDERS_FILTER_MENU_CONFIG;
  /**
   * Signals holding the chip data for each filter key.
   */
  chips: { [key: string]: WritableSignal<FilterChipData[]>; } = {
    'primary_cost_center_id': signal<FilterChipData[]>([]),
    'secondary_cost_center_id': signal<FilterChipData[]>([]),
    'owner_id': signal<FilterChipData[]>([]),
    'status': signal<FilterChipData[]>([]),
    'delivery_person_id': signal<FilterChipData[]>([]),
    'invoice_person_id': signal<FilterChipData[]>([]),
    'queries_person_id': signal<FilterChipData[]>([]),
    'supplier_id': signal<FilterChipData[]>([]),
    'booking_year': signal<FilterChipData[]>([])
  };
  /**
   * Signals holding the date range data for each filter key.
   */
  dateRanges: { [key: string]: WritableSignal<FilterDateRange>; } = {
    'created_date': signal<FilterDateRange>({ start: null, end: null }),
    'last_updated_time': signal<FilterDateRange>({ start: null, end: null })
  };
  /**
   * Signals holding the range data for each filter key.
   */
  ranges: { [key: string]: WritableSignal<FilterRange>; } = {
    'quote_price': signal<FilterRange>({ start: 0, end: 10000 })
  };

  /** Reference to the accordion UI element. */
  accordion = viewChild.required(MatAccordion);
  /** Reference to the chip listbox for presets. */
  presets = viewChild.required<MatChipListbox>('presets');

  /** Control for the selected columns in the table. */
  selectedColumnsControl = new FormControl(ordersTableConfig.filter(col => !col.isInvisible).map(col => col.id));
  /** Signal holding all available table columns. */
  ordersTableColumns = input.required<TableColumn<any>[]>();
  /** Emits when the selected columns have changed. */
  selectedColumnsChanged = output<string[]>();

  /**
   * Creates an instance of FilterMenuComponent.
   * @param resourceResolver Service for resolving order subresources.
   */
  constructor(
    resourceResolver: OrderSubresourceResolverService,
    private readonly _snackBar: MatSnackBar,
    private readonly costCentersService: CostCenterWrapperService,
    private readonly usersService: UsersWrapperService,
    private readonly personsService: PersonsWrapperService,
    private readonly suppliersService: SuppliersWrapperService,
    private readonly router: Router,
    readonly dialog: MatDialog
  ) {
    effect(() => {
      this.filtersChanged.emit(this.activeFilter());
    });

    resourceResolver.resolveCurrentUserInPresets(this.defaultPresets).pipe(
      finalize(() => {
        this.filterPresets.set([...this.defaultPresets]);
        this.loadSavedFilterPresets();
      })
    ).subscribe({
      next: resolvedPresets => {
        this.defaultPresets = resolvedPresets;
      },
      error: error => {
        console.error('Error loading filter presets:', error);
        this._snackBar.open('Fehler beim Laden der Filtervorgaben: ' + error.message, 'Schließen', { duration: 5000 });

        this.defaultPresets = this.defaultPresets.filter(preset =>
          !preset.appliedFilters.some(filter => {
            if ('chipIds' in filter) {
              return filter.chipIds?.includes('CURRENT_USER')
            }
            return false;
          })
        );
      }
    });

    this.activeFiltersAsPreset = toObservable(this.activeFiltersSignal);
  }

  /**
   * Angular lifecycle hook called on component initialization.
   * Sets up all filter data sources.
   */
  ngOnInit() {
    forkJoin([
      this.setupCostCenters(),
      this.setupUsers(),
      this.setupPersons(),
      this.setupStatuses(),
      this.setupSuppliers(),
      this.setupBookingYears(),
    ]).subscribe(() => {
      this.setupPersistentFilters();
    });
    this.setupPersistentColumnSelection();
  }

  /**
   * Sets up persistent filters by loading from localStorage and saving changes.
   * Applies saved filters on initialization and updates localStorage on changes.
   */
  private setupPersistentFilters() {
    if (this.initialPreset()) {
      this.applyPreset(this.initialPreset()!);
    } else {
      this.loadFilterPresetFromLocalStorage();
    }

    this.activeFiltersAsPreset.pipe(
      debounceTime(50)
    ).subscribe(preset => {
      localStorage.setItem('activeFilters', JSON.stringify(preset));
    });
  }

  /**
   * Loads the filter preset from localStorage.
   */
  private loadFilterPresetFromLocalStorage() {
    const lastActiveFilters = localStorage.getItem('activeFilters');
    if (lastActiveFilters) {
      try {
        const preset = this.parsePreset(lastActiveFilters);
        this.clearAllFilters();
        this.applyPreset(preset);
      } catch (e) {
        console.error('Failed to parse last active filters from localStorage:', e);
        localStorage.removeItem('activeFilters');
        this._snackBar.open('Fehler beim Laden der letzten Filtereinstellungen. Die gespeicherten Einstellungen wurden zurückgesetzt.', 'Schließen', { duration: 5000 });
      }
    }
  }

  /**
   * Fixes date range by converting string dates to Date objects.
   * @param date The date range to fix.
   * @returns The fixed date range with Date objects.
   */
  private fixDateRange(date: FilterDateRange): FilterDateRange {
    return {
      start: typeof date.start === 'string' ? new Date(Date.parse(date.start)) : date.start,
      end: typeof date.end === 'string' ? new Date(Date.parse(date.end)) : date.end
    };
  }

  /**
   * Sets up persistent column selection by saving and loading from localStorage.
   */
  private setupPersistentColumnSelection() {
    this.selectedColumnsControl.valueChanges.subscribe(selected => {
      localStorage.setItem('selectedColumns', JSON.stringify(selected ?? []));
      this.selectedColumnsChanged.emit(selected ?? []);
    });

    const lastSelectedColumns = localStorage.getItem('selectedColumns');
    if (lastSelectedColumns) {
      this.selectedColumnsControl.setValue(JSON.parse(lastSelectedColumns));
    }
  }

  /**
   * Loads and sets up cost center chips.
   */
  setupCostCenters() {
    return from(this.costCentersService.getAllCostCenters()).pipe(
      tap((costCenters: CostCenterResponseDTO[]) => {
        const costCenterChips = costCenters.map(
          center => ({
            id: center.id,
            label: center.id + ' - ' + center.name,
            tooltip: this.getCostCenterTooltip(center)
          })
        );
        this.chips['primary_cost_center_id'].set(costCenterChips);
        this.chips['secondary_cost_center_id'].set(costCenterChips.map(chip => ({ ...chip })));
      })
    );
  }

  /**
   * Loads and sets up user chips.
   */
  setupUsers() {
    return from(this.usersService.getAllUsers()).pipe(
      tap((users: UserResponseDTO[]) => {
        this.chips['owner_id'].set(users.map(user => ({
          id: user.id,
          label: this.composeFullName(user),
          tooltip: user.email
        })));
      })
    );
  }

  /**
   * Loads and sets up person chips.
   */
  setupPersons() {
    return from(this.personsService.getAllPersons()).pipe(
      tap((persons: PersonResponseDTO[]) => {
        const personChips = persons.map(person => {
          const tooltipParts = [];
          if (person.comment) tooltipParts.push(person.comment);
          if (person.email) tooltipParts.push(person.email);
          if (person.phone) tooltipParts.push(person.phone);

          return {
            id: person.id,
            label: this.composeFullName(person),
            tooltip: tooltipParts.join(' - ')
          };
        });
        this.chips['queries_person_id'].set(personChips);
        this.chips['invoice_person_id'].set(personChips);
        this.chips['delivery_person_id'].set(personChips);
      })
    );
  }

  /**
   * Sets up status chips using display names and icons.
   */
  setupStatuses() {
    this.chips['status'].set(
      Array.from(STATE_DISPLAY_NAMES.entries()).map(([id, label]) => ({
        id: id,
        label: STATE_ICONS.get(id) + ' ' + label,
        tooltip: ''
      }))
    );
    return of(undefined);
  }

  /**
   * Loads and sets up supplier chips.
   */
  setupSuppliers() {
    return from(this.suppliersService.getAllSuppliers()).pipe(
      tap((suppliers: SupplierResponseDTO[]) => {
        this.chips['supplier_id'].set(
          suppliers.map(supplier => ({
            id: supplier.id,
            label: supplier.name ?? 'Unbenannter Lieferant',
            tooltip: supplier.comment
          }))
        );
      })
    );
  }

  /**
   * Sets up booking year chips.
   */
  setupBookingYears() {
    const currentYear = new Date().getFullYear();
    const bookingYears = Array.from({ length: currentYear - 1999 }, (_, i) => (currentYear - i));
    this.chips['booking_year'].set(bookingYears.map(year => ({
      id: year.toString().slice(-2),
      label: year.toString(),
      tooltip: ''
    })));
    return of(undefined);
  }

  /**
   * Saves the current filters as a preset.
   */
  saveCurrentFiltersAsPreset() {
    const dialogRef = this.dialog.open(FilterPresetsSaveComponent, {
      data: {
        name: 'Benutzerdefinierte Filter',
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        const currentPreset = { ...this.activeFiltersSignal() };
        console.log(result());
        currentPreset.label = result();
        console.log('Saved Preset:', currentPreset);

        const savedPresets = JSON.parse(localStorage.getItem(SAVED_FILTER_PRESETS_KEY) || '{}');
        savedPresets[currentPreset.label.toLowerCase().replaceAll(' ', '_')] = currentPreset;
        localStorage.setItem(SAVED_FILTER_PRESETS_KEY, JSON.stringify(savedPresets));

        this.loadSavedFilterPresets();
      }
    });
  }

  /**
   * Opens the filter presets edit dialog.
   */
  editFilterPresets() {
    const dialogRef = this.dialog.open(FilterPresetsEditComponent);
    dialogRef.afterClosed().subscribe(result => {
      this.loadSavedFilterPresets();
    });
  }

  /**
   * Loads saved filter presets from local storage.
   */
  loadSavedFilterPresets() {
    const savedPresets: OrdersFilterPreset[] = Object.values(JSON.parse(localStorage.getItem(SAVED_FILTER_PRESETS_KEY) ?? '{}'));
    this.filterPresets.set([...this.defaultPresets, ...savedPresets.map(preset => this.parsePreset(preset))]);
  }

  /**
   * Resets all filters and deselects all presets.
   */
  onReset() {
    this.activePresets = [];
    const selectedChips = this.presets().selected;
    if (Array.isArray(selectedChips)) {
      for (const chip of selectedChips) {
        chip.deselect();
      }
    } else if (selectedChips) {
      selectedChips.deselect();
    }
    this.clearAllFilters();
    this.resetSelectedColumns();
  }

  /**
   * Clears all filters to their default state.
   */
  clearAllFilters() {
    for (const chipSignal of Object.values(this.chips)) {
      chipSignal.update(chips => chips.map(chip => (
        { ...chip, isSelected: false }
      )));
    }
    for (const dateRangeSignal of Object.values(this.dateRanges)) {
      dateRangeSignal.set({ start: null, end: null });
    }
    for (const [key, rangeSignal] of Object.entries(this.ranges)) {
      const min = this.filters.find(f => f.key === key)?.data?.minValue ?? 0;
      const max = this.filters.find(f => f.key === key)?.data?.maxValue ?? 100;
      rangeSignal.set({ start: min, end: max });
    }
  }

  /** Resets selected columns to default visible columns. */
  resetSelectedColumns() {
    const defaultColumns = ordersTableConfig.filter(col => !col.isInvisible).map(col => col.id);
    this.selectedColumnsControl.setValue(defaultColumns);
  }

  /**
   * Applies the selected preset to the filters.
   * @param evt Chip selection change event.
   * @param preset The filter preset to apply.
   */
  onPresetSelectionChange(evt: MatChipSelectionChange, preset: OrdersFilterPreset) {
    if (!evt.isUserInput) {
      return;
    }
    if (this.activePresets.includes(preset)) {
      this.activePresets = this.activePresets.filter(p => p !== preset);
    }
    if (evt.selected) {
      this.activePresets.push(preset);
    } else {
      this.removePreset(preset);
    }

    for (const preset of this.activePresets) {
      this.applyPreset(preset);
    }
  }

  /**
   * Applies a filter preset to the current filters.
   * @param preset The filter preset to apply.
   */
  applyPreset(preset: OrdersFilterPreset) {
    for (const appliedFilter of preset.appliedFilters) {
      if ('chipIds' in appliedFilter) {
        this.chips[appliedFilter.id]?.update(currentChips =>
          currentChips.map(chip =>
            appliedFilter.chipIds.includes(chip.id ?? '') ? { ...chip, isSelected: true } : chip));
      }
      else if ('dateRange' in appliedFilter) {
        this.dateRanges[appliedFilter.id].set(appliedFilter.dateRange);
      }
      else if ('range' in appliedFilter) {
        this.ranges[appliedFilter.id].set(appliedFilter.range);
      }
    }
  }

  /**
   * Removes a filter preset from the active presets.
   * @param preset The filter preset to remove.
   */
  removePreset(preset: OrdersFilterPreset) {
    for (const appliedFilter of preset.appliedFilters) {
      if ('chipIds' in appliedFilter) {
        this.chips[appliedFilter.id]?.update(currentChips =>
          currentChips.map(chip =>
            appliedFilter.chipIds.includes(chip.id ?? '') ? { ...chip, isSelected: false } : chip));
      } else if ('dateRange' in appliedFilter) {
        this.dateRanges[appliedFilter.id].set({ start: null, end: null });
      } else if ('range' in appliedFilter) {
        const min = this.filters.find(f => f.key === appliedFilter.id)?.data?.minValue ?? 0;
        const max = this.filters.find(f => f.key === appliedFilter.id)?.data?.maxValue ?? 100;
        this.ranges[appliedFilter.id].set({ start: min, end: max });
      }
    }
  }

  parsePreset(presetString: string | OrdersFilterPreset): OrdersFilterPreset {
    let preset: OrdersFilterPreset;
    if (typeof presetString === 'string') {
      preset = JSON.parse(presetString);
    } else {
      preset = presetString;
    }
    for (const filter of preset.appliedFilters) {
      if (this.dateRanges[filter.id] !== undefined && 'dateRange' in filter) {
        filter.dateRange = this.fixDateRange(filter.dateRange);
      }
    }
    return preset;
  }

  /**
   * Checks if a preset is currently applied based on active filters.
   * @param preset The filter preset to check.
   * @returns True if the preset is applied, false otherwise.
   */
  isPresetApplied(preset: OrdersFilterPreset): boolean {
    return preset.appliedFilters.every(presetFilter => {
      const activeValue = this.activeFilter()[presetFilter.id];

      switch (true) {
        case presetFilter === undefined:
          return false;

        case 'chipIds' in presetFilter:
          return presetFilter.chipIds.every(id => activeValue && (activeValue as FilterChipData[])
            .some(chip => chip.id === id));

        case 'dateRange' in presetFilter:
          if (activeValue && typeof activeValue === 'object' && 'start' in activeValue && 'end' in activeValue) {
            return activeValue.start === presetFilter.dateRange.start &&
              activeValue.end === presetFilter.dateRange.end;
          }
          return false;

        case 'range' in presetFilter:
          if (activeValue && typeof activeValue === 'object' && 'start' in activeValue && 'end' in activeValue) {
            return activeValue.start === presetFilter.range.start &&
              activeValue.end === presetFilter.range.end;
          }
          return false;

        default:
          return false;
      }
    });
  }

  /**
   * Returns a tooltip string for a cost center.
   * @param center The cost center DTO.
   * @returns Tooltip string.
   */
  getCostCenterTooltip(center: CostCenterResponseDTO): string {
    const tooltipParts = [];
    if (center.comment) tooltipParts.push(center.comment);
    if (center.begin_date) tooltipParts.push('Ab ' + center.begin_date);
    if (center.end_date) tooltipParts.push('Bis ' + center.end_date);

    return tooltipParts.join(' - ');
  }

  /**
   * Composes a full name from a person or user DTO.
   * @param person The person or user DTO.
   * @returns Full name string.
   */
  composeFullName(person: PersonResponseDTO | UserResponseDTO): string {
    const names = [];
    if (person.name) names.push(person.name);
    if (person.surname) names.push(person.surname);

    return names.join(' ');
  }

}
