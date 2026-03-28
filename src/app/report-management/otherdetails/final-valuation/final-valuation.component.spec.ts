import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinalValuationComponent } from './final-valuation.component';

describe('FinalValuationComponent', () => {
  let component: FinalValuationComponent;
  let fixture: ComponentFixture<FinalValuationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinalValuationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FinalValuationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
