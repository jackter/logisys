import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportMRComponent } from './report-mr.component';

describe('ReportMRComponent', () => {
  let component: ReportMRComponent;
  let fixture: ComponentFixture<ReportMRComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportMRComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportMRComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
