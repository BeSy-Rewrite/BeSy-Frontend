import { Component, inject, Signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';


export interface ProcessingIndicatorData {
  isClosable: Signal<boolean>;
}

@Component({
  selector: 'app-processing-indicator',
  standalone: true,
  imports: [
    MatProgressSpinnerModule,
    MatDialogModule,
    MatButtonModule
  ],
  templateUrl: './processing-indicator.component.html',
  styleUrl: './processing-indicator.component.scss'
})
export class ProcessingIndicatorComponent {

  readonly dialogRef = inject(MatDialogRef<ProcessingIndicatorComponent>);
  readonly data = inject<ProcessingIndicatorData>(MAT_DIALOG_DATA);

  constructor() {
    this.dialogRef.disableClose = true;
  }

  closeIfAllowed(): void {
    if (this.data.isClosable()) {
      this.dialogRef.close();
    }
  }

}
