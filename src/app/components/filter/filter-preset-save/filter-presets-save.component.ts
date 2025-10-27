import { Component, inject, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

export interface CreatePresetDialogData {
  name: string;
  acceptButtonText?: string;
}

/**
 * Component for saving a filter preset.
 * Displays a dialog with an input field for the preset name and buttons to save or cancel.
 */

@Component({
  selector: 'app-save-filter-preset',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    FormsModule
  ],
  templateUrl: './filter-presets-save.component.html',
  styleUrl: './filter-presets-save.component.scss'
})
export class FilterPresetsSaveComponent {

  readonly dialogRef = inject(MatDialogRef<FilterPresetsSaveComponent>);
  readonly data = inject<CreatePresetDialogData>(MAT_DIALOG_DATA);
  readonly presetName = model(this.data.name);

  close(): void {
    this.dialogRef.close();
  }
}
