import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { UnsavedChangesDialogComponent, UnsavedChangesDialogData, UnsavedTab } from '../components/unsaved-changes-dialog/unsaved-changes-dialog.component';
import { MatDialog } from '@angular/material/dialog';

/**
 * Interface that components must implement to use the UnsavedChangesGuard.
 */
export interface HasUnsavedChanges {
  hasUnsavedChanges(): boolean;
  getUnsavedTabs(): UnsavedTab[];
}

@Injectable({
  providedIn: 'root'
})
export class UnsavedChangesGuard implements CanDeactivate<HasUnsavedChanges> {
  constructor(private readonly dialog: MatDialog) {}

  canDeactivate(
    component: HasUnsavedChanges,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState?: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {

    // Prevent opening multiple dialogs
    if (this.dialog.openDialogs.length > 0) {
      console.log('Dialog already open, skipping...');
      return this.dialog.openDialogs[0].afterClosed();
    }

    if (component.hasUnsavedChanges && component.hasUnsavedChanges()) {
      const unsavedTabs = component.getUnsavedTabs ? component.getUnsavedTabs() : [];

      const dialogRef = this.dialog.open(UnsavedChangesDialogComponent, {
        width: '500px',
        maxHeight: '80vh',
        data: { unsavedTabs } as UnsavedChangesDialogData,
        disableClose: true
      });

      return dialogRef.afterClosed();
    }
    return of(true);
  }
}
