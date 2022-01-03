import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MonitoringGrComponent } from './monitoring-gr.component';

describe('MonitoringGrComponent', () => {
  let component: MonitoringGrComponent;
  let fixture: ComponentFixture<MonitoringGrComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MonitoringGrComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MonitoringGrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
