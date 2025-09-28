import { Validators } from "@angular/forms";
import { FormConfig } from "../components/form-component/form-component.component";

// Order Configuration (matches OrderRequestDTO - simplified version)
export const ORDER_FORM_CONFIG: FormConfig = {
  title: 'Neue Bestellung hinzufügen',
  fields: [
    {
      name: 'content_description',
      label: 'Inhaltsbeschreibung',
      type: 'text',
      required: false
    },
    {
      name: 'primary_cost_center_id',
      label: 'Primäre Kostenstelle ID',
      type: 'text',
      required: true
    },
    {
      name: 'booking_year',
      label: 'Buchungsjahr (z.B. 25)',
      type: 'text',
      required: true
    },
    {
      name: 'owner_id',
      label: 'Besitzer ID',
      type: 'number',
      required: false
    },
    {
      name: 'currency_short',
      label: 'Währung',
      type: 'text',
      required: false
    },
    {
      name: 'comment',
      label: 'Kommentar',
      type: 'textarea',
      required: false,
      validators: [Validators.maxLength(255)]
    },
    {
      name: 'comment_for_supplier',
      label: 'Kommentar für Lieferant',
      type: 'textarea',
      required: false,
      validators: [Validators.maxLength(255)]
    },
    {
      name: 'supplier_id',
      label: 'Lieferant ID',
      type: 'number',
      required: false
    },
    {
      name: 'delivery_person_id',
      label: 'Lieferperson ID',
      type: 'number',
      required: false
    },
    {
      name: 'invoice_person_id',
      label: 'Rechnungsperson ID',
      type: 'number',
      required: false
    }
  ]
};
