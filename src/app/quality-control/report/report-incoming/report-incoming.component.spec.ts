import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportIncomingComponent } from './report-incoming.component';

describe('ReportIncomingComponent', () => {
  let component: ReportIncomingComponent;
  let fixture: ComponentFixture<ReportIncomingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportIncomingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportIncomingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
