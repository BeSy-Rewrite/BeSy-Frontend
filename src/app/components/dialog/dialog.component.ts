import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

export interface DialogData {
  title: string;
  description: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
}

@Component({
  selector: 'app-dialog',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
  ],
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.css'
})
export class DialogComponent {

  constructor(
    public dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {
    // Set default button texts if not provided
    this.data.confirmButtonText = this.data.confirmButtonText ?? 'Bestätigen';
    this.data.cancelButtonText = this.data.cancelButtonText ?? 'Abbrechen';
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}


/**
 * Opens a dialog with the given data and sets up a callback for when the dialog is closed.
 * @param dialog - The MatDialog instance to use for opening the dialog.
 * @param dialogData - The data to pass to the dialog component.
 * @param callback - The callback to call when the dialog is closed.
 */
export function setupDialog(dialog: MatDialog, dialogData: DialogData, callback: (result: boolean) => void): void {
  const dialogRef = dialog.open(DialogComponent, {
    data: dialogData,
  });

  dialogRef.afterClosed().subscribe(result => {
    callback(result);
  });

}
