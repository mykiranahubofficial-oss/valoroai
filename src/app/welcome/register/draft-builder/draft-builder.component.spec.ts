import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DraftBuilderComponent } from './draft-builder.component';

describe('DraftBuilderComponent', () => {
  let component: DraftBuilderComponent;
  let fixture: ComponentFixture<DraftBuilderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DraftBuilderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DraftBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
