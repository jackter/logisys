import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BankReceiveComponent } from './bank-receive.component';

describe('BankReceiveComponent', () => {
  let component: BankReceiveComponent;
  let fixture: ComponentFixture<BankReceiveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BankReceiveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BankReceiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
