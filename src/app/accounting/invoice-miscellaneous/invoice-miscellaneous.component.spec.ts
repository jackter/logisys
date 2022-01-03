import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceMiscellaneousComponent } from './invoice-miscellaneous.component';

describe('InvoiceMiscellaneousComponent', () => {
  let component: InvoiceMiscellaneousComponent;
  let fixture: ComponentFixture<InvoiceMiscellaneousComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvoiceMiscellaneousComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoiceMiscellaneousComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
