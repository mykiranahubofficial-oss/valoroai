import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhotoLayoutPreviewComponent } from './photo-layout-preview.component';

describe('PhotoLayoutPreviewComponent', () => {
  let component: PhotoLayoutPreviewComponent;
  let fixture: ComponentFixture<PhotoLayoutPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhotoLayoutPreviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PhotoLayoutPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
