import { Component, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { CardComponent } from '../../components/card/card.component';
import { ChipSelectionComponent } from '../../components/chip-selection/chip-selection.component';
import { DateRangePickerComponent } from '../../components/date-range-picker/date-range-picker.component';
import { RangeSelectionSliderComponent } from '../../components/range-selection-slider/range-selection-slider.component';
import { FilterDateRange } from '../../models/filter-date-range';
import { FilterRange } from '../../models/filter-range';

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
  styleUrl: './filter-demo.component.css'
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
  items = signal<string[]>(['Option 1', 'Option 2', 'Option 3']);
  selectedItems = signal<string[]>([]);

}
