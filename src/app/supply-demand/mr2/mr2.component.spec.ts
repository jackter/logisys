import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MR2Component } from './mr2.component';

describe('MR2Component', () => {
  let component: MR2Component;
  let fixture: ComponentFixture<MR2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MR2Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MR2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
