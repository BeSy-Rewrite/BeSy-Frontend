import { TestBed } from '@angular/core/testing';

import { OrdersWrapperService } from './orders-wrapper.service';

describe('OrdersWrapperService', () => {
  let service: OrdersWrapperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrdersWrapperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
