import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OsPostingGiComponent } from './os-posting-gi.component';

describe('OsPostingGiComponent', () => {
  let component: OsPostingGiComponent;
  let fixture: ComponentFixture<OsPostingGiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OsPostingGiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OsPostingGiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
