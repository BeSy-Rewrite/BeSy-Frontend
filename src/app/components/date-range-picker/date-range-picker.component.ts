import { Component, input, model, OnChanges, OnInit, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule, MatDateRangeInput } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FilterDateRange } from '../../models/filter-date-range';

/**
 * A date range picker component that allows users to select a start and end date.
 * This component uses Angular Material's datepicker and form field modules.
 * It emits the selected date range when it changes.
 * @example
 * <app-date-range-picker [(dateRange)]="dateRange" />
 */

@Component({
  selector: 'app-date-range-picker',
  imports: [
    MatFormFieldModule,
    MatDateRangeInput,
    MatDatepickerModule,
    ReactiveFormsModule
  ],
  templateUrl: './date-range-picker.component.html',
  styleUrl: './date-range-picker.component.css'
})
export class DateRangePickerComponent implements OnInit, OnChanges {
  readonly today = new Date();

  /**
   * The minimum date that can be selected, defaults to January 1, 2000.
   */
  minDate = input<Date>(new Date(2000, 0, 1)); // January 1, 2000

  /**
   * The maximum date that can be selected, defaults to today.
   */
  maxDate = input<Date>(new Date()); // Today

  /**
   * The currently selected date range.
   * This is a model that is synchronized with the form controls.
   */
  dateRange = model<FilterDateRange>({
    start: undefined,
    end: undefined
  });

  range = new FormGroup({
    start: new FormControl(),
    end: new FormControl()
  });

  /**
   * Emits the selected date range when it changes.
   */
  onChanges = output<FilterDateRange>();

  /**
   * Initializes the date range picker component.
   * Sets up the initial values for the date range and subscribes to changes.
   * This method is called when the component is created.
   */
  ngOnInit() {
    this.range.valueChanges.subscribe(() => {
      this.dateRange.set(this.getRange());
      this.onChanges.emit(this.getRange());
    });
  }

  /**
   * Sets the initial date range when the components input's change.
   */
  ngOnChanges() {
    this.range.setValue(this.dateRange());
  }

  /**
   * Returns the selected date range as an object with start and end dates.
   * If the start or end date is not set, it returns undefined for that field.
   */
  getRange(): FilterDateRange {
    let start = this.range.get('start')?.value;
    let end = this.range.get('end')?.value;

    if (!(start instanceof Date)) {
      start = start?.toJSDate();
    }
    if (!(end instanceof Date)) {
      end = end?.toJSDate();
    }
    return {
      start: start ?? undefined,
      end: end ?? undefined
    };
  }

}
