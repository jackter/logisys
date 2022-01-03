import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JobAlocationComponent } from './job-alocation.component';

describe('JobAlocationComponent', () => {
  let component: JobAlocationComponent;
  let fixture: ComponentFixture<JobAlocationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JobAlocationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JobAlocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
