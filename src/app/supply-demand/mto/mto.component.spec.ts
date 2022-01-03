import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MtoComponent } from './mto.component';

describe('MtoComponent', () => {
  let component: MtoComponent;
  let fixture: ComponentFixture<MtoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MtoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MtoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
