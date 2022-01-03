import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesInvMiscComponent } from './sales-inv-misc.component';

describe('SalesInvMiscComponent', () => {
  let component: SalesInvMiscComponent;
  let fixture: ComponentFixture<SalesInvMiscComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SalesInvMiscComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SalesInvMiscComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
