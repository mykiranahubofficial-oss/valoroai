import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableBuilderComponent } from './table-builder.component';

describe('TableBuilderComponent', () => {
  let component: TableBuilderComponent;
  let fixture: ComponentFixture<TableBuilderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableBuilderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
