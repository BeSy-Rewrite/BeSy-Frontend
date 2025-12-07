import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

export interface UnsavedTab {
  tabName: string;
  fields: string[];
}

export interface UnsavedChangesDialogData {
  unsavedTabs: UnsavedTab[];
}

@Component({
  selector: 'app-unsaved-changes-dialog',
  imports: [ MatIconModule, MatDialogModule, MatButtonModule, CommonModule ],
  templateUrl: './unsaved-changes-dialog.component.html',
  styleUrl: './unsaved-changes-dialog.component.scss'
})
export class UnsavedChangesDialogComponent {
  readonly dialogRef = inject(MatDialogRef<UnsavedChangesDialogComponent>);
  readonly data = inject<UnsavedChangesDialogData>(MAT_DIALOG_DATA);

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
