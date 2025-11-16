import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { CostCentersService } from '../../api-services-v2';

@Injectable({
  providedIn: 'root'
})
export class CostCenterWrapperService {
  constructor(private readonly costCentersService: CostCentersService) { }

  async getAllCostCenters() {
    return await lastValueFrom(this.costCentersService.getCostCenters());
  }

  async createCostCenter(costCenter: any) {
    return await lastValueFrom(this.costCentersService.createCostCenter(costCenter));
  }
}
