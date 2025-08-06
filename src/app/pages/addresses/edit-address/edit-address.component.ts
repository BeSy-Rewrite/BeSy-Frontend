import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { AddressesService, AddressResponseDTO } from '../../../api';
import { GenericFormPageComponent } from '../../../components/generic-form-page/generic-form-page.component';
import { ADDRESS_FORM_CONFIG } from '../../../configs/form-configs';

@Component({
  selector: 'app-edit-address',
  standalone: true,
  imports: [CommonModule, MatButtonModule, GenericFormPageComponent],
  templateUrl: './edit-address.component.html',
  styleUrls: ['./edit-address.component.css']
})
export class EditAddressComponent implements OnInit {
  addressData: AddressResponseDTO | null = null;
  loading = true;
  error: string | null = null;

  editFormConfig = {
    ...ADDRESS_FORM_CONFIG,
    title: 'Adresse bearbeiten',
    successMessage: 'Adresse erfolgreich aktualisiert',
  };

  constructor(private route: ActivatedRoute, private router: Router) {}

  /**
   * Initializes the component by fetching the address data based on the ID from the route parameters.
   * If the ID is valid, it retrieves the address details and sets the loading state to false.
   * If an error occurs during data retrieval, it sets an error message and stops loading.
   */
  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      try {
        this.addressData = await AddressesService.getAddressById(parseInt(id));
        this.loading = false;
      } catch (error) {
        this.error = 'Failed to load address details';
        this.loading = false;
        console.error('Error loading address:', error);
      }
    } else {
      this.error = 'No address ID provided';
      this.loading = false;
    }
  }

  
  onAddressUpdated(updatedData: any) {
    console.log('Address updated:', updatedData);
    // Navigate back to the addresses list
    this.router.navigate(['/addresses']);
  }
  onBack() {
    this.router.navigate(['/addresses']);
  }
}
