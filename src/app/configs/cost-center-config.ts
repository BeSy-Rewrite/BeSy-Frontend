import { Validators } from "@angular/forms";
import { FormConfig } from "../components/form-component/form-component.component";

export const COST_CENTER_FORM_CONFIG: FormConfig = {
  title: 'Neue Kostenstelle hinzufügen',
  fields: [
    {
      name: 'id',
      label: 'ID',
      type: 'text',
      required: true
    },
    {
      name: 'name',
      label: 'Kostenstellenname',
      type: 'text',
      required: true
    },
    {
      name: 'begin_date',
      label: 'Gültig ab',
      type: 'date',
      required: false
    },
    {
      name: 'end_date',
      label: 'Gültig bis',
      type: 'date',
      required: false
    },
    {
      name: 'comment',
      label: 'Kommentar',
      type: 'textarea',
      required: false,
      validators: [Validators.maxLength(255)]
    }
  ]
};
