import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MonitoringPoComponent } from './monitoring-po.component';

describe('MonitoringPoComponent', () => {
  let component: MonitoringPoComponent;
  let fixture: ComponentFixture<MonitoringPoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MonitoringPoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MonitoringPoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
