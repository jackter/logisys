import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OsPoNullComponent } from './os-po-null.component';

describe('OsPoNullComponent', () => {
  let component: OsPoNullComponent;
  let fixture: ComponentFixture<OsPoNullComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OsPoNullComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OsPoNullComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
