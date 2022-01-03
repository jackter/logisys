import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActualProductionComponent } from './actual-production.component';

describe('ActualProductionComponent', () => {
  let component: ActualProductionComponent;
  let fixture: ComponentFixture<ActualProductionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActualProductionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActualProductionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
