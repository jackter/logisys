import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OsPoPartialComponent } from './os-po-partial.component';

describe('OsPoPartialComponent', () => {
  let component: OsPoPartialComponent;
  let fixture: ComponentFixture<OsPoPartialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OsPoPartialComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OsPoPartialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
