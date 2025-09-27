import { TestBed } from '@angular/core/testing';

import { PersonsWrapperService } from './persons-wrapper.service';

describe('PersonsWrapperService', () => {
  let service: PersonsWrapperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PersonsWrapperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
