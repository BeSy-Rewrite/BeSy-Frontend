import { TestBed } from '@angular/core/testing';

import { OrderStateValidityService } from './order-state-validity.service';

describe('OrderStateValidityService', () => {
  let service: OrderStateValidityService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrderStateValidityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
