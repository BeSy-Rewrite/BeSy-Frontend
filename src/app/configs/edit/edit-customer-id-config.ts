import { Validators } from "@angular/forms";
import { FormConfig } from "../../components/form-component/form-component.component";

export const EDIT_CUSTOMER_ID_FORM_CONFIG: FormConfig = {
  title: 'Neue Kundennummer hinzufügen',
  fields: [
    {
      name: 'customer_table',
      label: 'Kundentabelle',
      type: 'table',
      required: false,
      editable: true
    },
    {
      name: 'customer_id',
      label: 'Kundennummer',
      type: 'text',
      required: true,
      editable: true,
      tooltip: 'Interne oder vom Lieferanten vergebene Kundennummer. Diese wird später zum Erstellen einer Bestellungen benötigt.'
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
