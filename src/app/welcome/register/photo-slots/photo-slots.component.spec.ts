import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhotoSlotsComponent } from './photo-slots.component';

describe('PhotoSlotsComponent', () => {
  let component: PhotoSlotsComponent;
  let fixture: ComponentFixture<PhotoSlotsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhotoSlotsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PhotoSlotsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
