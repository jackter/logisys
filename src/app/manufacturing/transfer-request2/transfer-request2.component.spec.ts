import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferRequest2Component } from './transfer-request2.component';

describe('TransferRequest2Component', () => {
  let component: TransferRequest2Component;
  let fixture: ComponentFixture<TransferRequest2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransferRequest2Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransferRequest2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
