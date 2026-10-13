import { NgClass } from '@angular/common';
import { Component, Inject, input, OnChanges, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { environment } from '../../../../environments/environment';
import { InvoiceResponseDTO, OrderResponseDTO, OrderStatus } from '../../../api-services-v2';
import { INVOICE_FIELD_NAMES } from '../../../display-name-mappings/invoice-names';
import { ButtonColor, TableActionButton, TableColumn } from '../../../models/generic-table';
import { InvoicesWrapperServiceService } from '../../../services/wrapper-services/invoices-wrapper-service.service';
import { formatDate, formatPriceToGerman } from '../../../utils/formatting';
import { GenericTableComponent } from '../../generic-table/generic-table.component';
import { DocumentPreviewComponent } from '../document-preview/document-preview.component';
import { DocumentUploadComponent } from '../document-upload/document-upload.component';

type DisplayableInvoice = Omit<InvoiceResponseDTO, 'price'> & {
  price?: string;
  tooltips?: { [K in keyof Partial<Omit<DisplayableInvoice, 'tooltips'>>]: string };
};

@Component({
  selector: 'app-order-documents',
  imports: [MatButtonModule, MatIconModule, GenericTableComponent, NgClass],
  templateUrl: './order-documents.component.html',
  styleUrl: './order-documents.component.scss',
})
export class OrderDocumentsComponent implements OnInit, OnChanges {
  /**
   * The order for which to display documents.
   */
  order = input.required<OrderResponseDTO>();

  orderStatus = OrderStatus;

  documents: DisplayableInvoice[] = [];
  documentPreviews = new Map<number, string>();

  dataSource = new MatTableDataSource<DisplayableInvoice>(this.documents);
  columns: TableColumn<DisplayableInvoice>[] = [
    { id: 'id', label: INVOICE_FIELD_NAMES.id, isInvisible: true },
    { id: 'comment', label: INVOICE_FIELD_NAMES.comment },
    { id: 'cost_center_id', label: INVOICE_FIELD_NAMES.cost_center_id, isInvisible: true },
    { id: 'price', label: INVOICE_FIELD_NAMES.price, isInvisible: true },
    { id: 'date', label: INVOICE_FIELD_NAMES.date },
    { id: 'created_date', label: INVOICE_FIELD_NAMES.created_date },
    {
      id: 'paperless_id',
      label: INVOICE_FIELD_NAMES.paperless_id,
      action: row => this.handlePaperlessIdClick(row),
    },
    { id: 'order_id', label: INVOICE_FIELD_NAMES.order_id, isInvisible: true },
  ];
  actions: TableActionButton[] = [
    {
      id: 'download',
      label: 'Herunterladen',
      buttonType: 'outlined',
      color: ButtonColor.PRIMARY,
      type: 'button',
      action: (row: DisplayableInvoice) => {
        if (row.id) this.downloadDocument(row);
      },
    },
    {
      id: 'preview',
      label: 'Vorschau',
      buttonType: 'outlined',
      color: ButtonColor.PRIMARY,
      type: 'button',
      action: (row: DisplayableInvoice) => {
        if (row.id) this.openDocumentPreview(row);
      },
    },
    {
      id: 'view',
      label: 'In Paperless anzeigen',
      buttonType: 'filled',
      color: ButtonColor.PRIMARY,
      type: 'button',
      action: (row: DisplayableInvoice) => {
        window.open(`${environment.paperlessUrl}/documents/${row.paperless_id}`, '_blank');
      },
    },
  ];

  constructor(
    private readonly invoicesService: InvoicesWrapperServiceService,
    private readonly _snackBar: MatSnackBar,
    private readonly dialogRef: MatDialog,
    @Inject(DomSanitizer) private readonly sanitizer: DomSanitizer
  ) {}

  /**
   * Initializes the component by fetching and formatting the order documents.
   */
  ngOnInit() {
    if (!this.order().id) {
      this._snackBar.open('Bestellungs-ID fehlerhaft', 'Schließen', { duration: 3000 });
      return;
    }
    this.invoicesService.getDocumentsByOrderId(this.order().id!).subscribe(invoices => {
      this.documents = invoices.map(invoice => ({
        ...invoice,
        date: formatDate(invoice.date),
        created_date: formatDate(invoice.created_date),
        price: formatPriceToGerman(invoice.price, 'EUR'),
        tooltips: {
          paperless_id: invoice.paperless_id
            ? 'Klicken zum Kopieren der Paperless ID'
            : 'Keine Paperless ID vorhanden. Klicke zum erneuten Hochladen.',
        },
      }));

      this.dataSource.data = this.documents;
    });
  }

  ngOnChanges() {
    this.ngOnInit();
  }

  /**
   * Downloads the specified document.
   * @param row The documents meta data.
   */
  downloadDocument(row: DisplayableInvoice) {
    if (!this.checkForValidIds(row)) return;

    this.invoicesService.downloadDocument(row.id!).subscribe(blob => {
      const link = document.createElement('a');
      const objectUrl = URL.createObjectURL(blob);
      link.href = objectUrl;
      link.download = `Dokument-${row.id}_Bestellung-${row.order_id}_Paperless-${row.paperless_id}_${row.comment}.pdf`;
      link.click();
      URL.revokeObjectURL(objectUrl);
    });
  }

  /**
   * Opens the document preview for the specified document.
   * @param row The document meta data.
   */
  openDocumentPreview(row: DisplayableInvoice) {
    if (!this.checkForValidIds(row)) return;

    this.invoicesService.getDocumentPreview(row.id!).subscribe(blob => {
      // The URL is safe because it is generated from a local Blob object.
      const objectUrl = URL.createObjectURL(blob);
      this.openPreviewDialog(row, this.sanitizer.bypassSecurityTrustUrl(objectUrl));
    });
  }

  /**
   * Opens the document preview dialog.
   * @param row The document meta data.
   * @param previewImageURL The sanitized URL of the preview image.
   */
  private openPreviewDialog(row: DisplayableInvoice, previewImageURL: SafeUrl) {
    this.dialogRef.open(DocumentPreviewComponent, {
      data: {
        title: `Vorschau für Dokument ${row.paperless_id} - Bestellung ${row.order_id}`,
        comment: row.comment,
        previewImageURL,
        onDownload: () => {
          this.downloadDocument(row);
        },
      },
    });
  }

  /**
   * Opens the document upload dialog.
   */
  openUploadDialog(invoiceId: string | undefined = undefined): void {
    this.dialogRef.open(DocumentUploadComponent, {
      data: {
        order: this.order(),
        invoiceId,
        onComplete: () => {
          this.ngOnInit();
        },
      },
      minWidth: '60%',
    });
  }

  /** Handles clicks on the paperless ID field. */
  handlePaperlessIdClick(row: DisplayableInvoice): void {
    if (row.paperless_id) {
      navigator.clipboard.writeText(row.paperless_id?.toString()).catch(err => {
        console.error('Failed to copy Paperless ID to clipboard:', err);
      });
    } else {
      console.log('No paperless ID, opening upload dialog');
      this.openUploadDialog(row.id);
    }
  }

  /** Checks if the document has valid IDs before performing actions. */
  private checkForValidIds(row: DisplayableInvoice): boolean {
    if (!row.id) {
      this._snackBar.open('Dokument-ID fehlerhaft', 'Schließen', { duration: 3000 });
      return false;
    }
    if (!row.paperless_id) {
      this._snackBar.open('Keine Paperless ID vorhanden für dieses Dokument.', 'Schließen', {
        duration: 3000,
      });
      return false;
    }
    return true;
  }
}
