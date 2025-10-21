import { CommonModule } from '@angular/common';
import { Component, computed, ElementRef, input, model, OnChanges, OnInit, output, signal, viewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FilterChipData } from '../../../models/filter-chip-data';

/**
 * Component for selecting items using chips.
 * This component allows users to select multiple items from a list using a chip-based interface.
 * Users can type to filter the list of available items and select their desired items.
 * The selected items are displayed as chips, which can be removed individually.
 *
 * Usage:
 * <app-chip-selection [items]="itemList" />
 */

@Component({
  selector: 'app-chip-selection',
  imports: [
    MatFormFieldModule,
    MatChipsModule,
    MatInputModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    CommonModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './chip-selection.component.html',
  styleUrl: './chip-selection.component.scss'
})
export class ChipSelectionComponent implements OnInit, OnChanges {

  /**
   * The label for the input field.
   */
  inputLabel = input<string>('Items auswählen');
  /**
   * The placeholder text for the input field.
   */
  inputPlaceholder = input<string>('Suchbegriff eingeben');

  /**
   * The list of items to select from.
   * Each item is represented by a FilterChipData object.
   */
  items = model<FilterChipData[]>([]);

  /**
   * Output event emitter for changes in the selected items.
   */
  selectionChanged = output<FilterChipData>();

  /**
   * The items that match the current text input and are not selected.
   */
  autocompleteItems = computed<string[]>(() =>
    this.items()
      .filter(item => !item.isSelected)
      .map(item => item.label)
      .filter(item => item.toLowerCase().includes(this.textInput().toLowerCase() ?? ''))
  );

  selectedItems: FilterChipData[] = [];
  skipChangeDetection = false;

  textInputControl = new FormControl<string>('');
  textInput = signal<string>('');

  chipInputField = viewChild.required<ElementRef<HTMLInputElement>>('chipInput');

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
   * Handle changes in the component inputs.
   * This updates the selected items based on the items provided.
   */
  ngOnChanges() {
    if (this.skipChangeDetection) {
      this.skipChangeDetection = false;
    } else {
      this.selectedItems = this.items().filter(item => item.isSelected);
    }
  }

  /**
   * Handle the selection of an item from the autocomplete list.
   * This updates the selected items and emits the change event.
   * @param event The event containing the selected item.
   */
  select(event: MatAutocompleteSelectedEvent) {
    this.skipChangeDetection = true;

    const item = this.getItemByName(event.option.viewValue);
    if (item) {
      this.selectedItems.push(item);
      this.applyChanges(item);
    }
    this.textInputControl.reset('');
    this.chipInputField().nativeElement.value = '';

  }

  /**
   * Remove an item from the selection.
   * @param itemToRemove The name of the item to remove.
   */
  remove(itemToRemove: FilterChipData) {
    this.skipChangeDetection = true;

    this.selectedItems = this.selectedItems.filter(item => item !== itemToRemove);
    this.applyChanges(itemToRemove);
  }

  /**
   * Apply changes to the items based on the selected or removed item.
   * This updates the isSelected property of the item and emits the change event.
   * @param itemName The name of the item to toggle selection.
   */
  private applyChanges(item: FilterChipData) {
    this.items.update(items => items.map(
      i => i.label === item.label ? { ...i, isSelected: !i.isSelected } : { ...i }
    ));
    this.selectionChanged.emit(this.getItemByName(item.label)!);
  }

  /**
   * Get an item by its name.
   * @param itemName The name of the item to retrieve.
   * @returns The item if found, or undefined.
   */
  getItemByName(itemName: string): FilterChipData | undefined {
    return this.items().find(item => item.label === itemName);
  }

}
