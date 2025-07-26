import { TestBed } from '@angular/core/testing';

import { ApproveOrdersGuard } from './approve-orders.guard';

describe('ApproveOrdersGuard', () => {
  let guard: ApproveOrdersGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(ApproveOrdersGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
