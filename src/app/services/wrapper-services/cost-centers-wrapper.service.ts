import { Injectable } from '@angular/core';
import { CostCentersService } from '../../api';

@Injectable({
  providedIn: 'root'
})
export class CostCenterWrapperService {
  constructor() {}

  async getAllCostCenters() {
    const costCenters = await CostCentersService.getCostCenters();
    return costCenters;
  }

  async createCostCenter(costCenter: any) {
    const createdCostCenter = await CostCentersService.createCostCenter(costCenter);
    console.log("Created cost center:", createdCostCenter);
    return createdCostCenter;
  }
}
