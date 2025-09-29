import { TestBed } from '@angular/core/testing';

import { OrdersDataSourceService } from './orders-data-source.service';

describe('OrdersDataSourceService', () => {
  let service: OrdersDataSourceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrdersDataSourceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
