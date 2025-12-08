import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayableOrder } from '../../../models/displayable-order';
import { OrderAddressesComponent } from './order-addresses.component';

describe('OrderAddressesComponent', () => {
  let component: OrderAddressesComponent;
  let fixture: ComponentFixture<OrderAddressesComponent>;

  const mockOrderData: DisplayableOrder = {
    order: {
      id: 1,
      delivery_address_id: 1,
      invoice_address_id: 2,
    },
    orderDisplay: {
      id: '1',
      besy_number: 'TEST-001',
      primary_cost_center_id: '123',
      booking_year: '2025',
      auto_index: 1,
      created_date: '2025-01-01',
      legacy_alias: '',
      owner_id: '1',
      content_description: 'Test Order',
      status: 'PENDING',
      currency: 'EUR',
      comment: '',
      comment_for_supplier: '',
      quote_number: '',
      quote_sign: '',
      quote_date: '',
      quote_price: '',
      delivery_person_id: '',
      invoice_person_id: '',
      queries_person_id: '',
      customer_id: '',
      supplier_id: '',
      secondary_cost_center_id: '',
      fixed_discount: '',
      percentage_discount: '',
      cash_discount: '',
      cashback_days: '',
      last_updated_time: '',
      flag_decision_cheapest_offer: '',
      flag_decision_sole_supplier: '',
      flag_decision_contract_partner: '',
      flag_decision_other_reasons: '',
      decision_other_reasons_description: '',
      dfg_key: '',
    },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderAddressesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OrderAddressesComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('orderData', mockOrderData);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
