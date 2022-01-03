import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActualProduction2Component } from './actual-production2.component';

describe('ActualProduction2Component', () => {
  let component: ActualProduction2Component;
  let fixture: ComponentFixture<ActualProduction2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActualProduction2Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActualProduction2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
