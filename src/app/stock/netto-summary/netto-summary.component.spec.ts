import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NettoSummaryComponent } from './netto-summary.component';

describe('NettoSummaryComponent', () => {
  let component: NettoSummaryComponent;
  let fixture: ComponentFixture<NettoSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NettoSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NettoSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
