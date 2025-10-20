import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ProgressBarComponent } from '../../../../components/progress-bar/progress-bar.component';
import { MatTabGroup, MatTabsModule } from '@angular/material/tabs';
import { MatDivider } from '@angular/material/divider';
import { FormComponent } from '../../../../components/form-component/form-component.component';
import {
  ORDER_PRIMARY_COST_CENTER_FORM_CONFIG,
  ORDER_GENERAL_FORM_CONFIG,
  ORDER_QUERIES_PERSON_FORM_CONFIG,
} from '../../../../configs/order/order-config';
import { AsyncPipe } from '@angular/common';
import { CostCenterResponseDTO } from '../../../../api';
import { CostCenterWrapperService } from '../../../../services/wrapper-services/cost-centers-wrapper.service';
import { PersonsWrapperService, PersonWithFullName } from '../../../../services/wrapper-services/persons-wrapper.service';

@Component({
  selector: 'app-create-order-page',
  imports: [
    ProgressBarComponent,
    MatTabsModule,
    MatTabGroup,
    MatDivider,
    FormComponent,
    MatAutocompleteModule,
  ],
  templateUrl: './create-order-page.component.html',
  styleUrls: ['./create-order-page.component.scss'],
})
export class CreateOrderPageComponent implements OnInit {
  progressBarStepIndex = 0; // assigned based on the current status of the order

  generalFormGroup = new FormGroup({});
  generalFormConfig = ORDER_GENERAL_FORM_CONFIG;

  costCenters: CostCenterResponseDTO[] = [];
  primaryCostCenterFormGroup = new FormGroup({});
  primaryCostCenterFormConfig = ORDER_PRIMARY_COST_CENTER_FORM_CONFIG;

  secondaryCostCenterFormGroup = new FormGroup({});
  secondaryCostCenterFormConfig = ORDER_PRIMARY_COST_CENTER_FORM_CONFIG;

  persons: PersonWithFullName[] = [];
  queriesPersonFormGroup = new FormGroup({});
  queriesPersonFormConfig = ORDER_QUERIES_PERSON_FORM_CONFIG;

  constructor(
    private costCenterWrapperService: CostCenterWrapperService,
    private personsWrapperService: PersonsWrapperService
  ) {}

  ngOnInit() {
    this.loadCostCenters();
    this.loadPersons();
  }

  private async loadCostCenters() {
    this.costCenters = await this.costCenterWrapperService.getAllCostCenters();
    const primaryCostCenterField = this.primaryCostCenterFormConfig.fields.find(
      (f) => f.name === 'primary_cost_center_id'
    );
    if (!primaryCostCenterField) return;

    primaryCostCenterField.options = this.costCenters.map((cc) => ({
      label: cc.name ?? '', // Falls name undefined -> leere Zeichenkette
      value: cc.id ?? 0, // Falls id undefined -> 0
    }));

    const secondaryCostCenterField = this.secondaryCostCenterFormConfig.fields.find(
      (f) => f.name === 'secondary_cost_center_id'
    );
    if (!secondaryCostCenterField) return;

    secondaryCostCenterField.options = this.costCenters.map((cc) => ({
      label: cc.name ?? '', // Falls name undefined -> leere Zeichenkette
      value: cc.id ?? 0, // Falls id undefined -> 0
    }));
  }

  private async loadPersons() {
    this.persons = await this.personsWrapperService.getAllPersonsWithFullName();
    const queriesPersonField = this.queriesPersonFormConfig.fields.find(
      (f) => f.name === 'queries_person_id'
    );
    if (!queriesPersonField) return;

    queriesPersonField.options = this.persons.map((p) => ({
      label: p.fullName ?? '', // Falls fullName undefined -> leere Zeichenkette
      value: p.id ?? 0, // Falls id undefined -> 0
    }));
  }

  createOrder() {
    // Implement order creation logic here
  }
}
