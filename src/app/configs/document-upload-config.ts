import { Validators } from "@angular/forms";
import { FormConfig } from "../components/form-component/form-component.component";

export const DOCUMENT_UPLOAD_FORM_CONFIG: FormConfig = {
    title: '',
    fields: [
        {
            name: 'id',
            label: 'Dokument-ID',
            type: 'text',
            required: true
        },
        {
            name: 'costCenterId',
            label: 'Kostenstelle',
            type: 'select',
            required: true,
        },
        {
            name: 'date',
            label: 'Datum',
            type: 'date',
            required: true,
            defaultValue: new Date(Date.now())
        },
        {
            name: 'price',
            label: 'Preis',
            type: 'number',
            required: true,
            validators: [Validators.min(0)]
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
