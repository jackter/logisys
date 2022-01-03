import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GIComponent } from './gi.component';

describe('GIComponent', () => {
  let component: GIComponent;
  let fixture: ComponentFixture<GIComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GIComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GIComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
