import { Validators } from "@angular/forms";
import { FormConfig } from "../components/form-component/form-component.component";

// Person Form Configuration
// Layout:
// FormConfig = {
//   title: Anzeigetitel des mat-tabs
//   fields: FormField[
//        {
//          name: Entspricht dem Feld in der DTO
//          label: Anzeigename des Feldes in der UI
//          type: Art der Form, die verwendet wird
//          required: Ob das Feld ausgefüllt werden muss
//          options?: Drop-Down-Menü / Label der radio-buttons
//          validators?: Validierung des Feldes
//        }
//      ];
// }

// Person Configuration (matches PersonRequestDTO)
export const PERSON_FORM_CONFIG: FormConfig = {
  title: '1. Neue Person anlegen',
  subtitle: 'Persondaten eingeben',
  fields: [
    {
      name: 'name',
      label: 'Vorname',
      type: 'text',
      required: true,
      validators: [Validators.maxLength(255)]
    },
    {
      name: 'surname',
      label: 'Nachname',
      type: 'text',
      required: true,
      validators: [Validators.maxLength(255)]
    },

    {
      name: 'gender',
      label: 'Geschlecht',
      type: 'radio',
      required: true,
      options: [
        { value: 'm', label: 'Männlich' },
        { value: 'f', label: 'Weiblich' },
        { value: 'd', label: 'Divers' }
      ],
      defaultValue: 'd'
    },
    {
      name: 'title',
      label: 'Titel',
      type: 'text',
      required: false,
      validators: [Validators.maxLength(255)]
    },
    {
      name: 'email',
      label: 'E-Mail',
      type: 'email',
      required: false,
      validators: [Validators.email]
    },
    {
      name: 'phone',
      label: 'Telefon',
      type: 'tel',
      required: false,
      validators: [Validators.pattern(/^\+?[0-9\s\-()]*$/)]
    },
    {
      name: 'fax',
      label: 'Fax',
      type: 'text',
      required: false,
      validators: [Validators.pattern(/^\+?[0-9\s\-()]*$/)]
    },
    {
      name: 'comment',
      label: 'Kommentar',
      type: 'textarea',
      required: false,
      validators: [Validators.maxLength(255)]
    },
  ]
};
