import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfficeRegistrationComponent } from './office-registration.component';

describe('OfficeRegistrationComponent', () => {
  let component: OfficeRegistrationComponent;
  let fixture: ComponentFixture<OfficeRegistrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OfficeRegistrationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OfficeRegistrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
