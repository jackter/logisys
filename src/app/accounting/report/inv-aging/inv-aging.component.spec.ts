import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InvAgingComponent } from './inv-aging.component';

describe('InvAgingComponent', () => {
  let component: InvAgingComponent;
  let fixture: ComponentFixture<InvAgingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvAgingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvAgingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
