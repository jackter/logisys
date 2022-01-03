import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JOComponent } from './jo.component';

describe('JOComponent', () => {
  let component: JOComponent;
  let fixture: ComponentFixture<JOComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JOComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JOComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
