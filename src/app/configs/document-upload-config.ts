import { Validators } from "@angular/forms";
import { FormConfig } from "../components/form-component/form-component.component";
import { INVOICE_FIELD_NAMES } from "../display-name-mappings/invoice-names";

export const DOCUMENT_UPLOAD_FORM_CONFIG: FormConfig = {
    title: '',
    fields: [
        {
            name: 'comment',
            label: INVOICE_FIELD_NAMES.comment,
            type: 'textarea',
            required: true,
            validators: [Validators.maxLength(255)]
        },
        {
            name: 'date',
            label: INVOICE_FIELD_NAMES.date,
            type: 'date',
            required: true,
            defaultValue: new Date(Date.now())
        },
    ]
};
