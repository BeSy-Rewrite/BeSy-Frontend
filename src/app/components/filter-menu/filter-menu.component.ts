import { Component, computed, effect, input, OnInit, output, signal, viewChild, WritableSignal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatChipListbox, MatChipSelectionChange, MatChipsModule } from "@angular/material/chips";
import { MatDividerModule } from "@angular/material/divider";
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { from } from 'rxjs';
import { CostCenterResponseDTO, CostCentersService, PersonResponseDTO, PersonsService, SupplierResponseDTO, SuppliersService, UserResponseDTO, UsersService } from '../../api';
import { ORDERS_FILTER_PRESETS } from '../../configs/order-filter-presets-config';
import { ORDERS_FILTER_MENU_CONFIG } from '../../configs/orders-filter-menu-config';
import { ordersTableConfig } from '../../configs/orders-table-config';
import { statusDisplayNames, statusIcons } from '../../display-name-mappings/status-names';
import { FilterChipData } from '../../models/filter-chip-data';
import { FilterDateRange } from '../../models/filter-date-range';
import { ActiveFilters } from '../../models/filter-menu-types';
import { OrdersFilterPreset } from '../../models/filter-presets';
import { FilterRange } from '../../models/filter-range';
import { TableColumn } from '../../models/generic-table';
import { OrderSubresourceResolverService } from '../../services/order-subresource-resolver.service';
import { ChipSelectionComponent } from '../chip-selection/chip-selection.component';
import { DateRangePickerComponent } from '../date-range-picker/date-range-picker.component';
import { RangeSelectionSliderComponent } from '../range-selection-slider/range-selection-slider.component';

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
    DateRangePickerComponent,
    ChipSelectionComponent,
    RangeSelectionSliderComponent,
  ],
  templateUrl: './filter-menu.component.html',
  styleUrl: './filter-menu.component.scss'
})
export class FilterMenuComponent implements OnInit {
  /** List of available filter presets. */
  filterPresets = ORDERS_FILTER_PRESETS;
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
  ordersTableColumns = input.required<TableColumn<any>[]>();
  selectedColumnsChanged = output<string[]>();

  /**
   * Creates an instance of FilterMenuComponent.
   * @param resourceResolver Service for resolving order subresources.
   */
  constructor(resourceResolver: OrderSubresourceResolverService,
    private readonly _snackBar: MatSnackBar
  ) {
    effect(() => {
      this.filtersChanged.emit(this.activeFilter());
    });

    this.selectedColumnsControl.valueChanges.subscribe(selected => {
      this.selectedColumnsChanged.emit(selected ?? []);
    });

    resourceResolver.resolveCurrentUserInPresets(this.filterPresets).subscribe({
      next: resolvedPresets => {
        this.filterPresets = resolvedPresets;
      },
      error: error => {
        this._snackBar.open('Fehler beim Laden der Filtervorgaben: ' + error.message, 'Schließen', { duration: 5000 });
      }
    });
  }

  /**
   * Angular lifecycle hook called on component initialization.
   * Sets up all filter data sources.
   */
  ngOnInit() {
    this.setupCostCenters();
    this.setupUsers();
    this.setupPersons();
    this.setupStatuses();
    this.setupSuppliers();
    this.setupBookingYears();
  }

  /**
   * Loads and sets up cost center chips.
   */
  setupCostCenters() {
    from(CostCentersService.getCostCenters()).subscribe((costCenters: CostCenterResponseDTO[]) => {
      const costCenterChips = costCenters.map(
        center => ({
          id: center.id,
          label: center.id + ' - ' + center.name,
          tooltip: this.getCostCenterTooltip(center)
        })
      );
      this.chips['primary_cost_center_id'].set(costCenterChips);
      this.chips['secondary_cost_center_id'].set(costCenterChips);
    });
  }

  /**
   * Loads and sets up user chips.
   */
  setupUsers() {
    from(UsersService.getAllUsers()).subscribe((users: UserResponseDTO[]) => {
      this.chips['owner_id'].set(users.map(user => ({
        id: user.id,
        label: this.composeFullName(user),
        tooltip: user.email
      })));
    });
  }

  /**
   * Loads and sets up person chips.
   */
  setupPersons() {
    from(PersonsService.getAllPersons()).subscribe((persons: PersonResponseDTO[]) => {
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
    });
  }

  /**
   * Sets up status chips using display names and icons.
   */
  setupStatuses() {
    this.chips['status'].set(
      Array.from(statusDisplayNames.entries()).map(([id, label]) => ({
        id: id,
        label: statusIcons.get(id) + ' ' + label,
        tooltip: ''
      }))
    );
  }

  /**
   * Loads and sets up supplier chips.
   */
  setupSuppliers() {
    from(SuppliersService.getAllSuppliers()).subscribe((suppliers: SupplierResponseDTO[]) => {
      this.chips['supplier_id'].set(
        suppliers.map(supplier => ({
          id: supplier.id,
          label: supplier.name ?? 'Unbenannter Lieferant',
          tooltip: supplier.comment
        }))
      );
    });
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
  }

  /**
   * Resets all filters and deselects all presets.
   */
  onReset() {
    this.activePresets = [];
    const selectedChips = this.presets().selected;
    if (Array.isArray(selectedChips)) {
      selectedChips.forEach(chip => chip.deselect());
    } else if (selectedChips) {
      selectedChips.deselect();
    }
    this.clearAllFilters();
  }

  /**
   * Clears all filters to their default state.
   */
  clearAllFilters() {
    Object.values(this.chips).forEach(chipSignal => {
      chipSignal.update(chips => chips.map(chip => (
        { ...chip, isSelected: false }
      )));
    });
    Object.values(this.dateRanges).forEach(dateRangeSignal => {
      dateRangeSignal.set({ start: null, end: null });
    });
    Object.entries(this.ranges).forEach(([key, rangeSignal]) => {
      const min = this.filters.find(f => f.key === key)?.data?.minValue ?? 0;
      const max = this.filters.find(f => f.key === key)?.data?.maxValue ?? 100;
      rangeSignal.set({ start: min, end: max });
    });
  }

  /**
   * Applies the selected preset to the filters.
   * @param evt Chip selection change event.
   * @param preset The filter preset to apply.
   */
  applyPreset(evt: MatChipSelectionChange, preset: OrdersFilterPreset) {
    if (this.activePresets.includes(preset)) {
      this.activePresets = this.activePresets.filter(p => p !== preset);
    }
    if (evt.selected) {
      this.activePresets.push(preset);
    }

    this.clearAllFilters();

    for (const preset of this.activePresets) {
      for (const presetItem of preset.appliedFilters) {
        if ('chipIds' in presetItem) {
          this.chips[presetItem.id]?.update(currentChips =>
            currentChips.map(chip =>
              presetItem.chipIds.includes(chip.id ?? '') ? { ...chip, isSelected: true } : chip));
        }
        else if ('dateRange' in presetItem) {
          this.dateRanges[presetItem.id].set(presetItem.dateRange);
        }
        else if ('range' in presetItem) {
          this.ranges[presetItem.id].set(presetItem.range);
        }
      }
    }
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
