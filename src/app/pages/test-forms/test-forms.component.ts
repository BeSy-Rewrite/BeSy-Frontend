import { Component } from '@angular/core';
import { GenericFormPageComponent } from '../../components/generic-form-page/generic-form-page.component';
import { ADDRESS_FORM_CONFIG, SUPPLIER_FORM_CONFIG, PERSON_FORM_CONFIG } from '../../configs/form-configs';
import { ORDER_FORM_CONFIG } from '../../configs/order-form-config';
import { CommonModule } from '@angular/common';

// This component is used to test the GenericFormPageComponent with different configurations
// It allows switching between different forms (address, supplier, person, order) and displays the last submission data
// ToDo: Remove for production, this is only for testing purposes
@Component({
  selector: 'app-test-forms',
  standalone: true,
  imports: [GenericFormPageComponent, CommonModule],
  template: `
    <div style="padding: 20px;">
      <h1>Generic Form Component Test</h1>

      <div style="margin-bottom: 20px;">
        <button (click)="currentForm = 'address'" [style.background-color]="currentForm === 'address' ? '#193058' : '#ccc'" style="margin-right: 10px; padding: 10px; color: white; border: none; border-radius: 4px;">Address Form</button>
        <button (click)="currentForm = 'supplier'" [style.background-color]="currentForm === 'supplier' ? '#193058' : '#ccc'" style="margin-right: 10px; padding: 10px; color: white; border: none; border-radius: 4px;">Supplier Form</button>
        <button (click)="currentForm = 'person'" [style.background-color]="currentForm === 'person' ? '#193058' : '#ccc'" style="margin-right: 10px; padding: 10px; color: white; border: none; border-radius: 4px;">Person Form</button>
        <button (click)="currentForm = 'order'" [style.background-color]="currentForm === 'order' ? '#193058' : '#ccc'" style="margin-right: 10px; padding: 10px; color: white; border: none; border-radius: 4px;">Order Form</button>
      </div>

      <div *ngIf="currentForm === 'address'">
        <app-generic-form-page
          [config]="addressConfig"
          (formSubmitted)="onFormSubmitted('address', $event)"
          (formCancelled)="onFormCancelled('address')"
        ></app-generic-form-page>
      </div>

      <div *ngIf="currentForm === 'supplier'">
        <app-generic-form-page
          [config]="supplierConfig"
          (formSubmitted)="onFormSubmitted('supplier', $event)"
          (formCancelled)="onFormCancelled('supplier')"
        ></app-generic-form-page>
      </div>

      <div *ngIf="currentForm === 'person'">
        <app-generic-form-page
          [config]="personConfig"
          (formSubmitted)="onFormSubmitted('person', $event)"
          (formCancelled)="onFormCancelled('person')"
        ></app-generic-form-page>
      </div>

      <div *ngIf="currentForm === 'order'">
        <app-generic-form-page
          [config]="orderConfig"
          (formSubmitted)="onFormSubmitted('order', $event)"
          (formCancelled)="onFormCancelled('order')"
        ></app-generic-form-page>
      </div>

      <div *ngIf="lastSubmission" style="margin-top: 20px; padding: 15px; background-color: #f0f8ff; border-radius: 4px;">
        <h3>Last Form Submission:</h3>
        <p><strong>Type:</strong> {{ lastSubmission.type }}</p>
        <pre>{{ lastSubmission.data | json }}</pre>
      </div>
    </div>
  `
})
export class TestFormsComponent {
  currentForm = 'address';
  lastSubmission: any = null;

  addressConfig = ADDRESS_FORM_CONFIG;
  supplierConfig = SUPPLIER_FORM_CONFIG;
  personConfig = PERSON_FORM_CONFIG;
  orderConfig = ORDER_FORM_CONFIG;

  onFormSubmitted(entityType: string, data: any) {
    console.log(`${entityType} form submitted:`, data);
    this.lastSubmission = { type: entityType, data };
  }

  onFormCancelled(entityType: string) {
    console.log(`${entityType} form cancelled`);
  }
}
