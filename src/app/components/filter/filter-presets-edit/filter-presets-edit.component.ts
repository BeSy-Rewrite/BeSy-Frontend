import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableDataSource } from '@angular/material/table';
import { mergeMap } from 'rxjs';
import { OrdersFilterPreset } from '../../../models/filter/filter-presets';
import { ButtonColor, TableActionButton } from '../../../models/generic-table';
import { UserPreferencesService } from '../../../services/user-preferences.service';
import { GenericTableComponent } from "../../generic-table/generic-table.component";
import { CreatePresetDialogData, FilterPresetsSaveComponent } from '../filter-preset-save/filter-presets-save.component';

/**
 * Component for editing saved filter presets.
 * Displays a dialog with a table of saved presets, allowing renaming and deletion.
 */

@Component({
  selector: 'app-edit-filter-presets',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    FormsModule,
    GenericTableComponent
  ],
  templateUrl: './filter-presets-edit.component.html',
  styleUrl: './filter-presets-edit.component.scss'
})
export class FilterPresetsEditComponent {

  readonly dialogRef = inject(MatDialogRef<FilterPresetsEditComponent>);
  readonly data = inject<CreatePresetDialogData>(MAT_DIALOG_DATA);

  initialPresets!: OrdersFilterPreset[];
  savedPresets!: OrdersFilterPreset[];

  datasource = new MatTableDataSource(<OrdersFilterPreset[]>([]));
  columns = [
    { id: 'label', label: 'Name' },
  ];
  actions: TableActionButton[] = [
    {
      id: 'delete',
      label: 'Löschen',
      buttonType: 'outlined',
      color: ButtonColor.WARN,

      action: (preset) => this.deletePreset(preset)
    },
    {
      id: 'rename',
      label: 'Umbenennen',
      buttonType: 'outlined',
      color: ButtonColor.PRIMARY,
      action: (preset) => this.renamePreset(preset)
    }
  ];

  constructor(private readonly dialog: MatDialog,
    private readonly preferencesService: UserPreferencesService
  ) {
    preferencesService.getCustomPresets().subscribe(presets => {
      // take a deep copy to avoid mutating the original when editing
      this.initialPresets = structuredClone(presets);
      this.savedPresets = structuredClone(presets);
      this.datasource.data = this.savedPresets;
    });
  }

  /** Opens a dialog to rename the selected preset. */
  renamePreset(preset: OrdersFilterPreset): void {
    const dialogRef = this.dialog.open(FilterPresetsSaveComponent, {
      data: {
        name: preset.label,
        acceptButtonText: 'umbenennen'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        preset.label = result;
        this.datasource.data = this.savedPresets;
      }
    });
  }

  /** Deletes the selected preset from the list. */
  deletePreset(preset: OrdersFilterPreset): void {
    this.savedPresets = this.savedPresets.filter(p => p.label !== preset.label);
    this.datasource.data = this.savedPresets;
  }

  /** Saves the current presets to local storage and closes the dialog. */
  saveChanges(): void {
    this.preferencesService.deletePreferences({
      order_filter_preferences: this.initialPresets.map(preset => JSON.stringify(preset))
    }).pipe(
      mergeMap(() => this.preferencesService.addPreferences({
        order_filter_preferences: this.savedPresets.map(preset => JSON.stringify(preset))
      }))
    ).subscribe(savedPrefs => {
      this.dialogRef.close(savedPrefs.order_filter_preferences.map(preset => this.preferencesService.parseAndCheckPreset(preset)));
    });
  }
  isUnchanged(): boolean {
    return JSON.stringify(this.initialPresets) === JSON.stringify(this.savedPresets);
  }

  /** Closes the dialog without saving changes. */
  close(): void {
    this.dialogRef.close();
  }
}
