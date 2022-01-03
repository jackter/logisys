import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InvAgingSummaryComponent } from './inv-aging-summary.component';

describe('InvAgingSummaryComponent', () => {
  let component: InvAgingSummaryComponent;
  let fixture: ComponentFixture<InvAgingSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvAgingSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvAgingSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
