import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandOtherdetailsComponent } from './land-otherdetails.component';

describe('LandOtherdetailsComponent', () => {
  let component: LandOtherdetailsComponent;
  let fixture: ComponentFixture<LandOtherdetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandOtherdetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LandOtherdetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
