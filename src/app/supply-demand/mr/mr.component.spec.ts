import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MRComponent } from './mr.component';

describe('MRComponent', () => {
  let component: MRComponent;
  let fixture: ComponentFixture<MRComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MRComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MRComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
