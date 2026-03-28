import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValuationTableComponent } from './valuation-table.component';

describe('ValuationTableComponent', () => {
  let component: ValuationTableComponent;
  let fixture: ComponentFixture<ValuationTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValuationTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ValuationTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
