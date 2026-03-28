import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhotoOrganizerComponent } from './photo-organizer.component';

describe('PhotoOrganizerComponent', () => {
  let component: PhotoOrganizerComponent;
  let fixture: ComponentFixture<PhotoOrganizerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhotoOrganizerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PhotoOrganizerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
