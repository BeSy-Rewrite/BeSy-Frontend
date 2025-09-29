import { TestBed } from '@angular/core/testing';

import { OrderSubresourceResolverService } from './order-subresource-resolver.service';

describe('OrderSubresourceResolverService', () => {
  let service: OrderSubresourceResolverService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrderSubresourceResolverService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
