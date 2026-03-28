import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportCreationComponent } from './report-creation.component';

describe('ReportCreationComponent', () => {
  let component: ReportCreationComponent;
  let fixture: ComponentFixture<ReportCreationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportCreationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportCreationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
