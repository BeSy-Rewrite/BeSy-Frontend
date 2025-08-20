import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { AddressesService, AddressResponseDTO } from '../../../api';

@Component({
  selector: 'app-address-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule
  ],
  templateUrl: './address-detail.component.html',
  styleUrl: './address-detail.component.css'
})
export class AddressDetailComponent implements OnInit {
  addressData: AddressResponseDTO | null = null;
  loading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

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
        // Redirect to 404 if address not found
        this.router.navigate(['/not-found']);
      }
    } else {
      this.error = 'No address ID provided';
      this.loading = false;
      this.router.navigate(['/not-found']);
    }
  }

  onEdit() {
    if (this.addressData) {
      this.router.navigate(['/addresses/', this.addressData.id, '/edit']);
    }
  }

  onBack() {
    this.router.navigate(['/addresses']);
  }
}
