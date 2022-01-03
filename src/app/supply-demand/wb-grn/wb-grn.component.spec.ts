import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WbGrnComponent } from './wb-grn.component';

describe('WbGrnComponent', () => {
  let component: WbGrnComponent;
  let fixture: ComponentFixture<WbGrnComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WbGrnComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WbGrnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
