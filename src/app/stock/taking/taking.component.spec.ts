import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TakingComponent } from './taking.component';

describe('TakingComponent', () => {
  let component: TakingComponent;
  let fixture: ComponentFixture<TakingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TakingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TakingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
