import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportInventoryTbComponent } from './report-inventory-tb.component';

describe('ReportInventoryTbComponent', () => {
  let component: ReportInventoryTbComponent;
  let fixture: ComponentFixture<ReportInventoryTbComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportInventoryTbComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportInventoryTbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
