import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportWoHistoryComponent } from './report-wo-history.component';

describe('ReportWoHistoryComponent', () => {
  let component: ReportWoHistoryComponent;
  let fixture: ComponentFixture<ReportWoHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportWoHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportWoHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
