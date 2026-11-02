import { TestBed } from '@angular/core/testing';

import { OrderSaveService } from './order-save.service';

describe('OrderSaveService', () => {
  let service: OrderSaveService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrderSaveService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
