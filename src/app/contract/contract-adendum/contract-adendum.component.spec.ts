import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractAdendumComponent } from './contract-adendum.component';

describe('ContractAdendumComponent', () => {
  let component: ContractAdendumComponent;
  let fixture: ComponentFixture<ContractAdendumComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContractAdendumComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContractAdendumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
