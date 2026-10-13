import { TestBed } from '@angular/core/testing';

import { EditOrderFormattingService } from './edit-order-formatting.service';

describe('EditOrderFormattingService', () => {
  let service: EditOrderFormattingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EditOrderFormattingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
