import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarcketPhotoComponent } from './marcket-photo.component';

describe('MarcketPhotoComponent', () => {
  let component: MarcketPhotoComponent;
  let fixture: ComponentFixture<MarcketPhotoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarcketPhotoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarcketPhotoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
