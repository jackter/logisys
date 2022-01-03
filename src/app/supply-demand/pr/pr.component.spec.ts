import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PRComponent } from './pr.component';

describe('PRComponent', () => {
  let component: PRComponent;
  let fixture: ComponentFixture<PRComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PRComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PRComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
