import { Injectable } from '@angular/core';
import { VatSService } from '../../api';

@Injectable({
  providedIn: 'root'
})
export class VatWrapperService {

  async getAllVats() {
    const vats = await VatSService.getAllVats();
    return vats;
  }
}
