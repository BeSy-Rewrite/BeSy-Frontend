import { Component, input, OnInit, signal } from '@angular/core';
import { from } from 'rxjs';
import { AddressResponseDTO } from '../../../api-services-v2';
import { PersonsWrapperService } from '../../../services/wrapper-services/persons-wrapper.service';

type DisplayAddress = { [key in keyof AddressResponseDTO]: string };

@Component({
  selector: 'app-address-display',
  imports: [],
  templateUrl: './address-display.component.html',
  styleUrl: './address-display.component.scss'
})
export class AddressDisplayComponent implements OnInit {
  /**
   * The ID of the address to display.
   */
  addressId = input.required<number>();

  address = signal<DisplayAddress | undefined>(undefined);

  constructor(private readonly personsService: PersonsWrapperService) { }

  ngOnInit(): void {
    from(this.personsService.getPersonAddressById(this.addressId())).subscribe(address => {
      const addressDisplay: DisplayAddress = {};

      for (const [key, value] of Object.entries(address ?? {})) {
        addressDisplay[key as keyof DisplayAddress] = typeof value === 'string' ? value : value?.toString() ?? '';
      }
      this.address.set(addressDisplay);
    });
  }

}
