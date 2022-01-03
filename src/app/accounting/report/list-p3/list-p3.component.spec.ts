import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListP3Component } from './list-p3.component';

describe('ListP3Component', () => {
  let component: ListP3Component;
  let fixture: ComponentFixture<ListP3Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListP3Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListP3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
