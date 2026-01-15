import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { CostCenterResponseDTO } from '../../../api-services-v2';
import { FormComponent } from '../../../components/form-component/form-component.component';
import { ProgressBarComponent } from '../../../components/progress-bar/progress-bar.component';
import {
  ORDER_GENERAL_FORM_CONFIG,
  ORDER_PRIMARY_COST_CENTER_FORM_CONFIG,
  ORDER_QUERIES_PERSON_FORM_CONFIG,
  ORDER_SECONDARY_COST_CENTER_FORM_CONFIG,
} from '../../../configs/order/order-config';
import { DriverJsTourService } from '../../../services/driver.js-tour.service';
import { CostCenterWrapperService } from '../../../services/wrapper-services/cost-centers-wrapper.service';
import {
  OrderResponseDTOFormatted,
  OrdersWrapperService,
} from '../../../services/wrapper-services/orders-wrapper.service';
import {
  PersonsWrapperService,
  PersonWithFullName,
} from '../../../services/wrapper-services/persons-wrapper.service';

@Component({
  selector: 'app-create-order-page',
  imports: [
    MatTabsModule,
    MatDivider,
    FormComponent,
    MatAutocompleteModule,
    MatButtonModule,
    ProgressBarComponent,
  ],
  templateUrl: './create-order-page.component.html',
  styleUrls: ['./create-order-page.component.scss'],
})
export class CreateOrderPageComponent implements OnInit {
  progressBarStepIndex = 0; // assigned based on the current status of the order

  postOrder: OrderResponseDTOFormatted = {};

  generalFormGroup = new FormGroup({});
  generalFormConfig = ORDER_GENERAL_FORM_CONFIG;

  costCenters: CostCenterResponseDTO[] = [];
  primaryCostCenterFormGroup = new FormGroup({});
  primaryCostCenterFormConfig = ORDER_PRIMARY_COST_CENTER_FORM_CONFIG;

  secondaryCostCenterFormGroup = new FormGroup({});
  secondaryCostCenterFormConfig = ORDER_SECONDARY_COST_CENTER_FORM_CONFIG;

  persons: PersonWithFullName[] = [];
  queriesPersonFormGroup = new FormGroup({});
  queriesPersonFormConfig = ORDER_QUERIES_PERSON_FORM_CONFIG;

  constructor(
    private readonly costCenterWrapperService: CostCenterWrapperService,
    private readonly personsWrapperService: PersonsWrapperService,
    private readonly _notifications: MatSnackBar,
    private readonly orderWrapperService: OrdersWrapperService,
    private readonly router: Router,
    private readonly driverJsTourService: DriverJsTourService
  ) { }

  async ngOnInit(): Promise<void> {
    // Load cost centers and persons
    [this.costCenters, this.persons] = await Promise.all([
      this.costCenterWrapperService.getAllCostCenters(),
      this.personsWrapperService.getAllPersonsWithFullName(),
    ]);

    // Format cost centers and persons for the autocomplete fields
    this.formatCostCenters();
    this.formatPersons();

    this.registerTourSteps();
  }

  /**
   * Updates the form configuration with the retrieved options.
   * @returns {Promise<void>}
   */
  private formatCostCenters() {
    const primaryCostCenterField = this.primaryCostCenterFormConfig.fields.find(
      f => f.name === 'primary_cost_center_id'
    );
    if (!primaryCostCenterField) return;

    primaryCostCenterField.options = this.costCenters.map(cc => ({
      label: `${cc.name ?? ''} (${cc.id ?? ''})`,
      value: cc.id ?? 0, // If id undefined -> 0
    }));

    const secondaryCostCenterField = this.secondaryCostCenterFormConfig.fields.find(
      f => f.name === 'secondary_cost_center_id'
    );
    if (!secondaryCostCenterField) return;

    secondaryCostCenterField.options = this.costCenters.map(cc => ({
      label: `${cc.name ?? ''} (${cc.id ?? ''})`,
      value: cc.id ?? 0, // If id undefined -> 0
    }));
  }

  /**
   * Loads all persons and updates the form configuration with the retrieved options.
   * @returns {Promise<void>}
   */
  private formatPersons() {
    const queriesPersonField = this.queriesPersonFormConfig.fields.find(
      f => f.name === 'queries_person_id'
    );
    if (!queriesPersonField) return;

    queriesPersonField.options = this.persons.map(p => ({
      label: p.fullName ?? '', // If fullName undefined -> empty string
      value: p.id ?? 0, // If id undefined -> 0
    }));
  }

  /**
   * Creates a new order based on the filled form data.
   * Validates the form data before sending the create request.
   */
  async createOrder() {
    if (
      this.generalFormGroup.valid &&
      this.primaryCostCenterFormGroup.valid &&
      this.secondaryCostCenterFormGroup.valid &&
      this.queriesPersonFormGroup.valid
    ) {
      // All forms are valid, normalize the autocomplete fields
      this.postOrder = {
        ...this.generalFormGroup.value,
        ...this.primaryCostCenterFormGroup.value,
        ...this.secondaryCostCenterFormGroup.value,
        ...this.queriesPersonFormGroup.value,
      } as OrderResponseDTOFormatted;

      const requestOrder = this.orderWrapperService.mapFormattedOrderToRequest(this.postOrder);

      // Create order, show notifications based on the result
      // and navigate to the edit page of the newly created order
      const createdOrder = await this.orderWrapperService.createOrder(requestOrder).catch(error => {
        console.error('Error creating order:', error);
        return null;
      });
      console.log('Created Order:', createdOrder);

      if (createdOrder?.id) {
        this._notifications.open('Bestellung erfolgreich erstellt.', 'Schließen', {
          duration: 5000,
        });

        // Navigate to the edit page of the newly created order
        this.router.navigate(['/orders', createdOrder.id, 'edit']);
      } else {
        this._notifications.open(
          'Interner Fehler beim Erstellen der Bestellung. Bitte versuchen Sie es später erneut.',
          'Schließen',
          {
            duration: 5000,
          }
        );
      }
    } else {
      this.generalFormGroup.markAllAsTouched();
      this._notifications.open('Bitte füllen Sie alle Pflichtfelder aus.', 'Schließen', {
        duration: 5000,
      });
    }
  }

  private registerTourSteps() {
    this.driverJsTourService.registerStepsForComponent(CreateOrderPageComponent, () => [
      {
        element: '.general-info-container',
        popover: {
          title: 'Allgemeine Informationen',
          description: 'Geben Sie hier die allgemeinen Informationen zur Bestellung ein.',
        },
      },
      {
        element: '.tour-order-create-button',
        popover: {
          title: 'Bestellung erstellen',
          description:
            'Klicken Sie hier, um die Bestellung zu erstellen, sobald alle erforderlichen Informationen eingegeben wurden.',
        },
      },
    ]);
  }
}
