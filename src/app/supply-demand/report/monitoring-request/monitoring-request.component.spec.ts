import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MonitoringRequestComponent } from './monitoring-request.component';

describe('MonitoringRequestComponent', () => {
  let component: MonitoringRequestComponent;
  let fixture: ComponentFixture<MonitoringRequestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MonitoringRequestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MonitoringRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
