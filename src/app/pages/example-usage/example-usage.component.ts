import { Component } from '@angular/core';
import { GenericFormPageComponent } from '../../components/generic-form-page/generic-form-page.component';
import { ADDRESS_FORM_CONFIG, SUPPLIER_FORM_CONFIG, PERSON_FORM_CONFIG } from '../../configs/form-configs';
import { ORDER_FORM_CONFIG } from '../../configs/order-form-config';

@Component({
  selector: 'app-example-usage',
  standalone: true,
  imports: [GenericFormPageComponent],
  template: `
    <div style="padding: 20px;">
      <h2>Generic Form Page Examples</h2>
      
      <div style="margin-bottom: 40px;">
        <h3>Create Address</h3>
        <app-generic-form-page 
          [config]="addressConfig"
          (formSubmitted)="onFormSubmitted('address', $event)"
          (formCancelled)="onFormCancelled('address')"
        ></app-generic-form-page>
      </div>

      <div style="margin-bottom: 40px;">
        <h3>Create Supplier</h3>
        <app-generic-form-page 
          [config]="supplierConfig"
          (formSubmitted)="onFormSubmitted('supplier', $event)"
          (formCancelled)="onFormCancelled('supplier')"
        ></app-generic-form-page>
      </div>

      <div style="margin-bottom: 40px;">
        <h3>Create Person/User</h3>
        <app-generic-form-page 
          [config]="personConfig"
          (formSubmitted)="onFormSubmitted('person', $event)"
          (formCancelled)="onFormCancelled('person')"
        ></app-generic-form-page>
      </div>

      <div style="margin-bottom: 40px;">
        <h3>Create Order</h3>
        <app-generic-form-page 
          [config]="orderConfig"
          (formSubmitted)="onFormSubmitted('order', $event)"
          (formCancelled)="onFormCancelled('order')"
        ></app-generic-form-page>
      </div>
    </div>
  `
})
export class ExampleUsageComponent {
  addressConfig = ADDRESS_FORM_CONFIG;
  supplierConfig = SUPPLIER_FORM_CONFIG;
  personConfig = PERSON_FORM_CONFIG;
  orderConfig = ORDER_FORM_CONFIG;

  onFormSubmitted(entityType: string, data: any) {
    console.log(`${entityType} form submitted:`, data);
    // Handle form submission - e.g., navigate to list view, show success message, etc.
  }

  onFormCancelled(entityType: string) {
    console.log(`${entityType} form cancelled`);
    // Handle form cancellation - e.g., navigate back, reset form, etc.
  }
}