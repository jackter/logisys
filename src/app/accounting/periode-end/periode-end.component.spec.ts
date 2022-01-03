import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PeriodeEndComponent } from './periode-end.component';

describe('PeriodeEndComponent', () => {
  let component: PeriodeEndComponent;
  let fixture: ComponentFixture<PeriodeEndComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PeriodeEndComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PeriodeEndComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
