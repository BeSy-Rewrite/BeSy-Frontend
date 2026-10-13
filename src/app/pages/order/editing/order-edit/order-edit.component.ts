import { Component, inject, input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';
import { OrderDocumentsComponent } from '../../../../components/documents/order-documents/order-documents.component';
import { StateDisplayComponent } from '../../../../components/state-display/state-display.component';
import { DisplayableOrder } from '../../../../models/displayable-order';
import { EditingFormattedOrder } from '../editing-formatted-order';
import { OrderEditGeneralComponent } from '../order-edit-general/order-edit-general.component';
import { ORDER_EDITING_TABS, OrderEditTabIdentifier } from '../order-edit-tab.config';

@Component({
  selector: 'app-order-edit',
  imports: [
    RouterModule,
    MatDividerModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    StateDisplayComponent,
    OrderEditGeneralComponent,
    OrderDocumentsComponent,
  ],
  templateUrl: './order-edit.component.html',
  styleUrl: './order-edit.component.scss',
})
export class OrderEditComponent implements OnInit {
  protected readonly tabIdentifiers = OrderEditTabIdentifier;
  protected readonly tabs = ORDER_EDITING_TABS;

  private readonly formBuilder = inject(FormBuilder);

  protected readonly order = input.required<DisplayableOrder>();
  protected readonly formattedOrder = input.required<EditingFormattedOrder>();

  protected formGroup!: FormGroup;

  ngOnInit() {
    const groups: Partial<Record<OrderEditTabIdentifier, FormGroup>> = {};
    for (const tab of this.tabs) {
      groups[tab.identifier] = this.formBuilder.group({});
    }
    this.formGroup = this.formBuilder.group(groups);
  }

  protected saveTab(): void {
    const tabIdentifier = this.tabIdentifiers.GENERAL; // TODO: Replace with the actual tab identifier you want to save
    console.log(`Saving tab: ${tabIdentifier}`);
    const tabFormGroup = this.formGroup.get(tabIdentifier) as FormGroup;
    if (!tabFormGroup) {
      console.error(`Form group for tab ${tabIdentifier} not found.`);
      return;
    }
    console.log('Tab form values:', tabFormGroup.value);
    console.log('Tab form validity:', tabFormGroup.valid);
    console.log('Tab form errors:', tabFormGroup.errors);
  }

  protected saveAll(): void {
    console.log('Saving all forms...');
    console.log(this.formGroup.value);
    console.log('Form validity:', this.formGroup.valid);
    console.log('Form errors:', this.formGroup.errors);
    console.log(this.formGroup.pristine);
  }

  protected startTour(): void {
    console.log('Starting tour...');
  }
}
