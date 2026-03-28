import { TestBed } from '@angular/core/testing';

import { RepmanageserviceService } from './repmanageservice.service';

describe('RepmanageserviceService', () => {
  let service: RepmanageserviceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RepmanageserviceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
