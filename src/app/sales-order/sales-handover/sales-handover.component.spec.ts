import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesHandoverComponent } from './sales-handover.component';

describe('SalesHandoverComponent', () => {
  let component: SalesHandoverComponent;
  let fixture: ComponentFixture<SalesHandoverComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalesHandoverComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalesHandoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
