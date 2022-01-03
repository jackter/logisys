import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InvAgingArSummaryComponent } from './inv-aging-ar-summary.component';

describe('InvAgingArSummaryComponent', () => {
  let component: InvAgingArSummaryComponent;
  let fixture: ComponentFixture<InvAgingArSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvAgingArSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvAgingArSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
