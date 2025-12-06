import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { DriverJsTourService } from './driver.js-tour.service';

describe('DriverJsTourService', () => {
  let service: DriverJsTourService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: Router,
          useValue: {
            navigate: jasmine.createSpy('navigate').and.returnValue(Promise.resolve(true)),
          },
        },
      ],
    });
    service = TestBed.inject(DriverJsTourService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
