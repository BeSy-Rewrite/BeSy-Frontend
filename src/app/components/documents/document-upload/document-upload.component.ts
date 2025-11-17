import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSnackBar } from '@angular/material/snack-bar';
import { merge, mergeMap, startWith, tap } from 'rxjs';
import { OrderResponseDTO } from '../../../api-services-v2';
import { DOCUMENT_UPLOAD_FORM_CONFIG } from '../../../configs/document-upload-config';
import { DocumentDTO } from '../../../models/document-invoice';
import { CostCenterWrapperService } from '../../../services/wrapper-services/cost-centers-wrapper.service';
import { InvoicesWrapperServiceService } from '../../../services/wrapper-services/invoices-wrapper-service.service';
import { FileInputComponent } from '../../file-input/file-input.component';
import { FormComponent, FormConfig } from "../../form-component/form-component.component";
import { ProcessingIndicatorComponent, ProcessingIndicatorData } from '../../processing-indicator/processing-indicator.component';
import { DocumentPreviewComponent } from '../document-preview/document-preview.component';

export interface DocumentUploadData {
  order: OrderResponseDTO;
  onComplete?: (success: boolean) => void;
  invoiceId?: string;
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
    FileInputComponent
  ],
  templateUrl: './document-upload.component.html',
  styleUrl: './document-upload.component.scss'
})
export class DocumentUploadComponent implements OnInit {

  readonly dialogRef = inject(MatDialogRef<DocumentPreviewComponent>);
  readonly data = inject<DocumentUploadData>(MAT_DIALOG_DATA);

  documentFormConfig: FormConfig = DOCUMENT_UPLOAD_FORM_CONFIG;
  documentFormGroup = new FormGroup({});

  readonly linkExistingDocument = new FormControl<boolean>(false);
  readonly existingDocumentId = new FormControl<number | null>(null, Validators.min(1));
  readonly selectedFile = signal<File | undefined>(undefined);

  processingIndicator: MatDialogRef<ProcessingIndicatorComponent> | undefined;
  isUploadComplete = signal(false);

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

    if (this.data.invoiceId) {
      this.isValid.set(fileSelected);
    } else {
      this.isValid.set(formValid && (linkExisting ? existingIdValid : fileSelected));
    }
  }

  /**
   * Handles the file input change event to store the selected file.
   * @param file The file input change event.
   */
  onFileSelected(file: File | undefined): void {
    this.selectedFile.set(file ?? undefined);
    this.updateValidity();
  }

  /**
   * Handles the upload button click event to create the document and upload the file if necessary.
   */
  onUpload(): void {
    if (this.documentFormGroup.valid) {
      const data: ProcessingIndicatorData = { isClosable: this.isUploadComplete };
      this.processingIndicator = this.dialog.open(ProcessingIndicatorComponent, { data });

      this.handleUpload();
    } else {
      this.snackBar.open('Bitte fülle alle erforderlichen Felder aus.', 'Schließen', {
        duration: 3000
      });
    }
  }

  /** 
   * Constructs a DocumentDTO from the form values.
   * @returns The constructed DocumentDTO.
   */
  getDocumentDTO(): DocumentDTO {
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
      date: new Date(),
      comment: formValues.comment,
      paperless_id: paperlessId
    };
  }

  /**
   * Handles the upload process, either linking an existing document or creating a new one.
   */
  handleUpload(): void {
    let uploadObservable;
    if (this.data.invoiceId) {
      this.isUploadComplete.set(true);
      this.processingIndicator?.afterClosed().subscribe(() => {
        this.dialogRef.close(true);
      });
      uploadObservable = this.invoicesService.uploadInvoiceFile(this.data.invoiceId, this.selectedFile()!);
    } else {
      uploadObservable = this.createDocument(this.getDocumentDTO());
    }

    uploadObservable.subscribe({
      next: () => {
        this.snackBar.open('Dokument erfolgreich verarbeitet.', 'Schließen', {
          duration: 3000
        });
        this.data.onComplete?.(true);
        this.processingIndicator?.close();
        this.dialogRef.close(true);
      },
      error: () => {
        this.snackBar.open('Fehler beim Verarbeiten des Dokuments. Bitte versuchen Sie es erneut.', 'Schließen', {
          duration: 5000
        });
        this.data.onComplete?.(false);
        this.processingIndicator?.close();
      }
    });
  }

  /**
   * Creates a document for the current order and uploads the associated file.
   * @param document The document data to create.
   * @returns An observable of the created invoice response.
   */
  createDocument(document: DocumentDTO) {
    return this.invoicesService.createDocumentForOrder(this.data.order.id!, document).pipe(
      tap({
        next: () => {
          this.isUploadComplete.set(true);
          this.processingIndicator?.afterClosed().subscribe(() => {
            this.dialogRef.close(true);
          });
        },
        error: () => {
          this.snackBar.open('Fehler beim Hochladen des Dokuments. Bitte versuchen Sie es erneut.', 'Schließen', {
            duration: 5000
          });
          this.data.onComplete?.(false);
          this.processingIndicator?.close();
        }
      }),
      mergeMap(createdInvoice => this.invoicesService.uploadInvoiceFile(createdInvoice.id!, this.selectedFile()!))
    );
  }
}
