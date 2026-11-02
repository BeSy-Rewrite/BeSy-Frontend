import { InjectionToken } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { EditingFormattedOrder } from '../editing-formatted-order';
import { OrderEditTabIdentifier } from '../tabs/order-edit-tab.config';

export interface TabSaveStrategy {
  readonly tabIdentifier: OrderEditTabIdentifier;
  save(
    formGroup: FormGroup,
    order: EditingFormattedOrder
  ): Observable<Partial<EditingFormattedOrder>>;

  revert(): void;
}

/** Multi-Provider-Token – jede Tab-Strategy registriert sich hierüber. */
export const TAB_SAVE_STRATEGY = new InjectionToken<TabSaveStrategy[]>('TAB_SAVE_STRATEGY');
