import { TestBed } from '@angular/core/testing';

import { DriverJsTourService } from './driver.js-tour.service';

describe('DriverJsTourService', () => {
  let service: DriverJsTourService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DriverJsTourService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
