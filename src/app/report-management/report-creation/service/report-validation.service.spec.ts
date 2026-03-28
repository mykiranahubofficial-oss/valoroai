import { TestBed } from '@angular/core/testing';

import { ReportValidationService } from './report-validation.service';

describe('ReportValidationService', () => {
  let service: ReportValidationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReportValidationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
