import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InvControlComponent } from './inv-control.component';

describe('InvControlComponent', () => {
  let component: InvControlComponent;
  let fixture: ComponentFixture<InvControlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvControlComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
