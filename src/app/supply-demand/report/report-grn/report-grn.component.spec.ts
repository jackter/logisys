import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportGrnComponent } from './report-grn.component';

describe('ReportGrnComponent', () => {
  let component: ReportGrnComponent;
  let fixture: ComponentFixture<ReportGrnComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportGrnComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportGrnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
