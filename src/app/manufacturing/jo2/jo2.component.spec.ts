import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JO2Component } from './jo2.component';

describe('JO2Component', () => {
  let component: JO2Component;
  let fixture: ComponentFixture<JO2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JO2Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JO2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
