import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AreaCalculationComponent } from './area-calculation.component';

describe('AreaCalculationComponent', () => {
  let component: AreaCalculationComponent;
  let fixture: ComponentFixture<AreaCalculationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AreaCalculationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AreaCalculationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
