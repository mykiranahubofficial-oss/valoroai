import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminGateComponent } from './admin-gate.component';

describe('AdminGateComponent', () => {
  let component: AdminGateComponent;
  let fixture: ComponentFixture<AdminGateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminGateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminGateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
