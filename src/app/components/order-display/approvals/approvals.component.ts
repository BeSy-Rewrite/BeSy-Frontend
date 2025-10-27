import { Component, input, OnChanges, OnInit, signal } from '@angular/core';
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { APPROVALS_FIELD_DESCRIPTIONS, APPROVALS_FIELD_NAMES } from '../../../display-name-mappings/approvals-names';
import { OrdersWrapperService } from '../../../services/wrapper-services/orders-wrapper.service';

@Component({
  selector: 'app-approvals',
  imports: [
    MatCheckboxModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './approvals.component.html',
  styleUrl: './approvals.component.scss'
})
export class ApprovalsComponent implements OnInit, OnChanges {
  isInitialized = false;

  orderId = input.required<number>();
  approvals = signal<Map<string, boolean>>(new Map<string, boolean>());

  approvalNames = APPROVALS_FIELD_NAMES;
  approvalDescriptions = APPROVALS_FIELD_DESCRIPTIONS;

  constructor(private readonly ordersService: OrdersWrapperService) { }

  ngOnInit(): void {
    this.isInitialized = true;
    this.fetchData();
  }

  ngOnChanges(): void {
    if (this.isInitialized)
      this.fetchData();
  }

  fetchData(): void {
    this.ordersService.getOrderApprovals(this.orderId()).then(approvals => {
      for (const [key, value] of Object.entries(approvals)) {
        if (typeof value !== 'boolean') continue;
        this.approvals().set(key, value);
      }
    });
  }

}
