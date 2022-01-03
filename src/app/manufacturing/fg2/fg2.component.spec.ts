import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Fg2Component } from './fg2.component';

describe('Fg2Component', () => {
  let component: Fg2Component;
  let fixture: ComponentFixture<Fg2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Fg2Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Fg2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
