import { TestBed } from '@angular/core/testing';

import { ItemTablemodelMapperService } from './item-tablemodel-mapper.service';

describe('ItemTablemodelMapperService', () => {
  let service: ItemTablemodelMapperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ItemTablemodelMapperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
