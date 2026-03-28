import { TestBed } from '@angular/core/testing';

import { PhotoOrganizerService } from './photo-organizer.service';

describe('PhotoOrganizerService', () => {
  let service: PhotoOrganizerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PhotoOrganizerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
