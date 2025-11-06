import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { VatsService } from '../../api-services-v2';

@Injectable({
  providedIn: 'root'
})
export class VatWrapperService {
  constructor(private readonly vatsService: VatsService) { }

  async getAllVats() {
    return await lastValueFrom(this.vatsService.getAllVats());
  }
}
