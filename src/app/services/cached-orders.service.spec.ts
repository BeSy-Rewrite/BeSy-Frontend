import { TestBed } from '@angular/core/testing';

import { CachedOrdersService } from './cached-orders.service';

describe('CachedOrdersService', () => {
  let service: CachedOrdersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CachedOrdersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
