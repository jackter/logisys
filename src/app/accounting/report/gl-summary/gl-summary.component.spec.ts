import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GlSummaryComponent } from './gl-summary.component';

describe('GlSummaryComponent', () => {
  let component: GlSummaryComponent;
  let fixture: ComponentFixture<GlSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GlSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GlSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
