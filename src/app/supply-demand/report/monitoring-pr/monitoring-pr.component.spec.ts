import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MonitoringPrComponent } from './monitoring-pr.component';

describe('MonitoringPrComponent', () => {
  let component: MonitoringPrComponent;
  let fixture: ComponentFixture<MonitoringPrComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MonitoringPrComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MonitoringPrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
