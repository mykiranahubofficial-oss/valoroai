import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RateValuationComponent } from './rate-valuation.component';

describe('RateValuationComponent', () => {
  let component: RateValuationComponent;
  let fixture: ComponentFixture<RateValuationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RateValuationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RateValuationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
