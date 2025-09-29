import { Component, computed, effect, OnInit, output, signal, viewChild, WritableSignal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { from } from 'rxjs';
import { CostCenterResponseDTO, CostCentersService, CustomerIdResponseDTO, PersonResponseDTO, PersonsService, SupplierResponseDTO, SuppliersService, UserResponseDTO, UsersService } from '../../api';
import { ORDERS_FILTER_MENU_CONFIG } from '../../configs/orders-filter-menu-config';
import { statusDisplayNames } from '../../display-name-mappings/status-names';
import { FilterChipData } from '../../models/filter-chip-data';
import { FilterDateRange } from '../../models/filter-date-range';
import { ActiveFilters } from '../../models/filter-menu-types';
import { FilterRange } from '../../models/filter-range';
import { ChipSelectionComponent } from '../chip-selection/chip-selection.component';
import { DateRangePickerComponent } from '../date-range-picker/date-range-picker.component';
import { RangeSelectionSliderComponent } from '../range-selection-slider/range-selection-slider.component';


@Component({
  selector: 'app-filter-menu',
  imports: [
    MatButtonModule,
    DateRangePickerComponent,
    ChipSelectionComponent,
    RangeSelectionSliderComponent,
    MatExpansionModule
  ],
  templateUrl: './filter-menu.component.html',
  styleUrl: './filter-menu.component.css'
})
export class FilterMenuComponent implements OnInit {

  filtersChanged = output<ActiveFilters>();

  activeFilter = computed(() => {
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
    }
  });

  filters = ORDERS_FILTER_MENU_CONFIG;

  chips: { [key: string]: WritableSignal<FilterChipData[]> } = {
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

  // Dynamic min/max date ranges could be implemented here as well
  dateRanges: { [key: string]: WritableSignal<FilterDateRange> } = {
    'created_date': signal<FilterDateRange>({ start: null, end: null }),
    'last_updated_time': signal<FilterDateRange>({ start: null, end: null })
  };

  // ToDO: Dynamically adjust default range values -> min/max from DB needed
  ranges: { [key: string]: WritableSignal<FilterRange> } = {
    'quote_price': signal<FilterRange>({ start: 0, end: 10000 })
  };

  accordion = viewChild.required(MatAccordion);

  constructor() {
    effect(() => {
      this.filtersChanged.emit(this.activeFilter());
    });
  }

  ngOnInit() {
    this.setupCostCenters();
    this.setupUsers();
    this.setupPersons();
    this.setupStatuses();
    this.setupSuppliers();
    this.setupBookingYears();
  }

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

  setupUsers() {
    from(UsersService.getAllUsers()).subscribe((users: UserResponseDTO[]) => {
      this.chips['owner_id'].set(users.map(user => ({
        id: user.id,
        label: this.composeFullName(user),
        tooltip: user.email
      })));
    });
  }

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

  setupStatuses() {
    this.chips['status'].set(
      Array.from(statusDisplayNames.entries()).map(([id, label]) => ({
        id: id,
        label: label,
        tooltip: ''
      }))
    );
  }

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

  setupBookingYears() {
    const currentYear = new Date().getFullYear();
    const bookingYears = Array.from({ length: currentYear - 1999 }, (_, i) => (currentYear - i));
    this.chips['booking_year'].set(bookingYears.map(year => ({
      id: year.toString().slice(-2),
      label: year.toString(),
      tooltip: ''
    })));
  }

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

  getCostCenterTooltip(center: CostCenterResponseDTO): string {
    const tooltipParts = [];
    if (center.comment) tooltipParts.push(center.comment);
    if (center.begin_date) tooltipParts.push('Ab ' + center.begin_date);
    if (center.end_date) tooltipParts.push('Bis ' + center.end_date);

    return tooltipParts.join(' - ');
  }

  composeFullName(person: PersonResponseDTO | UserResponseDTO): string {
    const names = [];
    if (person.name) names.push(person.name);
    if (person.surname) names.push(person.surname);

    return names.join(' ');
  }

}
