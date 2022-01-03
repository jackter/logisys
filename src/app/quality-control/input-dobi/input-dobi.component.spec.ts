import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InputDobiComponent } from './input-dobi.component';

describe('InputDobiComponent', () => {
  let component: InputDobiComponent;
  let fixture: ComponentFixture<InputDobiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InputDobiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InputDobiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
