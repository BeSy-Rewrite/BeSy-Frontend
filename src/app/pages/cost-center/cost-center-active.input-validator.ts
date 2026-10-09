import { AbstractControl, ValidationErrors } from '@angular/forms';

export const costCenterActiveValidator = (control: AbstractControl): ValidationErrors | null => {
  const costCenter = control.value?.value;
  if (!costCenter) return null;

  if (
    typeof costCenter === 'object' &&
    'begin_date' in costCenter &&
    Date.parse(costCenter.begin_date) > Date.now()
  ) {
    return { inactiveCostCenter: { value: control.value } };
  }
  if (
    typeof costCenter === 'object' &&
    'end_date' in costCenter &&
    Date.parse(costCenter.end_date) < Date.now()
  ) {
    return { inactiveCostCenter: { value: control.value } };
  }
  return null;
};
