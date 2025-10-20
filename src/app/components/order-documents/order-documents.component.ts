import { Component, input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { DomSanitizer } from '@angular/platform-browser';
import { InvoiceResponseDTO, OrderResponseDTO } from '../../api';
import { INVOICE_FIELD_NAMES } from '../../display-name-mappings/invoice-names';
import { ButtonColor, TableActionButton, TableColumn } from '../../models/generic-table';
import { OrderSubresourceResolverService } from '../../services/order-subresource-resolver.service';
import { InvoicesWrapperServiceService } from '../../services/wrapper-services/invoices-wrapper-service.service';
import { DocumentPreviewComponent } from '../document-preview/document-preview.component';
import { GenericTableComponent } from "../generic-table/generic-table.component";

type DisplayableInvoice = Omit<InvoiceResponseDTO, 'price'> & {
  price?: string;
  tooltips?: { [K in keyof Partial<Omit<DisplayableInvoice, 'tooltips'>>]: string };
};

@Component({
  selector: 'app-order-documents',
  imports: [GenericTableComponent],
  templateUrl: './order-documents.component.html',
  styleUrl: './order-documents.component.scss'
})
export class OrderDocumentsComponent implements OnInit {
  // TODO: Add upload functionality
  /**
   * The order for which to display documents.
   */
  order = input.required<OrderResponseDTO>();

  documents: DisplayableInvoice[] = [];
  documentPreviews = new Map<number, string>();

  dataSource = new MatTableDataSource<DisplayableInvoice>(this.documents);
  columns: TableColumn<DisplayableInvoice>[] = [
    { id: 'comment', label: INVOICE_FIELD_NAMES.comment },
    { id: 'cost_center_id', label: INVOICE_FIELD_NAMES.cost_center_id },
    { id: 'price', label: INVOICE_FIELD_NAMES.price },
    { id: 'date', label: INVOICE_FIELD_NAMES.date },
    { id: 'created_date', label: INVOICE_FIELD_NAMES.created_date },
    {
      id: 'paperless_id', label: INVOICE_FIELD_NAMES.paperless_id, action(row) {
        if (row.paperless_id)
          navigator.clipboard.writeText(row.paperless_id?.toString());
      },
    },
    { id: 'order_id', label: INVOICE_FIELD_NAMES.order_id, isInvisible: true }
  ];
  actions: TableActionButton[] = [
    {
      id: 'download',
      label: 'Herunterladen',
      buttonType: 'outlined',
      color: ButtonColor.PRIMARY,
      action: (row: DisplayableInvoice) => {
        if (row.id)
          this.downloadDocument(row);
      }
    },
    {
      id: 'preview',
      label: 'Vorschau',
      buttonType: 'outlined',
      color: ButtonColor.PRIMARY,
      action: (row: DisplayableInvoice) => {
        if (row.id)
          this.openDocumentPreview(row);
      }
    }
  ];

  constructor(
    private readonly invoicesService: InvoicesWrapperServiceService,
    private readonly resourceResolverService: OrderSubresourceResolverService,
    private readonly _snackBar: MatSnackBar,
    private readonly dialogRef: MatDialog,
    private readonly sanitizer: DomSanitizer
  ) { }

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
        date: this.resourceResolverService.formatDate(invoice.date),
        created_date: this.resourceResolverService.formatDate(invoice.created_date),
        price: this.resourceResolverService.formatPrice(invoice.price, 'EUR'),
        tooltips: {
          paperless_id: invoice.paperless_id ? 'Klicken zum Kopieren der Paperless ID' : 'Keine Paperless ID vorhanden'
        }
      }));

      this.dataSource.data = this.documents;
    });
  }

  /**
   * Downloads the specified document.
   * @param row The documents meta data.
   */
  downloadDocument(row: DisplayableInvoice) {
    if (!row.id) {
      this._snackBar.open('Dokument-ID fehlerhaft', 'Schließen', { duration: 3000 });
      return;
    }
    this.invoicesService.downloadDocument(row.id).subscribe(blob => {
      const link = document.createElement('a')
      console.log(typeof blob);
      const objectUrl = URL.createObjectURL(blob)
      link.href = objectUrl
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
    if (!row.id) {
      this._snackBar.open('Dokument-ID fehlerhaft', 'Schließen', { duration: 3000 });
      return;
    }

    this.invoicesService.getDocumentPreview(row.id).subscribe(blob => {
      const objectUrl = URL.createObjectURL(blob);
      this.openPreviewDialog(row, objectUrl);
    });
  }

  /**
   * Opens the document preview dialog.
   * @param row The document meta data.
   * @param previewImageURL The URL of the preview image.
   */
  openPreviewDialog(row: DisplayableInvoice, previewImageURL: string) {
    this.dialogRef.open(DocumentPreviewComponent, {
      data: {
        title: `Vorschau für Dokument ${row.id} - Bestellung ${row.order_id}`,
        comment: row.comment,
        previewImageURL: this.sanitizer.bypassSecurityTrustUrl(previewImageURL),
        onDownload: () => {
          this.downloadDocument(row);
        }
      },
    });
  }

}
