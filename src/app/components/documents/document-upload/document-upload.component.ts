import { Component, inject, OnInit, output, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSnackBar } from '@angular/material/snack-bar';
import { concat, merge, startWith } from 'rxjs';
import { DOCUMENT_UPLOAD_FORM_CONFIG } from '../../../configs/document-upload-config';
import { CostCenterWrapperService } from '../../../services/wrapper-services/cost-centers-wrapper.service';
import { InvoicesWrapperServiceService } from '../../../services/wrapper-services/invoices-wrapper-service.service';
import { FormComponent, FormConfig } from "../../form-component/form-component.component";
import { ProcessingIndicatorComponent } from '../../processing-indicator/processing-indicator.component';
import { DocumentPreviewComponent } from '../document-preview/document-preview.component';

export interface DocumentUploadData {
  orderId: number;
}

export interface InvoiceRequestDTO {
  id: string;
  cost_center_id: number;
  order_id: number;
  price?: number;
  date?: string;
  comment?: string;
  paperless_id?: number;
}

@Component({
  selector: 'app-document-upload',
  imports: [
    MatDialogModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    FormsModule,
    MatInputModule,
    MatRadioModule,
    FormComponent,
  ],
  templateUrl: './document-upload.component.html',
  styleUrl: './document-upload.component.scss'
})
export class DocumentUploadComponent implements OnInit {
  /**
   * Event emitted when the upload is successful.
   */
  uploadSuccessful = output<boolean>();

  readonly dialogRef = inject(MatDialogRef<DocumentPreviewComponent>);
  readonly data = inject<DocumentUploadData>(MAT_DIALOG_DATA);

  documentFormConfig: FormConfig = DOCUMENT_UPLOAD_FORM_CONFIG;
  documentFormGroup = new FormGroup({});

  readonly linkExistingDocument = new FormControl<boolean>(false);
  readonly existingDocumentId = new FormControl<number | null>(null, Validators.min(1));
  readonly selectedFile = signal<File | undefined>(undefined);

  processingIndicator: MatDialogRef<ProcessingIndicatorComponent> | undefined;

  /**
   * Computed property to determine if the form is valid for submission.
   */
  isValid = signal(false);

  constructor(
    private readonly costCentersService: CostCenterWrapperService,
    private readonly invoicesService: InvoicesWrapperServiceService,
    private readonly snackBar: MatSnackBar,
    private readonly dialog: MatDialog
  ) {
    const subscriptions = [
      this.documentFormGroup.valueChanges,
      this.linkExistingDocument.valueChanges,
      this.existingDocumentId.valueChanges,
    ];

    merge(...subscriptions).pipe(startWith([])).subscribe(() => {
      this.updateValidity();
    });
  }

  /**
   * Initializes the component by loading cost centers for the form.
   */
  ngOnInit(): void {
    this.costCentersService.getAllCostCenters().then(costCenters => {
      const costCenterField = this.documentFormConfig.fields.find(field => field.name === 'costCenterId');
      if (costCenterField) {
        costCenterField.options = costCenters.map(center => ({
          label: center.name ?? `Kostenstelle ${center.id}`,
          value: center.id ?? ''
        }));
      }
    });
  }

  /**
   * Updates the validity state of the form based on current inputs.
   */
  updateValidity(): void {
    const formValid = this.documentFormGroup.valid;
    const linkExisting = this.linkExistingDocument.value;
    const existingIdValid = this.existingDocumentId.value ? this.existingDocumentId.value > 0 : false;
    const fileSelected = this.selectedFile() !== undefined;
    this.isValid.set(formValid && (linkExisting ? existingIdValid : fileSelected));
  }

  /**
   * Handles the file input change event to store the selected file.
   * @param event The file input change event.
   */
  onFileSelected(event: any): void {
    this.selectedFile.set(event.target.files[0] ?? undefined);
    this.updateValidity();
  }

  /**
   * Handles the upload button click event to create the invoice and upload the file if necessary.
   */
  onUpload(): void {
    if (this.documentFormGroup.valid) {
      this.processingIndicator = this.dialog.open(ProcessingIndicatorComponent);

      const invoice = this.getInvoice();
      this.createInvoice(invoice);
    } else {
      this.snackBar.open('Bitte fülle alle erforderlichen Felder aus.', 'Schließen', {
        duration: 3000
      });
    }
  }

  /**
   * Constructs an InvoiceRequestDTO from the form values.
   * @returns The constructed InvoiceRequestDTO.
   */
  getInvoice(): InvoiceRequestDTO {
    const formValues: any = this.documentFormGroup.value;

    let paperlessId: number | undefined;
    if (this.linkExistingDocument.value) {
      const raw = this.existingDocumentId.value;
      if (raw) {
        const parsed = typeof raw === 'number' ? raw : Number.parseInt(String(raw), 10);
        paperlessId = Number.isNaN(parsed) || !Number.isInteger(parsed) || parsed < 1 ? undefined : parsed;
      } else {
        paperlessId = undefined;
      }
    }

    return {
      id: formValues.id,
      cost_center_id: formValues.costCenterId,
      order_id: this.data.orderId,
      price: formValues.price,
      date: formValues.date ? new Date(Date.parse(formValues.date)).toISOString().split('T')[0] : undefined,
      comment: formValues.comment,
      paperless_id: paperlessId
    };
  }

  /**
   * Creates a new invoice and uploads the associated file if necessary.
   * @param invoice The invoice data to create.
   */
  createInvoice(invoice: InvoiceRequestDTO): void {
    const observables = [this.invoicesService.createInvoiceForOrder(this.data.orderId, invoice)];
    if (!this.linkExistingDocument.value && this.selectedFile()) {
      observables.push(this.invoicesService.uploadInvoiceFile(invoice.id, this.selectedFile()!));
    }
    concat(...observables).subscribe({
      complete: () => {
        this.processingIndicator?.close();
        this.snackBar.open('Dokument erfolgreich hochgeladen.', 'Schließen', {
          duration: 3000
        });
        this.uploadSuccessful.emit(true);
        this.dialogRef.close(true);
      },
      error: (error) => {
        this.processingIndicator?.close();
        this.snackBar.open('Fehler beim Hochladen des Dokuments. Bitte versuchen Sie es erneut.', 'Schließen', {
          duration: 5000
        });
        this.uploadSuccessful.emit(false);
      }
    });
  }
}
