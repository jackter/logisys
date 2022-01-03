import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OilMovementComponent } from './oil-movement.component';

describe('OilMovementComponent', () => {
  let component: OilMovementComponent;
  let fixture: ComponentFixture<OilMovementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OilMovementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OilMovementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
