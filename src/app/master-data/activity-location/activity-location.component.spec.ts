import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityLocationComponent } from './activity-location.component';

describe('ActivityLocationComponent', () => {
  let component: ActivityLocationComponent;
  let fixture: ComponentFixture<ActivityLocationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivityLocationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivityLocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
