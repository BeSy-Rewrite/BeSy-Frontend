import { Component, computed, ElementRef, input, model, output, signal, viewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

/**
 * Component for selecting items using chips.
 * This component allows users to select multiple items from a list using a chip-based interface.
 * Users can type to filter the list of available items and select their desired items.
 * The selected items are displayed as chips, which can be removed individually.
 * 
 * Usage:
 * <app-chip-selection [items]="itemList" [(selectedItems)]="selectedItems" />
 */

@Component({
  selector: 'app-chip-selection',
  imports: [
    MatFormFieldModule,
    MatChipsModule,
    MatInputModule,
    MatAutocompleteModule,
    ReactiveFormsModule
  ],
  templateUrl: './chip-selection.component.html',
  styleUrl: './chip-selection.component.css'
})
export class ChipSelectionComponent {

  /**
   * The list of available items for selection.
   */
  items = input.required<string[]>();

  /**
   * The currently selected items.
   */
  selectedItems = model<string[]>([]);

  /**
   * Output event emitter for changes in the selected items.
   */
  onChanges = output<string[]>();

  /**
   * The items that match the current text input and are not selected.
   */
  autocompleteItems = computed<string[]>(() =>
    this.items()
      .filter(item => !this.selectedItems().includes(item))
      .filter(item => item.toLowerCase().includes(this.textInput().toLowerCase() ?? ''))
  );

  selectedItemsControl = new FormControl<string[]>([]);
  textInputControl = new FormControl<string>('');
  textInput = signal<string>('');

  chipInput = viewChild.required<ElementRef<HTMLInputElement>>('chipInput');

  /**
   * Initialize the component.
   * Subscribe to changes in the text input control to update the text input signal.
   */
  ngOnInit() {
    this.textInputControl.valueChanges.subscribe(() => {
      this.textInput.set(this.textInputControl.value ?? '');
    });
  }

  /**
   * Handle the selection of an item from the autocomplete list.
   * @param event The selection event containing the selected item.
   */
  select(event: MatAutocompleteSelectedEvent) {
    const selectedItem = event.option.viewValue;
    this.selectedItems.set([...this.selectedItems(), selectedItem]);
    this.selectedItemsControl.setValue(this.selectedItems());
    this.onChanges.emit(this.selectedItems());

    this.textInputControl.reset('');
    this.chipInput().nativeElement.value = '';

  }

  /**
   * Remove an item from the selection.
   * @param item The item to remove.
   */
  remove(item: string) {
    this.selectedItems.update(items => items.filter(currentItem => currentItem !== item));
    this.selectedItemsControl.setValue(this.selectedItems());
    this.onChanges.emit(this.selectedItems());
  }
}
