import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OipComponent } from './oip.component';

describe('OipComponent', () => {
  let component: OipComponent;
  let fixture: ComponentFixture<OipComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OipComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
