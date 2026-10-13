import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { formattedOrderResolver } from './formatted-order.resolver';

describe('formattedOrderResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) =>
    TestBed.runInInjectionContext(() => formattedOrderResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
