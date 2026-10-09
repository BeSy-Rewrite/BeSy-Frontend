import { Component, DestroyRef, inject, input, OnInit, signal } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormComponent } from '../../../../components/form-component/form-component.component';
import { NEW_ORDER_GENERAL_FORM_CONFIG } from '../../../../configs/order/order-config';
import {
  patchAutocompleteOptions,
  patchFormDefaultValues,
} from '../../../../form-config-patching/form-config-patching.util';
import { DisplayableOrder } from '../../../../models/displayable-order';
import { CostCenterWrapperService } from '../../../../services/wrapper-services/cost-centers-wrapper.service';
import { PersonsWrapperService } from '../../../../services/wrapper-services/persons-wrapper.service';

@Component({
  selector: 'app-order-edit-general',
  imports: [FormComponent],
  templateUrl: './order-edit-general.component.html',
  styleUrl: './order-edit-general.component.scss',
})
export class OrderEditGeneralComponent implements OnInit {
  private readonly costCenterService = inject(CostCenterWrapperService);
  private readonly personsService = inject(PersonsWrapperService);
  private readonly destroyRef = inject(DestroyRef);

  protected generalFormConfig = signal(NEW_ORDER_GENERAL_FORM_CONFIG);

  generalFormGroup = input<FormGroup>(new FormGroup({}));
  order = input.required<DisplayableOrder>();

  ngOnInit() {
    if (!this.generalFormGroup) {
      throw new Error('generalFormGroup input is required');
    }

    patchAutocompleteOptions(
      this.generalFormConfig,
      {
        primary_cost_center_id: this.costCenterService.getAutocompleteOptions(),
        secondary_cost_center_id: this.costCenterService.getAutocompleteOptions(),
        person_id: this.personsService.getAllPersonsFormattedForAutocomplete(),
        queries_person_id: this.personsService.getAllPersonsFormattedForAutocomplete(),
      },
      this.destroyRef
    );
    patchFormDefaultValues(
      this.generalFormConfig,
      this.order().orderDisplay as any as Record<string, unknown>
    );
  }
}
