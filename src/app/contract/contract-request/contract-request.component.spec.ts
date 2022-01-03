import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractRequestComponent } from './contract-request.component';

describe('ContractRequestComponent', () => {
  let component: ContractRequestComponent;
  let fixture: ComponentFixture<ContractRequestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContractRequestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContractRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
