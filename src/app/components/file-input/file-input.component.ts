import { Component, input, output, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-file-input',
  imports: [
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './file-input.component.html',
  styleUrl: './file-input.component.scss'
})
export class FileInputComponent {

  /**
   * Determines whether selecting a file is required.
   */
  required = input<boolean>(false);

  accept = input<string>('*/*');

  /**
   * Emits the selected file when it changes.
   */
  fileChange = output<File | undefined>();

  selectedFile = signal<File | undefined>(undefined);

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile.set(input.files[0]);
    }
    this.fileChange.emit(this.selectedFile());
  }
}
