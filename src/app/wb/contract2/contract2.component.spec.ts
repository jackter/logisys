import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Contract2Component } from './contract2.component';

describe('ContractComponent', () => {
  let component: Contract2Component;
  let fixture: ComponentFixture<Contract2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Contract2Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Contract2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
