import {
  afterNextRender,
  Component,
  computed,
  effect,
  Injector,
  input,
  OnInit,
  output,
  signal,
  viewChild,
  WritableSignal,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatChipListbox, MatChipSelectionChange, MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { debounceTime, first, forkJoin, from, of, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  CostCenterResponseDTO,
  PersonResponseDTO,
  SupplierResponseDTO,
  UserResponseDTO,
} from '../../../api-services-v2';
import {
  LAST_ACTIVE_FILTERS_KEY,
  ORDERS_FILTER_PRESETS,
} from '../../../configs/orders-table/order-filter-presets-config';
import { ORDERS_FILTER_MENU_CONFIG } from '../../../configs/orders-table/orders-filter-menu-config';
import { ordersTableConfig } from '../../../configs/orders-table/orders-table-config';
import {
  STATE_DISPLAY_NAMES,
  STATE_ICONS,
  USED_STATES,
} from '../../../display-name-mappings/status-names';
import { FilterChipData } from '../../../models/filter/filter-chip-data';
import { FilterDateRange } from '../../../models/filter/filter-date-range';
import { ActiveFilters } from '../../../models/filter/filter-menu-types';
import {
  ChipFilterPreset,
  DateRangeFilterPreset,
  FilterPresetType,
  OrdersFilterPreset,
  RangeFilterPreset,
} from '../../../models/filter/filter-presets';
import { FilterRange, isNumericRange } from '../../../models/filter/filter-range';
import { TableColumn } from '../../../models/generic-table';
import { DriverJsTourService } from '../../../services/driver.js-tour.service';
import { UserPreferencesService } from '../../../services/user-preferences.service';
import { CostCenterWrapperService } from '../../../services/wrapper-services/cost-centers-wrapper.service';
import { PersonsWrapperService } from '../../../services/wrapper-services/persons-wrapper.service';
import { SuppliersWrapperService } from '../../../services/wrapper-services/suppliers-wrapper.service';
import { UsersWrapperService } from '../../../services/wrapper-services/users-wrapper.service';
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
    MatTooltipModule,
    DateRangePickerComponent,
    ChipSelectionComponent,
    RangeSelectionSliderComponent,
  ],
  templateUrl: './filter-menu.component.html',
  styleUrl: './filter-menu.component.scss',
})
export class FilterMenuComponent implements OnInit {
  /** Initial filter preset to apply on component load. */
  initialPreset = input<OrdersFilterPreset | undefined>(undefined);

  lastActiveFilters = signal<OrdersFilterPreset | undefined>(undefined);
  /** List of available filter presets. */
  filterPresets = signal<OrdersFilterPreset[]>([]);
  /** Currently active filter presets. */
  private activePresets: OrdersFilterPreset[] = [];

  /** Emits when filters have changed. */
  filtersChanged = output<ActiveFilters>();
  /**
   * Computed signal representing the currently active filters.
   */
  activeFilters = computed<ActiveFilters>(() => {
    return {
      primary_cost_center_id: this.chips['primary_cost_center_id']().filter(
        chip => chip.isSelected
      ),
      secondary_cost_center_id: this.chips['secondary_cost_center_id']().filter(
        chip => chip.isSelected
      ),
      owner_id: this.chips['owner_id']().filter(chip => chip.isSelected),
      status: this.chips['status']().filter(chip => chip.isSelected),
      delivery_person_id: this.chips['delivery_person_id']().filter(chip => chip.isSelected),
      invoice_person_id: this.chips['invoice_person_id']().filter(chip => chip.isSelected),
      queries_person_id: this.chips['queries_person_id']().filter(chip => chip.isSelected),
      supplier_id: this.chips['supplier_id']().filter(chip => chip.isSelected),
      created_date: this.dateRanges['created_date'](),
      last_updated_time: this.dateRanges['last_updated_time'](),
      quote_price: this.ranges['quote_price'](),
      booking_year: this.chips['booking_year']().filter(chip => chip.isSelected),
      auto_index: this.ranges['auto_index'](),
    };
  });

  /**
   * Used to store the last active filters as a preset in localStorage
   * so that they can be reapplied on page reload
   * without needing to select a preset manually
   */
  readonly activeFiltersSignal = computed<OrdersFilterPreset>(() => {
    const appliedFilters: FilterPresetType[] = Object.entries(this.activeFilters()).map(
      ([key, value]) => {
        const typedKey = key as keyof ActiveFilters;
        if (Array.isArray(value)) {
          return {
            id: typedKey,
            chipIds: value
              .filter((v: FilterChipData) => v.id !== undefined && v.id !== null)
              .map((v: FilterChipData) => v.id),
          } as ChipFilterPreset;
        } else if (isNumericRange(value)) {
          return {
            id: typedKey,
            range: value,
          } as RangeFilterPreset;
        }
        return {
          id: typedKey,
          dateRange: value as FilterDateRange,
        } as DateRangeFilterPreset;
      }
    );

    appliedFilters.push({
      id: 'selectedColumnIds',
      selectedColumnIds: this.selectedColumnIds(),
    });

    return {
      label: LAST_ACTIVE_FILTERS_KEY,
      appliedFilters,
    };
  });

  selectedColumnIds = signal<string[]>([]);
  isColumnSelectionExpanded = signal<boolean>(false);

  /** Configuration for all available filters in the menu. */
  availableFilters = ORDERS_FILTER_MENU_CONFIG;
  /**
   * Signals holding the chip data for each filter key.
   */
  chips: { [key: string]: WritableSignal<FilterChipData[]> } = {
    primary_cost_center_id: signal<FilterChipData[]>([]),
    secondary_cost_center_id: signal<FilterChipData[]>([]),
    owner_id: signal<FilterChipData[]>([]),
    status: signal<FilterChipData[]>([]),
    delivery_person_id: signal<FilterChipData[]>([]),
    invoice_person_id: signal<FilterChipData[]>([]),
    queries_person_id: signal<FilterChipData[]>([]),
    supplier_id: signal<FilterChipData[]>([]),
    booking_year: signal<FilterChipData[]>([]),
  };
  /**
   * Signals holding the date range data for each filter key.
   */
  dateRanges: { [key: string]: WritableSignal<FilterDateRange> } = {
    created_date: signal<FilterDateRange>({ start: null, end: null }),
    last_updated_time: signal<FilterDateRange>({ start: null, end: null }),
  };
  /**
   * Signals holding the range data for each filter key.
   */
  ranges: { [key: string]: WritableSignal<FilterRange> } = {
    quote_price: signal<FilterRange>({
      start: ORDERS_FILTER_MENU_CONFIG.find(f => f.key === 'quote_price')?.data?.minValue ?? 0,
      end: ORDERS_FILTER_MENU_CONFIG.find(f => f.key === 'quote_price')?.data?.maxValue ?? 10000,
    }),
    auto_index: signal<FilterRange>({
      start: ORDERS_FILTER_MENU_CONFIG.find(f => f.key === 'auto_index')?.data?.minValue ?? 0,
      end: ORDERS_FILTER_MENU_CONFIG.find(f => f.key === 'auto_index')?.data?.maxValue ?? 100,
    }),
  };

  /** Reference to the accordion UI element. */
  accordion = viewChild.required(MatAccordion);
  /** Reference to the chip listbox for presets. */
  presetChips = viewChild.required<MatChipListbox>('presets');

  /** Control for the selected columns in the table. */
  selectedColumnsControl = new FormControl(
    ordersTableConfig.filter(col => !col.isInvisible).map(col => col.id)
  );
  /** Signal holding all available table columns. */
  ordersTableColumns = input.required<TableColumn<any>[]>();
  /** Emits when the selected columns have changed. */
  selectedColumnsChanged = output<string[]>();

  /** Emits when all filters have been reset. */
  resetedFilters = output<void>();

  constructor(
    private readonly costCentersService: CostCenterWrapperService,
    private readonly usersService: UsersWrapperService,
    private readonly personsService: PersonsWrapperService,
    private readonly suppliersService: SuppliersWrapperService,
    readonly dialog: MatDialog,
    private readonly preferencesService: UserPreferencesService,
    private readonly driverJsTourService: DriverJsTourService,
    private readonly injector: Injector
  ) {
    effect(() => {
      this.filtersChanged.emit(this.activeFilters());
    });

    toObservable(this.activeFilters)
      .pipe(debounceTime(environment.saveActiveFiltersDebounceMs))
      .subscribe(() =>
        this.preferencesService
          .updatePresetByLabel(LAST_ACTIVE_FILTERS_KEY, this.activeFiltersSignal())
          .subscribe()
      );

    this.preferencesService.getPresets().subscribe(presets => {
      this.setPresets(presets);
    });

    this.selectedColumnsControl.valueChanges.subscribe(selectedColumnIds => {
      this.selectedColumnIds.set(selectedColumnIds ?? []);
      this.selectedColumnsChanged.emit(selectedColumnIds ?? []);
    });
  }

  setPresets(presets: OrdersFilterPreset[]) {
    this.lastActiveFilters.set(presets.find(preset => preset.label === LAST_ACTIVE_FILTERS_KEY));
    this.filterPresets.set(presets.filter(preset => preset.label !== LAST_ACTIVE_FILTERS_KEY));
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

    this.registerTourSteps();
  }

  /**
   * Sets up persistent filters by loading from localStorage and saving changes.
   * Applies saved filters on initialization and updates localStorage on changes.
   */
  private setupPersistentFilters() {
    if (this.initialPreset()) {
      this.applyPreset(this.initialPreset()!);
    } else {
      const lastActiveFilters = this.filterPresets().find(
        preset => preset.label === LAST_ACTIVE_FILTERS_KEY
      );
      if (lastActiveFilters) {
        this.clearAllFilters();
        this.applyPreset(lastActiveFilters);
      }
    }
    this.selectedColumnsChanged.emit(this.selectedColumnsControl.value ?? []);
  }

  /**
   * Loads and sets up cost center chips.
   */
  setupCostCenters() {
    return from(this.costCentersService.getAllCostCenters()).pipe(
      tap((costCenters: CostCenterResponseDTO[]) => {
        const costCenterChips = costCenters.map(center => ({
          id: center.id,
          label: center.id + ' - ' + center.name,
          tooltip: this.getCostCenterTooltip(center),
        }));
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
        this.chips['owner_id'].set(
          users.map(user => ({
            id: user.id,
            label: this.composeFullName(user),
            tooltip: user.email,
          }))
        );
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
            tooltip: tooltipParts.join(' - '),
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
      USED_STATES.map(id => ({
        id: id,
        label: STATE_ICONS.get(id) + ' ' + STATE_DISPLAY_NAMES.get(id),
        tooltip: '',
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
            tooltip: supplier.comment,
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
    const bookingYears = Array.from({ length: currentYear - 1999 }, (_, i) => currentYear - i);
    this.chips['booking_year'].set(
      bookingYears.map(year => ({
        id: year.toString().slice(-2),
        label: year.toString(),
        tooltip: '',
      }))
    );
    return of(undefined);
  }

  /**
   * Saves the current filters as a preset.
   */
  saveCurrentFiltersAsPreset() {
    const dialogRef = this.dialog.open(FilterPresetsSaveComponent, {
      data: {
        name: 'Meine Filter ' + (this.filterPresets().length + 1 - ORDERS_FILTER_PRESETS.length),
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        const currentPreset = { ...this.activeFiltersSignal() };
        currentPreset.label = result;
        this.preferencesService.savePreset(currentPreset).subscribe(presets => {
          this.setPresets(presets);
        });
      }
    });
    return dialogRef;
  }

  /**
   * Opens the filter presets edit dialog.
   */
  editFilterPresets() {
    const dialogRef = this.dialog.open(FilterPresetsEditComponent);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.setPresets(result);
      }
    });
    return dialogRef;
  }

  /**
   * Resets all filters and deselects all presets.
   */
  onReset() {
    this.activePresets = [];
    const selectedChips = this.presetChips().selected;
    if (Array.isArray(selectedChips)) {
      for (const chip of selectedChips) {
        chip.deselect();
      }
    } else if (selectedChips) {
      selectedChips.deselect();
    }
    this.clearAllFilters();
    this.resetSelectedColumns();
    this.resetedFilters.emit();
  }

  /**
   * Clears all filters to their default state.
   */
  clearAllFilters() {
    for (const chipSignal of Object.values(this.chips)) {
      chipSignal.update(chips => chips.map(chip => ({ ...chip, isSelected: false })));
    }
    for (const dateRangeSignal of Object.values(this.dateRanges)) {
      dateRangeSignal.set({ start: null, end: null });
    }
    for (const [key, rangeSignal] of Object.entries(this.ranges)) {
      const min = this.availableFilters.find(f => f.key === key)?.data?.minValue ?? 0;
      const max = this.availableFilters.find(f => f.key === key)?.data?.maxValue ?? 100;
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
      this.disablePreset(preset);
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
            appliedFilter.chipIds.includes(chip.id ?? '') ? { ...chip, isSelected: true } : chip
          )
        );
      } else if ('dateRange' in appliedFilter) {
        this.dateRanges[appliedFilter.id].set(appliedFilter.dateRange);
      } else if ('range' in appliedFilter) {
        this.ranges[appliedFilter.id].set(appliedFilter.range);
      } else if ('selectedColumnIds' in appliedFilter) {
        this.selectedColumnsControl.setValue(appliedFilter.selectedColumnIds);
      }
    }
  }

  /**
   * Removes a filter preset from the active presets.
   * @param preset The filter preset to remove.
   */
  disablePreset(preset: OrdersFilterPreset) {
    for (const appliedFilter of preset.appliedFilters) {
      if ('chipIds' in appliedFilter) {
        this.chips[appliedFilter.id]?.update(currentChips =>
          currentChips.map(chip =>
            appliedFilter.chipIds.includes(chip.id ?? '') ? { ...chip, isSelected: false } : chip
          )
        );
      } else if ('dateRange' in appliedFilter) {
        this.dateRanges[appliedFilter.id].set({ start: null, end: null });
      } else if ('range' in appliedFilter) {
        const min =
          this.availableFilters.find(f => f.key === appliedFilter.id)?.data?.minValue ?? 0;
        const max =
          this.availableFilters.find(f => f.key === appliedFilter.id)?.data?.maxValue ?? 100;
        this.ranges[appliedFilter.id].set({ start: min, end: max });
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
      if (!(presetFilter.id in this.activeFilters())) {
        return true;
      }

      switch (true) {
        case presetFilter === undefined:
          return false;

        case 'chipIds' in presetFilter: {
          const activeValue = this.activeFilters()[presetFilter.id as keyof ActiveFilters] as
            | FilterChipData[]
            | undefined;
          return presetFilter.chipIds.every(id => activeValue?.some(chip => chip.id === id));
        }

        case 'dateRange' in presetFilter: {
          const activeValue = this.activeFilters()[presetFilter.id as keyof ActiveFilters] as
            | FilterDateRange
            | undefined;
          if (
            activeValue &&
            typeof activeValue === 'object' &&
            'start' in activeValue &&
            'end' in activeValue
          ) {
            return (
              activeValue.start === presetFilter.dateRange.start &&
              activeValue.end === presetFilter.dateRange.end
            );
          }
          return false;
        }

        case 'range' in presetFilter: {
          const activeValue = this.activeFilters()[presetFilter.id as keyof ActiveFilters] as
            | FilterRange
            | undefined;
          if (
            activeValue &&
            typeof activeValue === 'object' &&
            'start' in activeValue &&
            'end' in activeValue
          ) {
            return (
              activeValue.start === presetFilter.range.start &&
              activeValue.end === presetFilter.range.end
            );
          }
          return false;
        }

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

  /** Starts the guided tour for the filter menu component. */
  startTour() {
    scrollTo({ top: 0, behavior: 'smooth' });
    this.driverJsTourService.startTour([FilterMenuComponent]);
  }

  /**
   * Registers the tour steps for the FilterMenuComponent.
   * These steps will guide users through the main features of the filter menu.
   */
  private registerTourSteps() {
    let dialogRef: MatDialogRef<any> | undefined;

    const afterDialogRender = (ref: MatDialogRef<any>, action: () => void) => {
      dialogRef?.close();
      dialogRef = ref;
      ref
        .afterOpened()
        .pipe(first())
        .subscribe(() => {
          afterNextRender(
            {
              read: () => action(),
            },
            { injector: this.injector }
          );
        });
    };

    this.driverJsTourService.registerStepsForComponent(FilterMenuComponent, () => [
      {
        element: '.tour-expand-all-filters',
        popover: {
          title: 'Alle Filter ausklappen',
          description:
            'Klicken Sie hier, um alle Filterabschnitte im Filtermenü gleichzeitig zu erweitern.',
          onPopoverRender: () => this.accordion().openAll(),
        },
      },
      {
        element: '.tour-collapse-all-filters',
        popover: {
          title: 'Alle Filter einklappen',
          description:
            'Klicken Sie hier, um alle Filterabschnitte im Filtermenü gleichzeitig zu schließen.',
          onPopoverRender: () => this.accordion().closeAll(),
        },
      },
      {
        element: '.tour-reset-filters',
        popover: {
          title: 'Filter zurücksetzen',
          description:
            'Über diesen Button können Sie alle aktiven Filter zurücksetzen und die Standardansicht wiederherstellen.',
        },
      },
      {
        element: '.tour-filter-presets',
        popover: {
          title: 'Filter-Presets',
          description:
            'Hier können Sie vordefinierte Filterkombinationen auswählen und erstellen, um schnell bestimmte Ansichten zu laden.',
        },
      },
      {
        element: '.tour-save-filter-preset',
        popover: {
          title: 'Filter-Preset speichern',
          description:
            'Hier können Sie die aktuellen Filtereinstellungen als neues Preset speichern, um sie später schnell wiederverwenden zu können.',
          onNextClick: () =>
            afterDialogRender(this.saveCurrentFiltersAsPreset(), () =>
              this.driverJsTourService.getTourDriver().moveNext()
            ),
        },
      },
      {
        element: '.tour-save-preset-dialog',
        disableActiveInteraction: true,
        popover: {
          title: 'Neues Filter-Preset',
          description:
            'Geben Sie hier einen Namen für Ihr neues Filter-Preset ein und speichern Sie es, um die aktuellen Filtereinstellungen zu sichern.',
          onPopoverRender: popover => this.driverJsTourService.placePopoverOntopDialog(popover),
          onPrevClick: () => {
            dialogRef?.close();
            this.driverJsTourService.getTourDriver().movePrevious();
          },
          onCloseClick: () => {
            dialogRef?.close();
            this.driverJsTourService.getTourDriver().destroy();
          },
          onNextClick: () => {
            dialogRef?.close();
            this.driverJsTourService.getTourDriver().moveNext();
          },
        },
      },
      {
        element: '.tour-edit-filter-presets',
        popover: {
          title: 'Filter-Presets bearbeiten',
          description:
            'Hier können Sie Ihre gespeicherten Filter-Presets verwalten, um sie umzubenennen oder zu löschen.',
          onPrevClick: () =>
            afterDialogRender(this.saveCurrentFiltersAsPreset(), () =>
              this.driverJsTourService.getTourDriver().movePrevious()
            ),
          onNextClick: () =>
            afterDialogRender(this.editFilterPresets(), () =>
              this.driverJsTourService.getTourDriver().moveNext()
            ),
        },
      },
      {
        element: '.tour-edit-presets-dialog',
        disableActiveInteraction: true,
        popover: {
          title: 'Filter-Presets verwalten',
          description:
            'Verwalten Sie hier Ihre gespeicherten Filter-Presets. Sie können Presets umbenennen oder löschen, um Ihre Filteroptionen aktuell zu halten.',
          onPopoverRender: popover => this.driverJsTourService.placePopoverOntopDialog(popover),
          onPrevClick: () => {
            dialogRef?.close();
            this.driverJsTourService.getTourDriver().movePrevious();
          },
          onCloseClick: () => {
            dialogRef?.close();
            this.driverJsTourService.getTourDriver().destroy();
          },
          onNextClick: () => {
            dialogRef?.close();
            this.driverJsTourService.getTourDriver().moveNext();
          },
        },
      },
      {
        element: '.tour-filter-column-selection',
        popover: {
          title: 'Spaltenauswahl',
          description:
            'Hier können Sie die sichtbaren Spalten in der Tabelle auswählen oder abwählen.',
          onPrevClick: () =>
            afterDialogRender(this.editFilterPresets(), () =>
              this.driverJsTourService.getTourDriver().movePrevious()
            ),
          onPopoverRender: () => this.isColumnSelectionExpanded.set(true),
        },
      },
    ]);
  }
}
