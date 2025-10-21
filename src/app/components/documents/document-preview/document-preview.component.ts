import { Component, inject } from '@angular/core';
import { MatButtonModule } from "@angular/material/button";
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { SafeResourceUrl } from '@angular/platform-browser';

export interface DocumentPreviewData {
  title: string;
  comment?: string;
  previewImageURL: SafeResourceUrl;
  onDownload: () => void;
}

@Component({
  selector: 'app-document-preview',
  imports: [
    MatDialogModule,
    MatButtonModule
  ],
  templateUrl: './document-preview.component.html',
  styleUrl: './document-preview.component.scss'
})
export class DocumentPreviewComponent {

  readonly dialogRef = inject(MatDialogRef<DocumentPreviewComponent>);
  readonly data = inject<DocumentPreviewData>(MAT_DIALOG_DATA);

}
