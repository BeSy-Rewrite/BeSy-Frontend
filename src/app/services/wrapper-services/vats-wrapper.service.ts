import { Injectable } from '@angular/core';
import { VatsService } from '../../apiv2';

@Injectable({
  providedIn: 'root'
})
export class VatWrapperService {

  constructor(private readonly vatsService: VatsService) { }

  getAllVats() {
    return this.vatsService.getAllVats();
  }
}
