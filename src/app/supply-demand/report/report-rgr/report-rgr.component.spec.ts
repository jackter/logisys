import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportRgrComponent } from './report-rgr.component';

describe('ReportRgrComponent', () => {
  let component: ReportRgrComponent;
  let fixture: ComponentFixture<ReportRgrComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportRgrComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportRgrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
