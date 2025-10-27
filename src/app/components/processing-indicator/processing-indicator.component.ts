import { Component } from '@angular/core';
import { MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
@Component({
  selector: 'app-processing-indicator',
  standalone: true,
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatProgressSpinnerModule,
  ],
  templateUrl: './processing-indicator.component.html',
  styleUrl: './processing-indicator.component.scss'
})

export class ProcessingIndicatorComponent {

  constructor(private readonly dialogRef: MatDialogRef<ProcessingIndicatorComponent>) {
    dialogRef.disableClose = true;
  }

}
