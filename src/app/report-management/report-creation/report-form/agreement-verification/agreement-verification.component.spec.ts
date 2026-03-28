import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgreementVerificationComponent } from './agreement-verification.component';

describe('AgreementVerificationComponent', () => {
  let component: AgreementVerificationComponent;
  let fixture: ComponentFixture<AgreementVerificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgreementVerificationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgreementVerificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
