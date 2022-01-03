import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractInvoiceDpComponent } from './contract-invoice-dp.component';

describe('ContractInvoiceDpComponent', () => {
  let component: ContractInvoiceDpComponent;
  let fixture: ComponentFixture<ContractInvoiceDpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContractInvoiceDpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContractInvoiceDpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
