import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { PopoverDOM } from 'driver.js';
import { DriverJsTourService } from '../../services/driver.js-tour.service';

export interface UnsavedTab {
  tabName: string;
  fields: string[];
}

export interface UnsavedChangesDialogData {
  unsavedTabs: UnsavedTab[];
}

export const buildUnsavedChangesDialogTourSteps = (
  driverJsTourService: DriverJsTourService,
  getDialogRef?: () => MatDialogRef<UnsavedChangesDialogComponent> | undefined
) => [
  {
    element: '.unsaved-changes-component',
    disableActiveInteraction: true,
    popover: {
      title: 'Ungespeicherte Änderungen',
      description:
        'Beim Verlassen der Seite werden ungespeicherte Änderungen automatisch erfasst und hier, geordnet nach Bereichen, angezeigt. Falls sie die Änderungen behalten möchten, drücken Sie auf "Abbrechen" und speichern Sie die Änderungen auf der Seite. Wenn die Änderungen verworfen werden sollen, drücken Sie auf "Seite verlassen".',
      onPopoverRender: (popover: PopoverDOM) =>
        driverJsTourService.placePopoverOntopDialog(popover),
      onPrevClick: () => {
        getDialogRef?.()?.close();
        driverJsTourService.getTourDriver().movePrevious();
      },
      onCloseClick: () => {
        getDialogRef?.()?.close();
        driverJsTourService.getTourDriver().destroy();
      },
      onNextClick: () => {
        getDialogRef?.()?.close();
        driverJsTourService.getTourDriver().moveNext();
      },
    },
  },
];

@Component({
  selector: 'app-unsaved-changes-dialog',
  imports: [MatIconModule, MatDialogModule, MatButtonModule, CommonModule],
  templateUrl: './unsaved-changes-dialog.component.html',
  styleUrl: './unsaved-changes-dialog.component.scss',
})
export class UnsavedChangesDialogComponent implements OnInit {
  constructor(private readonly driverJsTourService: DriverJsTourService) {}
  readonly dialogRef = inject(MatDialogRef<UnsavedChangesDialogComponent>);
  readonly data = inject<UnsavedChangesDialogData>(MAT_DIALOG_DATA);

  ngOnInit(): void {
    this.registerTourSteps();
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  private registerTourSteps() {
    this.driverJsTourService.registerStepsForComponent(UnsavedChangesDialogComponent, () =>
      buildUnsavedChangesDialogTourSteps(this.driverJsTourService, () => this.dialogRef)
    );
  }
}
