import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableDataSource } from '@angular/material/table';
import { forkJoin } from 'rxjs';
import { LAST_ACTIVE_FILTERS_KEY } from '../../../configs/orders-table/order-filter-presets-config';
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
  newPresets: OrdersFilterPreset[] = [];
  deletedPresets: OrdersFilterPreset[] = [];


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
    preferencesService.getSavedPresets().subscribe(presets => {
      presets = presets.filter(preset =>
        preset.label !== LAST_ACTIVE_FILTERS_KEY
      );
      // take a deep copy to avoid mutating the original when editing
      this.initialPresets = structuredClone(presets);
      this.datasource.data = structuredClone(presets);
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

        if (preset.id != null) {
          this.deletedPresets.push(preset);
          this.newPresets.push({ ...preset, id: undefined });
        }
      }
    });
  }

  /** Deletes the selected preset from the list. */
  deletePreset(preset: OrdersFilterPreset): void {
    this.datasource.data = this.datasource.data.filter(p => p.label !== preset.label);

    if (preset.id != null) {
      this.deletedPresets.push(preset);
    }
  }

  /** Saves the current presets to local storage and closes the dialog. */
  saveChanges(): void {
    const saveObservables = [];
    for (const preset of this.deletedPresets) {
      saveObservables.push(this.preferencesService.deletePreset(preset.id!));
    }
    for (const preset of this.newPresets) {
      saveObservables.push(this.preferencesService.savePreset(preset));
    }

    forkJoin(saveObservables).subscribe(() => {
      this.dialogRef.close(this.preferencesService.getPresets());
    });
  }

  isUnchanged(): boolean {
    return this.newPresets.length === 0 && this.deletedPresets.length === 0;
  }

  /** Closes the dialog without saving changes. */
  close(): void {
    this.dialogRef.close();
  }
}
