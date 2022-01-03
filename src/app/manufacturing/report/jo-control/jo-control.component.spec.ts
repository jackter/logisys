import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JoControlComponent } from './jo-control.component';

describe('JoControlComponent', () => {
  let component: JoControlComponent;
  let fixture: ComponentFixture<JoControlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JoControlComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JoControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
