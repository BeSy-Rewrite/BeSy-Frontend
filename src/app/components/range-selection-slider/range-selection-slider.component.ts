import { Component, input, model, OnChanges, OnInit, output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSliderModule } from '@angular/material/slider';
import { startWith } from 'rxjs/operators';
import { FilterRange } from '../../models/filter-range';

@Component({
  selector: 'app-range-selection-slider',
  imports: [
    MatSliderModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './range-selection-slider.component.html',
  styleUrl: './range-selection-slider.component.scss'
})
export class RangeSelectionSliderComponent implements OnInit, OnChanges {

  /**
   * Minimum boundary for the selectable range of the slider.
   * Default: 0
   */
  minValue = input<number>(0);

  /**
   * Maximum boundary for the selectable range of the slider.
   * Default: 100
   */
  maxValue = input<number>(100);
  internalMaxValue = signal<number>(100);

  /**
   * The currently selected value interval (start, end).
   * Used as a model and synchronized on changes.
   */
  selectedRange = model<FilterRange>();
  /**
   * Internal flag to prevent recursive changes during synchronization.
   */
  skipChangeDetection = false;

  /**
   * Output event emitter for changes in the selected range.
   */
  rangeChanged = output<FilterRange>();

  /**
   * FormGroup for managing input fields and the slider.
   * Contains values for start and end for both input and slider.
   */
  formGroup: FormGroup;


  /**
   * Initializes the form and controls for input and slider.
   * Values are prefilled with the current min/max inputs.
   * @param formBuilder Angular FormBuilder for creating the FormGroup structure.
   */
  constructor(private readonly formBuilder: FormBuilder) {
    this.formGroup = this.formBuilder.group({
      input: this.formBuilder.group({
        start: this.minValue(),
        end: Infinity
      }),
      slider: this.formBuilder.group({
        start: this.minValue(),
        end: this.internalMaxValue()
      })
    });
  }

  /**
   * Sets up synchronization between input fields and slider.
   * Changes in one control are immediately reflected in the other.
   * Updates the model on every change.
   */
  ngOnInit() {
    for (const type of ['start', 'end']) {
      // Update the slider max value if the input end value exceeds it
      // Synchronize values between Input and Slider controls
      this.formGroup.get(`input.${type}`)?.valueChanges.subscribe(value => {
        if (type === 'end') {
          this.internalMaxValue.set(Math.max(value, this.maxValue()));
        }
        console.log('Input value changed:', type, value);
        this.formGroup.get(`slider.${type}`)?.setValue(value, { emitEvent: false })
      });
      this.formGroup.get(`slider.${type}`)?.valueChanges.subscribe(value =>
        this.formGroup.get(`input.${type}`)?.setValue(value, { emitEvent: false })
      );
    }

    // Update model on every change
    this.formGroup.valueChanges.pipe(
      startWith(this.formGroup.value)
    ).subscribe(value => {
      this.skipChangeDetection = true;
      this.selectedRange.set(value.input);
      this.rangeChanged.emit(value.input);
    });
  }

  /**
   * Called when the component's inputs change (e.g. min/max).
   * Sets the form controls to the new values and clamps them to valid boundaries if necessary.
   */
  ngOnChanges() {
    if (this.skipChangeDetection) {
      this.skipChangeDetection = false;
      return;
    }

    this.internalMaxValue.set(this.maxValue());

    let initialRange = this.selectedRange();
    initialRange ??= {
      start: this.minValue(),
      end: this.internalMaxValue()
    };

    const newRange = this.clampRange(initialRange);

    this.formGroup.patchValue({
      input: newRange,
      slider: newRange
    });
  }

  /**
   * Clamps the given range to valid min/max boundaries.
   * If start > end, end will be set to start.
   * @param range Range to check and adjust.
   * @returns Range with valid values.
   */
  private clampRange(range: FilterRange): FilterRange {
    const clampedStart = Math.max(this.minValue(), Math.min(range.start, this.internalMaxValue()));
    const clampedEnd = Math.max(clampedStart, Math.min(range.end, this.internalMaxValue()));
    return { start: clampedStart, end: clampedEnd };
  }

}
