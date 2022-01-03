import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RGIComponent } from './rgi.component';

describe('RGIComponent', () => {
  let component: RGIComponent;
  let fixture: ComponentFixture<RGIComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RGIComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RGIComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
