import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesInvDpComponent } from './sales-inv-dp.component';

describe('SalesInvDpComponent', () => {
  let component: SalesInvDpComponent;
  let fixture: ComponentFixture<SalesInvDpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalesInvDpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalesInvDpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
