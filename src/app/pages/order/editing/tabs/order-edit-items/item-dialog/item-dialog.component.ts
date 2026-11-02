import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { shareReplay, take } from 'rxjs';
import { environment } from '../../../../../../../environments/environment';
import {
  FormComponent,
  FormConfig,
} from '../../../../../../components/form-component/form-component.component';
import { ORDER_ITEM_FORM_CONFIG } from '../../../../../../configs/order/order-item-config';
import {
  patchAutocompleteOptions,
  patchFormDefaultValues,
} from '../../../../../../form-config-patching/form-config-patching.util';
import { VatWrapperService } from '../../../../../../services/wrapper-services/vats-wrapper.service';
import { ItemTableModel } from '../item-table-model';

@Component({
  selector: 'app-item-dialog',
  imports: [MatDialogModule, MatButtonModule, FormComponent],
  templateUrl: './item-dialog.component.html',
  styleUrl: './item-dialog.component.scss',
})
export class ItemDialogComponent implements OnInit {
  private readonly dialogRef = inject(MatDialogRef<ItemDialogComponent>);
  private readonly destroyRef = inject(DestroyRef);
  private readonly vatService = inject(VatWrapperService);

  private readonly itemData: ItemTableModel = inject(MAT_DIALOG_DATA);
  protected readonly isEditMode = signal(!!this.itemData);

  protected itemFormConfig = signal<FormConfig>(ORDER_ITEM_FORM_CONFIG);
  itemFormGroup = new FormGroup<Partial<Record<keyof ItemTableModel, any>>>({});

  ngOnInit() {
    const vatOptions$ = this.vatService.getAllVatsFormattedForAutocomplete().pipe(shareReplay(1));

    patchAutocompleteOptions(
      this.itemFormConfig,
      {
        vat_value: vatOptions$,
      },
      this.destroyRef
    );

    vatOptions$.pipe(take(1)).subscribe(options => {
      const vatRate = Number(
        this.itemData?.vat_value ?? this.itemData?.vat?.value ?? environment.defaultVatValue
      );
      // Only fields present in the config are touched, so spreading the whole item is safe.
      patchFormDefaultValues(this.itemFormConfig, {
        ...this.itemData,
        vat_value: options.find(option => option.value.value === vatRate),
      });
    });

    if (this.isEditMode()) {
      this.itemFormConfig.update(config => ({
        ...config,
        title: 'Artikel bearbeiten',
        subtitle: 'Bearbeiten Sie die Details des Artikels.',
      }));
    }
  }

  confirmAddItem() {
    if (!this.itemFormGroup.valid) {
      this.itemFormGroup.markAllAsTouched();
      return;
    }

    const formValue = this.itemFormGroup.value;

    console.log('Form submitted with value:', formValue);

    const newItem: ItemTableModel = {
      ...this.itemData,
      ...formValue,
      vat_value: formValue?.vat_value?.value,
    };

    console.log('Confirming add item with data:', newItem);
    this.dialogRef.close(newItem);
  }

  cancelAddItem() {
    this.dialogRef.close();
  }
}
