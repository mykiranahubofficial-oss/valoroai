import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SlotphotouploaderComponent } from './slotphotouploader.component';

describe('SlotphotouploaderComponent', () => {
  let component: SlotphotouploaderComponent;
  let fixture: ComponentFixture<SlotphotouploaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SlotphotouploaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SlotphotouploaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
