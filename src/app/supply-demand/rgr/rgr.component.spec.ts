import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RGRComponent } from './rgr.component';

describe('RGRComponent', () => {
  let component: RGRComponent;
  let fixture: ComponentFixture<RGRComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RGRComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RGRComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
