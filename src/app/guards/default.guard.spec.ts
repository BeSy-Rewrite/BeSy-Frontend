import { TestBed } from '@angular/core/testing';

import { DefaultGuard } from './default.guard';

describe('DefaultGuard', () => {
  let guard: DefaultGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(DefaultGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
