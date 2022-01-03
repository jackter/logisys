import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InvAgingArComponent } from './inv-aging-ar.component';

describe('InvAgingArComponent', () => {
  let component: InvAgingArComponent;
  let fixture: ComponentFixture<InvAgingArComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvAgingArComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvAgingArComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
