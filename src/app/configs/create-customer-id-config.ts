import { Validators } from "@angular/forms";
import { FormConfig } from "../components/form-component/form-component.component";

export const CUSTOMER_ID_FORM_CONFIG: FormConfig = {
  title: 'Kundennummer anlegen (optional)',
  fields: [
    {
      name: 'customer_id',
      label: 'Kundennummer',
      type: 'text',
      required: false,
      editable: true,
      tooltip: 'Interne oder vom Lieferanten vergebene Kundennummer. Diese wird später zum Erstellen einer Bestellungen benötigt. Falls möglich bitte angeben.'
    },
    {
      name: 'comment',
      label: 'Kommentar',
      type: 'textarea',
      required: false,
      editable: true,
      tooltip: 'Geben Sie hier etwas nützliches ein, das andere Besteller bei der Auswahl der Kundennummer unterstützen könnte.',
      validators: [Validators.maxLength(255)]
    }
  ]
};
