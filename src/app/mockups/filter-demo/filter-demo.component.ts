import { Component, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { CardComponent } from '../../components/card/card.component';
import { ChipSelectionComponent } from '../../components/filter/chip-selection/chip-selection.component';
import { DateRangePickerComponent } from '../../components/filter/date-range-picker/date-range-picker.component';
import { RangeSelectionSliderComponent } from '../../components/filter/range-selection-slider/range-selection-slider.component';
import { FilterChipData } from '../../models/filter-chip-data';
import { FilterDateRange } from '../../models/filter/filter-date-range';
import { FilterRange } from '../../models/filter/filter-range';

@Component({
  selector: 'app-filter-demo',
  imports: [
    DateRangePickerComponent,
    RangeSelectionSliderComponent,
    ChipSelectionComponent,
    CardComponent,
    MatButtonModule
  ],
  templateUrl: './filter-demo.component.html',
  styleUrl: './filter-demo.component.scss'
})
export class FilterDemoComponent {

  // DatePicker
  onDateRangeChange(event: FilterDateRange) {
    console.log('Selected date range:', event.start, '-', event.end);
    // Here you can implement logic to filter the dataSource based on the selected date range
    // For example, you could fetch new data or filter the existing data based on the date range
  }

  dateRange = signal<FilterDateRange>({
    start: new Date(2023, 0, 1), // January 1
    end: new Date(2023, 11, 31) // December 31
  });

  changeDate() {
    console.log('Test button clicked');
    this.dateRange.set({
      start: new Date(2023, 3, 1),
      end: new Date(2024, 11, 31)
    });
  }


  // Range Slider
  range = signal<FilterRange>({ start: 0.1, end: 100 });

  changeRange() {
    this.range.update(initial => ({
      start: initial.start + 10,
      end: initial.end - 10
    }));
  }
  onRangeChange(newRange: FilterRange) {
    console.log('Range changed:', newRange, this.range());
  }


  // Chip Selection
  items = signal<FilterChipData[]>([
    { label: 'Option 1', color: 'oklch(0.809 0.105 251.813)' },
    { label: 'Option 2' },
    { label: 'Option 3', color: 'var(--color-emerald-300)', isSelected: true }
  ]);
  selectedItems = signal<string[]>([]);

  useCustomChipData() {
    const customItems: CustomFilterChipData[] = [
      { label: 'Custom Option 1', color: 'oklch(0.809 0.105 251.813)', customProperty: 'Custom Value 1' },
      { label: 'Custom Option 2', customProperty: 'Custom Value 2' },
      { label: 'Custom Option 3', color: 'var(--color-emerald-300)', isSelected: true, customProperty: 'Custom Value 3' }
    ];
    this.items.set(customItems);
  }

  onChipChange(item: FilterChipData) {
    console.log('Chip changed:', item);
  }

}

interface CustomFilterChipData extends FilterChipData {
  customProperty: string;
}
