import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TrialBalanceSummaryComponent } from './trial-balance-summary.component';

describe('TrialBalanceSummaryComponent', () => {
  let component: TrialBalanceSummaryComponent;
  let fixture: ComponentFixture<TrialBalanceSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrialBalanceSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrialBalanceSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
