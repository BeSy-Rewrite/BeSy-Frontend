import { Injectable } from '@angular/core';
import { CostCentersService } from '../../apiv2/api/costCenters.service';
import { CostCenterRequestDTO } from '../../apiv2';

@Injectable({
  providedIn: 'root'
})
export class CostCenterWrapperService {
  constructor(private readonly costCenterService: CostCentersService) { }

  getAllCostCenters() {
    return this.costCenterService.getCostCenters();
  }

  createCostCenter(costCenter: CostCenterRequestDTO) {
    return this.costCenterService.createCostCenter(costCenter);
  }
}
