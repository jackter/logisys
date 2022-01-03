import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TrxCoaBalComponent } from './trx-coa-bal.component';

describe('TrxCoaBalComponent', () => {
  let component: TrxCoaBalComponent;
  let fixture: ComponentFixture<TrxCoaBalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrxCoaBalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrxCoaBalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
