import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceDPComponent } from './invoice-dp.component';

describe('InvoiceDPComponent', () => {
  let component: InvoiceDPComponent;
  let fixture: ComponentFixture<InvoiceDPComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvoiceDPComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoiceDPComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
