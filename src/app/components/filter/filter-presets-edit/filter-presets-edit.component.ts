import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableDataSource } from '@angular/material/table';
import { OrdersFilterPreset } from '../../../models/filter/filter-presets';
import { ButtonColor, TableActionButton } from '../../../models/generic-table';
import { GenericTableComponent } from "../../generic-table/generic-table.component";
import { SAVED_FILTER_PRESETS_KEY } from '../filter-menu/filter-menu.component';
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

  savedPresets: OrdersFilterPreset[] = Object.values(JSON.parse(localStorage.getItem(SAVED_FILTER_PRESETS_KEY) ?? '{}'));

  datasource = new MatTableDataSource(this.savedPresets);
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

  constructor(private readonly dialog: MatDialog) { }

  /** Opens a dialog to rename the selected preset. */
  renamePreset(preset: any): void {
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
  deletePreset(preset: any): void {
    this.savedPresets = this.savedPresets.filter(p => p.label !== preset.label);
    this.datasource.data = this.savedPresets;
  }

  /** Saves the current presets to local storage and closes the dialog. */
  saveChanges(): void {
    const savedPresets: { [key: string]: OrdersFilterPreset } = {};
    for (const preset of this.savedPresets) {
      savedPresets[preset.label.toLowerCase().replaceAll(' ', '_')] = preset;
    }
    localStorage.setItem(SAVED_FILTER_PRESETS_KEY, JSON.stringify(savedPresets));

    this.close();
  }

  /** Closes the dialog without saving changes. */
  close(): void {
    this.dialogRef.close();
  }
}
