import { TestBed } from '@angular/core/testing';

import { MailTrackingService } from './mail-tracking.service';

describe('MailTrackingService', () => {
  let service: MailTrackingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MailTrackingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
