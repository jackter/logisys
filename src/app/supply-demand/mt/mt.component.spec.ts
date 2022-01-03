import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MTComponent } from './mt.component';

describe('MTComponent', () => {
  let component: MTComponent;
  let fixture: ComponentFixture<MTComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MTComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MTComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
