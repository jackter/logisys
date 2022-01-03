import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesInvComponent } from './sales-inv.component';

describe('SalesInvComponent', () => {
  let component: SalesInvComponent;
  let fixture: ComponentFixture<SalesInvComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalesInvComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalesInvComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
