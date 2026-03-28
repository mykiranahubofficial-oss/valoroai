import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherdetailsComponent } from './otherdetails.component';

describe('OtherdetailsComponent', () => {
  let component: OtherdetailsComponent;
  let fixture: ComponentFixture<OtherdetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OtherdetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OtherdetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
